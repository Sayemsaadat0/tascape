import { NextResponse } from "next/server"
import "@/DB/db"
import { authenticateRequest } from "@/lib/auth"
import { Task } from "@/models/Task"
import { Project } from "@/models/Project"
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

// ======================
// GET /api/tasks?project_id={project_id}
// - Get all tasks for a specific project
// ======================
export async function GET(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const projectIdParam = extractString(searchParams.get("project_id"))

    if (!projectIdParam) {
      return NextResponse.json(
        { success: false, message: "project_id query parameter is required" },
        { status: 400 }
      )
    }

    const projectObjectId = resolveObjectId(projectIdParam)
    if (!projectObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid project_id" },
        { status: 400 }
      )
    }

    // Verify project exists
    const project = await Project.findById(projectObjectId)
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      )
    }

    const tasks = await Task.find({ project_id: projectObjectId })
      .sort({ createdAt: -1 })
      .populate("assigned_member", "name email")
      .populate("project_id", "name")

    return NextResponse.json(
      {
        success: true,
        message: "Tasks retrieved",
        results: tasks,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching tasks", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

// ======================
// POST /api/tasks
// - Create a new task
// ======================
export async function POST(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

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

    // Verify project exists
    const project = await Project.findById(projectObjectId)
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      )
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

    // Validate assigned_member if provided
    let assignedMemberObjectId: Types.ObjectId | undefined
    if (assigned_member) {
      const resolvedAssignedMember = extractString(assigned_member)
      if (resolvedAssignedMember) {
        assignedMemberObjectId = resolveObjectId(resolvedAssignedMember)
        if (!assignedMemberObjectId) {
          return NextResponse.json(
            { success: false, message: "Invalid assigned_member" },
            { status: 400 }
          )
        }
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      assigned_member: assignedMemberObjectId,
      project_id: projectObjectId,
      priority: priority || "Medium",
      status: status || "Pending",
    })

    const populatedTask = await Task.findById(task._id)
      .populate("assigned_member", "name email")
      .populate("project_id", "name")

    return NextResponse.json(
      { success: true, message: "Task created successfully", result: populatedTask },
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

