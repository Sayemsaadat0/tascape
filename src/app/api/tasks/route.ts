import { NextResponse } from "next/server"
import "@/DB/db"
import { authenticateRequest } from "@/lib/auth"
import { Types } from "mongoose"
// Import all models to ensure they are registered before populate operations
import { Task } from "@/models/Task"
import { Project } from "@/models/Project"
import { Team } from "@/models/Team"
import { Member } from "@/models/Member"

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

// ======================
// GET /api/tasks?project_id={project_id} (optional)
// - If project_id is provided: Get all tasks for a specific project
// - If project_id is not provided: Get all tasks for the authenticated user
// 
// Authentication Flow:
// 1. Token is extracted from Authorization header (Bearer token)
// 2. Token is decoded using JWT_SECRET
// 3. User ID is extracted from token's 'sub' field
// 4. All tasks are filtered by user_id to ensure users only see their own tasks
// ======================
export async function GET(request: Request) {
  // Authenticate request - extracts token from headers, decodes it, and gets user ID from 'sub' field
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  // authResult.payload.userId contains the user ID extracted from token's 'sub' field
  const userId = authResult.payload.userId

  try {
    const { searchParams } = new URL(request.url)
    const projectIdParam = extractString(searchParams.get("project_id"))

    let projectObjectId: Types.ObjectId | null = null
    let projectInfo: any = null

    // If project_id is provided, validate it
    if (projectIdParam) {
      projectObjectId = resolveObjectId(projectIdParam)
      if (!projectObjectId) {
        return NextResponse.json(
          { success: false, message: "Invalid project_id" },
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

      // Verify project ownership - ensure project belongs to the authenticated user (from token)
      if (project.user_id !== userId) {
        return NextResponse.json(
          { success: false, message: "Forbidden: Project does not belong to you" },
          { status: 403 }
        )
      }

      // Simple project info without nested populate
      projectInfo = {
        _id:
          project._id instanceof Types.ObjectId
            ? project._id.toString()
            : String(project._id),
        name: project.name,
        team_id:
          project.team_id instanceof Types.ObjectId
            ? project.team_id.toString()
            : String(project.team_id),
        user_id: project.user_id,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }
    }

    // Build query - ALWAYS filter by user_id from token to ensure user-based task filtering
    // This ensures users can only see tasks they created (user_id from token's 'sub' field)
    const query: any = {
      user_id: userId // User ID extracted from token's 'sub' field
    }
    
    if (projectObjectId) {
      query.project_id = projectObjectId
    }

    // Fetch tasks, ensuring they belong to the authenticated user
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .populate("assigned_member", "name email")
      .populate("member_id")
      .populate("project_id", "name")

    // Format each task with project_Info and assigned_member_info
    const formattedTasks = await Promise.all(
      tasks.map(async (task) => {
        const taskObj = task.toObject()
        
        // Get assigned_member_info from populated member_id
        let assignedMemberInfo: any = null
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

        // Get project info for this task if not already set
        let taskProjectInfo = projectInfo
        if (!taskProjectInfo && taskObj.project_id && typeof taskObj.project_id === "object") {
          const populatedProject = taskObj.project_id as any
          taskProjectInfo = {
            _id: populatedProject._id?.toString() || String(populatedProject._id),
            name: populatedProject.name,
            team_id: populatedProject.team_id?.toString() || String(populatedProject.team_id),
            user_id: populatedProject.user_id,
            createdAt: populatedProject.createdAt,
            updatedAt: populatedProject.updatedAt,
          }
        } else if (!taskProjectInfo) {
          // If project_id is not populated, fetch it
          const taskProjectId = taskObj.project_id
          if (taskProjectId) {
            const project = await Project.findById(taskProjectId)
            // Only include project info if it belongs to the authenticated user
            if (project && project.user_id === userId) {
              taskProjectInfo = {
                _id: project._id instanceof Types.ObjectId ? project._id.toString() : String(project._id),
                name: project.name,
                team_id: project.team_id instanceof Types.ObjectId ? project.team_id.toString() : String(project.team_id),
                user_id: project.user_id,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
              }
            }
          }
        }

        // Convert project_id to string format
        let projectIdString = ""
        if (taskObj.project_id instanceof Types.ObjectId) {
          projectIdString = taskObj.project_id.toString()
        } else if (typeof taskObj.project_id === "object" && taskObj.project_id !== null) {
          const populatedProject = taskObj.project_id as any
          projectIdString = populatedProject._id?.toString() || String(populatedProject._id || "")
        } else if (taskObj.project_id) {
          projectIdString = String(taskObj.project_id)
        }

        return {
          ...taskObj,
          project_id: projectIdString,
          project_Info: taskProjectInfo,
          assigned_member_info: assignedMemberInfo,
        }
      })
    )

    return NextResponse.json(
      {
        success: true,
        message: projectObjectId ? "Tasks retrieved for project" : "All tasks retrieved",
        results: formattedTasks,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error fetching tasks", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch tasks",
        error: error?.message || "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}

// ======================
// POST /api/tasks
// - Create a new task
// 
// Authentication Flow:
// 1. Token is extracted from Authorization header (Bearer token)
// 2. Token is decoded using JWT_SECRET
// 3. User ID is extracted from token's 'sub' field
// 4. Task is created with user_id from token to ensure task ownership
// ======================
export async function POST(request: Request) {
  // Authenticate request - extracts token from headers, decodes it, and gets user ID from 'sub' field
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  // authResult.payload.userId contains the user ID extracted from token's 'sub' field
  const userId = authResult.payload.userId

  try {
    const body = await request.json()
    const { title, description, assigned_member, project_id, priority, status } =
      body ?? {}

    // Validation
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      )
    }

    const resolvedProjectId = extractString(project_id)
    if (!resolvedProjectId) {
      return NextResponse.json(
        { success: false, message: "project_id is required" },
        { status: 400 }
      )
    }

    const projectObjectId = resolveObjectId(resolvedProjectId)
    if (!projectObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid project_id" },
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

      // Verify project ownership - ensure project belongs to the authenticated user (from token)
      if (project.user_id !== userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Project does not belong to you" },
        { status: 403 }
      )
    }

    // Get team separately if needed for member validation
    let team = null
    if (assigned_member) {
      team = await Team.findById(project.team_id).populate("members")
    }

    // Simple project info
    const projectInfo = {
      _id:
        project._id instanceof Types.ObjectId
          ? project._id.toString()
          : String(project._id),
      name: project.name,
      team_id:
        project.team_id instanceof Types.ObjectId
          ? project.team_id.toString()
          : String(project.team_id),
      user_id: project.user_id,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }

    // Validate priority if provided
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

    // Validate status if provided
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

    // Validate assigned_member if provided (now accepts member ObjectId)
    let assignedMemberInfo: any = null
    let memberObjectId: Types.ObjectId | null = null

    if (assigned_member) {
      const resolvedAssignedMember = extractString(assigned_member)
      
      if (!resolvedAssignedMember) {
        return NextResponse.json(
          { success: false, message: "assigned_member must be a valid member ID (ObjectId)" },
          { status: 400 }
        )
      }

      memberObjectId = resolveObjectId(resolvedAssignedMember)
      if (!memberObjectId) {
        return NextResponse.json(
          { success: false, message: "Invalid member ID format" },
          { status: 400 }
        )
      }

      // Validate that the member exists and belongs to the authenticated user (from token)
      const member = await Member.findOne({
        _id: memberObjectId,
        user_id: userId,
      })

      if (!member) {
        return NextResponse.json(
          { success: false, message: "Member not found or does not belong to you" },
          { status: 404 }
        )
      }

      // Validate that the member is in the project's team
      if (!team || !team.members || !Array.isArray(team.members)) {
        return NextResponse.json(
          { success: false, message: "Project team has no members" },
          { status: 400 }
        )
      }

      const teamMemberIds = team.members.map((m: any) => 
        m._id ? m._id.toString() : m.toString()
      )
      
      if (!teamMemberIds.includes(memberObjectId.toString())) {
        return NextResponse.json(
          { success: false, message: "Member is not part of the project's team" },
          { status: 400 }
        )
      }

      // Check if member has available capacity
      if (member.used_capacity >= member.capacity) {
        return NextResponse.json(
          { success: false, message: "Member has reached maximum capacity" },
          { status: 400 }
        )
      }

      assignedMemberInfo = {
        _id: member._id,
        name: member.name,
        role: member.role,
        capacity: member.capacity,
        used_capacity: member.used_capacity,
      }
    }

    // Create task with user_id from token to ensure task ownership
    const taskData: any = {
      title: title.trim(),
      description: description?.trim(),
      project_id: projectObjectId,
      user_id: userId, // User ID extracted from token's 'sub' field
      priority: priority || "Medium",
      status: status || "Pending",
    }

    if (memberObjectId) {
      taskData.member_id = memberObjectId
    }

    const task = await Task.create(taskData)

    // Increment member's used_capacity after task creation
    if (memberObjectId) {
      await Member.findByIdAndUpdate(memberObjectId, {
        $inc: { used_capacity: 1 },
      })
      
      // Refresh member info for response
      const updatedMember = await Member.findById(memberObjectId)
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
    
    const populatedTask = await Task.findById(task._id)
      .populate("assigned_member", "name email")
      .populate("member_id")
      .populate("project_id", "name")

    // Format response with project_Info and assigned_member_info
    const taskObj = populatedTask?.toObject() || task.toObject()
    
    // Get assigned_member_info from populated member_id if not already set
    if (!assignedMemberInfo && taskObj.member_id && typeof taskObj.member_id === "object") {
      const member = taskObj.member_id as any
      assignedMemberInfo = {
        _id: member._id,
        name: member.name,
        role: member.role,
        capacity: member.capacity,
        used_capacity: member.used_capacity,
      }
    }
    
    // Ensure project_id is a string, not a populated object
    const response = {
      ...taskObj,
      project_id: projectObjectId.toString(),
      project_Info: projectInfo,
      assigned_member_info: assignedMemberInfo,
    }

    return NextResponse.json(
      { success: true, message: "Task created successfully", result: response },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating task", error)
    return NextResponse.json(
      { success: false, message: "Failed to create task" },
      { status: 500 }
    )
  }
}

