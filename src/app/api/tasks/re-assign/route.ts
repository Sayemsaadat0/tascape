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

const resolveObjectId = (value: string) => {
  if (!value || !Types.ObjectId.isValid(value)) return null
  return new Types.ObjectId(value)
}

const extractString = (value: unknown) => {
  if (typeof value !== "string") return ""
  return value.trim()
}

// ======================
// POST /api/tasks/re-assign
// - Re-assign tasks to balance member capacity
// - Keeps High priority tasks with current assignee
// - Moves Low and Medium priority tasks from overloaded members to members with free capacity
// - Requires project_id in request body
// ======================
export async function POST(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const body = await request.json()
    const projectIdParam = extractString(body.project_id)

    if (!projectIdParam) {
      return NextResponse.json(
        { success: false, message: "project_id is required in request body" },
        { status: 400 }
      )
    }

    const projectObjectId = resolveObjectId(projectIdParam)

    if (!projectObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid project identifier" },
        { status: 400 }
      )
    }

    // Verify project exists and belongs to authenticated user
    const project = await Project.findById(projectObjectId)

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

    // Get team with members separately
    const team = await Team.findById(project.team_id).populate("members")
    if (!team) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      )
    }

    const populatedTeam = team.toObject()
    if (!populatedTeam.members || !Array.isArray(populatedTeam.members) || populatedTeam.members.length === 0) {
      return NextResponse.json(
        { success: false, message: "Project team has no members" },
        { status: 400 }
      )
    }

    // Get all tasks for this project
    const tasks = await Task.find({
      project_id: projectObjectId,
      user_id: authResult.payload.userId,
    }).populate("member_id")

    const totalTasks = tasks.length

    // Get member details from team
    const memberDetails: Map<string, any> = new Map()

    for (const teamMember of populatedTeam.members) {
      const memberId = teamMember._id ? teamMember._id.toString() : teamMember.toString()
      const member = await Member.findById(memberId)
      if (member) {
        memberDetails.set(memberId, member)
      }
    }

    // Track current used_capacity as we reassign
    const currentUsedCapacity = new Map<string, number>()
    for (const [memberId, member] of memberDetails.entries()) {
      currentUsedCapacity.set(memberId, member.used_capacity)
    }

    // Identify members with free capacity (used_capacity < capacity)
    const availableMembers: Array<{
      memberId: string
      member: any
      used_capacity: number
      capacity: number
      free_capacity: number
    }> = []

    for (const [memberId, member] of memberDetails.entries()) {
      const memberObj = member.toObject()
      const freeCapacity = memberObj.capacity - memberObj.used_capacity
      
      // Only track members with free capacity (not overloaded)
      if (memberObj.used_capacity < memberObj.capacity) {
        availableMembers.push({
          memberId,
          member: memberObj,
          used_capacity: memberObj.used_capacity,
          capacity: memberObj.capacity,
          free_capacity: freeCapacity,
        })
      }
    }

    // Sort available members by free capacity (descending - most free capacity first)
    availableMembers.sort((a, b) => b.free_capacity - a.free_capacity)

    // Reassign tasks to balance workload
    const reassignments: Array<{
      taskId: string
      taskTitle: string
      fromAssignee: { id: string; name: string }
      toAssignee: { id: string; name: string }
    }> = []

    // Get all tasks with their current assignees
    const tasksWithAssignees = tasks.map((task) => {
      let currentMemberId: string | null = null
      if (task.member_id) {
        if (typeof task.member_id === "object" && task.member_id._id) {
          currentMemberId = task.member_id._id.toString()
        } else if (typeof task.member_id === "object" && task.member_id.toString) {
          currentMemberId = task.member_id.toString()
        } else if (typeof task.member_id === "string") {
          currentMemberId = task.member_id
        }
      }
      return { task, currentMemberId }
    })

    // Helper function to find member with most free capacity
    const findBestTargetMember = () => {
      if (availableMembers.length === 0) return null
      
      availableMembers.sort((a, b) => {
        const aFree = a.capacity - (currentUsedCapacity.get(a.memberId) || 0)
        const bFree = b.capacity - (currentUsedCapacity.get(b.memberId) || 0)
        return bFree - aFree // Most free capacity first
      })

      const targetMember = availableMembers[0]
      const targetUsed = currentUsedCapacity.get(targetMember.memberId) || 0
      
      if (targetUsed < targetMember.capacity) {
        return targetMember
      }
      return null
    }

    // Helper function to reassign a task
    const reassignTask = async (
      task: any,
      fromMemberId: string | null,
      toMemberId: string
    ) => {
      const fromMember = fromMemberId ? memberDetails.get(fromMemberId) : null
      const toMember = memberDetails.get(toMemberId)

      // Update task's assigned member
      await Task.findByIdAndUpdate(task._id, {
        $set: { member_id: new Types.ObjectId(toMemberId) },
      })

      // Decrement old member's used_capacity if existed
      if (fromMemberId) {
        const fromMemberCurrentUsed = currentUsedCapacity.get(fromMemberId) || 0
        const newFromMemberUsed = Math.max(0, fromMemberCurrentUsed - 1)
        await Member.findByIdAndUpdate(fromMemberId, {
          $set: { used_capacity: newFromMemberUsed },
        })
        currentUsedCapacity.set(fromMemberId, newFromMemberUsed)
      }

      // Increment new member's used_capacity
      const toMemberUsed = currentUsedCapacity.get(toMemberId) || 0
      const newToMemberUsed = toMemberUsed + 1
      await Member.findByIdAndUpdate(toMemberId, {
        $set: { used_capacity: newToMemberUsed },
      })
      currentUsedCapacity.set(toMemberId, newToMemberUsed)

      // Update available members list
      const targetMember = availableMembers.find(m => m.memberId === toMemberId)
      if (targetMember) {
        targetMember.used_capacity = newToMemberUsed
        targetMember.free_capacity = targetMember.capacity - newToMemberUsed
      }

      const fromName = fromMember?.name || "Unassigned"
      const toName = toMember?.name || "Unknown"

      // Log activity only if there's an actual reassignment (from != to)
      if (fromMemberId !== toMemberId) {
        const activityMessage = `Task "${task.title}" reassigned from ${fromName} to ${toName}.`
        
        await Activity.create({
          activity_message: activityMessage,
          task_name: task.title,
          assigned_from_name: fromName,
          assigned_to_name: toName,
          task_id: task._id,
          project_id: projectObjectId,
          user_id: authResult.payload.userId,
        })
      }

      reassignments.push({
        taskId: task._id.toString(),
        taskTitle: task.title,
        fromAssignee: {
          id: fromMemberId || "unassigned",
          name: fromName,
        },
        toAssignee: {
          id: toMemberId,
          name: toName,
        },
      })
    }

    // Step 1: Handle overloaded members first
    for (const { task, currentMemberId } of tasksWithAssignees) {
      if (!currentMemberId) continue

      const isOverloaded = 
        currentUsedCapacity.get(currentMemberId)! >= 
        memberDetails.get(currentMemberId)!.capacity

      if (isOverloaded) {
        const targetMember = findBestTargetMember()
        if (targetMember) {
          await reassignTask(task, currentMemberId, targetMember.memberId)
          continue
        }
      }
    }

    // Step 2: Balance workload - redistribute tasks to members with no/few tasks
    // Calculate average tasks per member
    const assignedTasksCount = tasksWithAssignees.filter(t => t.currentMemberId).length
    const membersWithCapacity = Array.from(memberDetails.keys())
    const avgTasksPerMember = assignedTasksCount > 0 ? assignedTasksCount / membersWithCapacity.length : 0

    // Find members with many tasks and members with few/no tasks
    const membersWithManyTasks: Array<{ memberId: string; taskCount: number }> = []
    const membersWithFewTasks: Array<{ memberId: string; taskCount: number; capacity: number }> = []

    for (const memberId of membersWithCapacity) {
      const taskCount = currentUsedCapacity.get(memberId) || 0
      const member = memberDetails.get(memberId)!
      
      if (taskCount > avgTasksPerMember + 0.5) {
        // Has significantly more than average
        membersWithManyTasks.push({ memberId, taskCount })
      } else if (taskCount === 0 || (taskCount < avgTasksPerMember && taskCount < member.capacity)) {
        // Has no tasks or fewer than average and has capacity
        membersWithFewTasks.push({ memberId, taskCount, capacity: member.capacity })
      }
    }

    // Sort: members with many tasks (descending), members with few tasks (ascending)
    membersWithManyTasks.sort((a, b) => b.taskCount - a.taskCount)
    membersWithFewTasks.sort((a, b) => a.taskCount - b.taskCount)

    // Redistribute: move tasks from members with many to members with few
    for (const { memberId: fromMemberId, taskCount: initialFromTaskCount } of membersWithManyTasks) {
      let fromTaskCount = initialFromTaskCount
      
      // Try to move tasks to members with few/no tasks
      for (const { memberId: toMemberId, taskCount: initialToTaskCount, capacity } of membersWithFewTasks) {
        let toTaskCount = initialToTaskCount
        
        // Move tasks to ensure target member gets at least 1 task, then balance
        // Priority: members with 0 tasks should get at least 1 task
        const targetMinTasks = initialToTaskCount === 0 ? 1 : Math.ceil(avgTasksPerMember)
        
        while (fromTaskCount > toTaskCount && toTaskCount < targetMinTasks) {
          const toMemberUsed = currentUsedCapacity.get(toMemberId) || 0
          
          // Check if target member has capacity
          if (toMemberUsed >= capacity) {
            break // Target member is full
          }
          
          // Get a task assigned to fromMember that hasn't been reassigned yet
          const taskToMove = tasksWithAssignees.find((t) => {
            const taskIdValue =
              t.task._id instanceof Types.ObjectId
                ? t.task._id.toString()
                : String(t.task._id)
            return (
              t.currentMemberId === fromMemberId &&
              !reassignments.some(
                (r) =>
                  r.taskId === taskIdValue &&
                  r.fromAssignee.id !== r.toAssignee.id
              )
            )
          })

          if (!taskToMove) {
            break // No more tasks to move
          }

          // Reassign the task
          await reassignTask(taskToMove.task, fromMemberId, toMemberId)
          
          // Update counts
          fromTaskCount--
          toTaskCount++
          
          // Update the arrays for next iteration
          const fromIdx = membersWithManyTasks.findIndex(m => m.memberId === fromMemberId)
          if (fromIdx >= 0) {
            membersWithManyTasks[fromIdx].taskCount = fromTaskCount
          }
          const toIdx = membersWithFewTasks.findIndex(m => m.memberId === toMemberId)
          if (toIdx >= 0) {
            membersWithFewTasks[toIdx].taskCount = toTaskCount
          }
          
          // Stop if target member now has at least the minimum required tasks
          if (toTaskCount >= targetMinTasks) {
            break
          }
          
          // Stop if fromMember is now balanced (not significantly above average)
          if (fromTaskCount <= Math.ceil(avgTasksPerMember)) {
            break
          }
        }
        
        // If fromMember is now balanced, move to next member with many tasks
        if (fromTaskCount <= Math.ceil(avgTasksPerMember)) {
          break
        }
      }
    }

    // Add remaining tasks that weren't reassigned
    for (const { task, currentMemberId } of tasksWithAssignees) {
      const taskIdValue =
        task._id instanceof Types.ObjectId ? task._id.toString() : String(task._id)
      const alreadyReassigned = reassignments.some(
        (r) => r.taskId === taskIdValue && r.fromAssignee.id !== r.toAssignee.id
      )
      
      if (!alreadyReassigned) {
        const fromMember = currentMemberId ? memberDetails.get(currentMemberId) : null
        reassignments.push({
          taskId: taskIdValue,
          taskTitle: task.title,
          fromAssignee: {
            id: currentMemberId || "unassigned",
            name: fromMember?.name || "Unassigned",
          },
          toAssignee: {
            id: currentMemberId || "unassigned",
            name: fromMember?.name || "Unassigned",
          },
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "re-assigned tasked successfully",
        result: {
          total_tasks: totalTasks,
          reassignments_count: reassignments.filter(
            (r) => r.fromAssignee.id !== r.toAssignee.id
          ).length,
          reassignments: reassignments.map((r) => ({
            task: r.taskTitle,
            from: r.fromAssignee.name,
            to: r.toAssignee.name,
            from_assignee: r.fromAssignee.name,
            to_assignee: r.toAssignee.name,
          })),
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error re-assigning tasks", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to re-assign tasks",
        error: error?.message || "Unknown error occurred",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

