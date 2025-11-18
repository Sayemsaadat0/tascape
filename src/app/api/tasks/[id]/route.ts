import { NextResponse } from "next/server"
import "@/DB/db"
import { authenticateRequest } from "@/lib/auth"
import { Task } from "@/models/Task"
import { Project } from "@/models/Project"
import { Team } from "@/models/Team"
import { Member } from "@/models/Member"
import { Activity } from "@/models/Activity"
import { Types } from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const extractString = (value: unknown) => {
  if (typeof value !== "string") return ""
  return value.trim()
}

const resolveObjectId = (value: string) => {
  if (!value || !Types.ObjectId.isValid(value)) return null
  return new Types.ObjectId(value)
}

const adjustMemberUsedCapacity = async (
  memberId: Types.ObjectId | string | null | undefined,
  adjustment: number
) => {
  if (!memberId || !adjustment) return

  const resolvedId =
    typeof memberId === "string" ? memberId : memberId.toString()

  if (!resolvedId || !Types.ObjectId.isValid(resolvedId)) return

  const memberDoc = await Member.findById(resolvedId)
  if (!memberDoc) return

  const currentUsed = memberDoc.used_capacity ?? 0
  const capacityLimit = memberDoc.capacity ?? 0

  let nextValue = currentUsed + adjustment
  if (Number.isNaN(nextValue)) {
    nextValue = currentUsed
  }

  if (nextValue < 0) {
    nextValue = 0
  } else if (capacityLimit > 0 && nextValue > capacityLimit) {
    nextValue = capacityLimit
  }

  if (nextValue === currentUsed) return

  memberDoc.used_capacity = nextValue
  await memberDoc.save()
}

// ======================
// GET /api/tasks/[id]
// - Get a single task by ID
// ======================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const { id } = await params
    const taskObjectId = resolveObjectId(id)
    
    if (!taskObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid task identifier" },
        { status: 400 }
      )
    }

    const task = await Task.findById(taskObjectId)
      .populate("assigned_member", "name email")
      .populate("member_id")
      .populate("project_id", "name")

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      )
    }

    // Verify task ownership
    if (task.user_id !== authResult.payload.userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Task does not belong to you" },
        { status: 403 }
      )
    }

    // Get project info
    const project = await Project.findById(task.project_id)
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      )
    }

    const projectIdValue =
      project._id instanceof Types.ObjectId
        ? project._id.toString()
        : String(project._id)

    const projectInfo = {
      _id: projectIdValue,
      name: project.name,
      team_id:
        project.team_id instanceof Types.ObjectId
          ? project.team_id.toString()
          : String(project.team_id),
      user_id: project.user_id,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }

    // Get assigned_member_info from populated member_id
    let assignedMemberInfo: any = null
    const taskObj = task.toObject()
    if (taskObj.member_id && typeof taskObj.member_id === "object") {
      const member = taskObj.member_id as any
      assignedMemberInfo = {
        _id: member._id,
        name: member.name,
        role: member.role,
        capacity: member.capacity,
        used_capacity: member.used_capacity,
      }
    }

    const response = {
      ...taskObj,
      project_id: taskObj.project_id?.toString() || task.project_id.toString(),
      project_Info: projectInfo,
      assigned_member_info: assignedMemberInfo,
    }

    return NextResponse.json(
      { success: true, message: "Task retrieved", result: response },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching task", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

// ======================
// PATCH /api/tasks/[id]
// - Update a task
// ======================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const [{ id }, body] = await Promise.all([params, request.json()])
    const { title, description, assigned_member, project_id, priority, status } = body ?? {}

    const taskObjectId = resolveObjectId(id)
    if (!taskObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid task identifier" },
        { status: 400 }
      )
    }

    // Check if task exists and belongs to authenticated user
    const existingTask = await Task.findById(taskObjectId)
    if (!existingTask) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      )
    }

    // Verify task ownership
    if (existingTask.user_id !== authResult.payload.userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Task does not belong to you" },
        { status: 403 }
      )
    }

    const updatePayload: Record<string, unknown> = {}

    // Validate and update title
    if (typeof title !== "undefined") {
      if (!title || typeof title !== "string" || !title.trim()) {
        return NextResponse.json(
          { success: false, message: "Title must be a non-empty string" },
          { status: 400 }
        )
      }
      updatePayload.title = title.trim()
    }

    // Validate and update description
    if (typeof description !== "undefined") {
      updatePayload.description = description ? String(description).trim() : undefined
    }

    // Validate and update project_id
    let projectObjectId: Types.ObjectId | null = null
    let project: any = null
    let populatedTeam: any = null
    let projectInfo: any = null

    if (typeof project_id !== "undefined") {
      const resolvedProjectId = extractString(project_id)
      if (!resolvedProjectId) {
        return NextResponse.json(
          { success: false, message: "project_id must be provided when supplied" },
          { status: 400 }
        )
      }

      projectObjectId = resolveObjectId(resolvedProjectId)
      if (!projectObjectId) {
        return NextResponse.json(
          { success: false, message: "Invalid project_id" },
          { status: 400 }
        )
      }

      // Verify project exists and belongs to authenticated user
      project = await Project.findById(projectObjectId)
      if (!project) {
        return NextResponse.json(
          { success: false, message: "Project not found" },
          { status: 404 }
        )
      }

      // Verify project ownership
      if (project.user_id !== authResult.payload.userId) {
        return NextResponse.json(
          { success: false, message: "Forbidden: Project does not belong to you" },
          { status: 403 }
        )
      }

      updatePayload.project_id = projectObjectId

      // Get team separately if needed
      if (typeof assigned_member !== "undefined" && assigned_member) {
        const team = await Team.findById(project.team_id).populate("members")
        if (team) {
          populatedTeam = team.toObject()
        }
      }

      // Simple project info
      projectInfo = {
        _id: project._id.toString(),
        name: project.name,
        team_id: project.team_id.toString(),
        user_id: project.user_id,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }
    } else {
      // If project_id is not being updated, get existing project info
      const existingProject = await Project.findById(existingTask.project_id)
      if (existingProject) {
        // Get team separately if needed for member validation
        if (typeof assigned_member !== "undefined" && assigned_member) {
          const team = await Team.findById(existingProject.team_id).populate("members")
          if (team) {
            populatedTeam = team.toObject()
          }
        }

        projectInfo = {
          _id:
            existingProject._id instanceof Types.ObjectId
              ? existingProject._id.toString()
              : String(existingProject._id),
          name: existingProject.name,
          team_id:
            existingProject.team_id instanceof Types.ObjectId
              ? existingProject.team_id.toString()
              : String(existingProject.team_id),
          user_id: existingProject.user_id,
          createdAt: existingProject.createdAt,
          updatedAt: existingProject.updatedAt,
        }
        projectObjectId = existingTask.project_id
      }
    }

    // Validate and update priority
    if (typeof priority !== "undefined") {
      const validPriorities = ["Low", "Medium", "High"]
      if (priority && !validPriorities.includes(priority)) {
        return NextResponse.json(
          {
            success: false,
            message: `Priority must be one of: ${validPriorities.join(", ")}`,
          },
          { status: 400 }
        )
      }
      updatePayload.priority = priority || "Medium"
    }

    // Validate and update status
    if (typeof status !== "undefined") {
      const validStatuses = ["Pending", "In Progress", "Done"]
      if (status && !validStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: `Status must be one of: ${validStatuses.join(", ")}`,
          },
          { status: 400 }
        )
      }
      updatePayload.status = status || "Pending"
    }

    // Validate and update assigned_member (now accepts member ObjectId)
    let assignedMemberInfo: any = null
    const oldMemberId = existingTask.member_id
    let newMemberId: Types.ObjectId | null = null

    if (typeof assigned_member !== "undefined") {
      if (assigned_member === null || assigned_member === "") {
        // Allow clearing assigned_member - decrement old member's used_capacity
        updatePayload.member_id = undefined
        assignedMemberInfo = null
        
        if (oldMemberId) {
          await adjustMemberUsedCapacity(oldMemberId, -1)
        }
      } else {
        const resolvedAssignedMember = extractString(assigned_member)
        if (!resolvedAssignedMember) {
          return NextResponse.json(
            { success: false, message: "assigned_member must be a valid member ID (ObjectId)" },
            { status: 400 }
          )
        }

        newMemberId = resolveObjectId(resolvedAssignedMember)
        if (!newMemberId) {
          return NextResponse.json(
            { success: false, message: "Invalid member ID format" },
            { status: 400 }
          )
        }

        // Get project team if not already loaded
        if (!populatedTeam && projectObjectId) {
          const projectForValidation = await Project.findById(projectObjectId)
          if (projectForValidation) {
            const team = await Team.findById(projectForValidation.team_id).populate("members")
            if (team) {
              populatedTeam = team.toObject()
            }
          }
        }

        // Validate that the member exists and belongs to the user
        const member = await Member.findOne({
          _id: newMemberId,
          user_id: authResult.payload.userId,
        })

        if (!member) {
          return NextResponse.json(
            { success: false, message: "Member not found or does not belong to you" },
            { status: 404 }
          )
        }

        // Validate that the member is in the project's team
        if (!populatedTeam || !populatedTeam.members || !Array.isArray(populatedTeam.members)) {
          return NextResponse.json(
            { success: false, message: "Project team has no members" },
            { status: 400 }
          )
        }

        const teamMemberIds = populatedTeam.members.map((m: any) => 
          m._id ? m._id.toString() : m.toString()
        )
        
        if (!teamMemberIds.includes(newMemberId.toString())) {
          return NextResponse.json(
            { success: false, message: "Member is not part of the project's team" },
            { status: 400 }
          )
        }

        // Check if member has available capacity (only if it's a different member)
        if (oldMemberId?.toString() !== newMemberId.toString() && member.used_capacity >= member.capacity) {
          return NextResponse.json(
            { success: false, message: "Member has reached maximum capacity" },
            { status: 400 }
          )
        }

        // Update member_id field
        updatePayload.member_id = newMemberId

        // Handle used_capacity updates
        if (oldMemberId && oldMemberId.toString() !== newMemberId.toString()) {
          await adjustMemberUsedCapacity(oldMemberId, -1)
          await adjustMemberUsedCapacity(newMemberId, 1)
        } else if (!oldMemberId) {
          await adjustMemberUsedCapacity(newMemberId, 1)
        }
        // If same member, no capacity change needed

        // Get updated member info for response
        const updatedMember = await Member.findById(newMemberId)
        if (updatedMember) {
          assignedMemberInfo = {
            _id: updatedMember._id,
            name: updatedMember.name,
            role: updatedMember.role,
            capacity: updatedMember.capacity,
            used_capacity: updatedMember.used_capacity,
          }
        }
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      )
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      taskObjectId,
      { $set: updatePayload },
      { new: true }
    )
      .populate("assigned_member", "name email")
      .populate("member_id")
      .populate("project_id", "name")

    if (!updatedTask) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      )
    }

    // Log activity for task reassignment
    if (typeof assigned_member !== "undefined") {
      const oldMemberIdStr = oldMemberId?.toString() || null
      const newMemberIdStr = newMemberId?.toString() || null
      
      // Only log if there's an actual change in assignment
      if (oldMemberIdStr !== newMemberIdStr) {
        let fromMemberName = "Unassigned"
        let toMemberName = "Unassigned"
        
        if (oldMemberIdStr) {
          const oldMember = await Member.findById(oldMemberIdStr)
          if (oldMember) {
            fromMemberName = oldMember.name
          }
        }
        
        if (newMemberIdStr) {
          const newMember = await Member.findById(newMemberIdStr)
          if (newMember) {
            toMemberName = newMember.name
          }
        }
        
        const activityMessage = `Task "${updatedTask.title}" reassigned from ${fromMemberName} to ${toMemberName}.`
        
        await Activity.create({
          activity_message: activityMessage,
          task_name: updatedTask.title,
          assigned_from_name: fromMemberName,
          assigned_to_name: toMemberName,
          task_id: updatedTask._id,
          project_id: updatedTask.project_id,
          user_id: authResult.payload.userId,
        })
      }
    }

    // If assigned_member_info is not set but task has member_id, get it from populated member
    if (!assignedMemberInfo && updatedTask.member_id) {
      const taskObj = updatedTask.toObject()
      if (taskObj.member_id && typeof taskObj.member_id === "object") {
        const member = taskObj.member_id as any
        assignedMemberInfo = {
          _id: member._id,
          name: member.name,
          role: member.role,
          capacity: member.capacity,
          used_capacity: member.used_capacity,
        }
      }
    }

    // Get project info if not already set
    if (!projectInfo && updatedTask.project_id) {
      const projectForResponse = await Project.findById(updatedTask.project_id)
      if (projectForResponse) {
        projectInfo = {
          _id:
            projectForResponse._id instanceof Types.ObjectId
              ? projectForResponse._id.toString()
              : String(projectForResponse._id),
          name: projectForResponse.name,
          team_id:
            projectForResponse.team_id instanceof Types.ObjectId
              ? projectForResponse.team_id.toString()
              : String(projectForResponse.team_id),
          user_id: projectForResponse.user_id,
          createdAt: projectForResponse.createdAt,
          updatedAt: projectForResponse.updatedAt,
        }
      }
    }

    const taskObj = updatedTask.toObject()
    const response = {
      ...taskObj,
      project_id: taskObj.project_id?.toString() || updatedTask.project_id.toString(),
      project_Info: projectInfo,
      assigned_member_info: assignedMemberInfo,
    }

    return NextResponse.json(
      { success: true, message: "Task updated successfully", result: response },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating task", error)
    return NextResponse.json(
      { success: false, message: "Failed to update task" },
      { status: 500 }
    )
  }
}

// ======================
// DELETE /api/tasks/[id]
// - Delete a task
// ======================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const { id } = await params
    const taskObjectId = resolveObjectId(id)
    
    if (!taskObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid task identifier" },
        { status: 400 }
      )
    }

    // Check if task exists and belongs to authenticated user before deleting
    const task = await Task.findById(taskObjectId)
    
    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      )
    }

    // Verify task ownership
    if (task.user_id !== authResult.payload.userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Task does not belong to you" },
        { status: 403 }
      )
    }

    // Decrement member's used_capacity if task was assigned to a member
    if (task.member_id) {
      await adjustMemberUsedCapacity(task.member_id, -1)
    }

    // Delete the task
    await Task.findByIdAndDelete(taskObjectId)

    return NextResponse.json(
      { 
        success: true, 
        message: "Task deleted successfully",
        result: {
          _id:
            task._id instanceof Types.ObjectId
              ? task._id.toString()
              : String(task._id),
          title: task.title,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting task", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete task" },
      { status: 500 }
    )
  }
}

