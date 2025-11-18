import { NextResponse } from "next/server"
import "@/DB/db"
import { Activity } from "@/models/Activity"
import { authenticateRequest } from "@/lib/auth"
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
// GET /api/activities
// - Get activity logs with optional filtering
// - Query params: project_id, task_id
// ======================
export async function GET(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const projectIdParam = extractString(searchParams.get("project_id"))
    const taskIdParam = extractString(searchParams.get("task_id"))
    const requestUserId = authResult.payload.userId

    // Build query filter
    const filter: Record<string, any> = {
      user_id: requestUserId,
    }

    if (projectIdParam) {
      const projectObjectId = resolveObjectId(projectIdParam)
      if (projectObjectId) {
        filter.project_id = projectObjectId
      }
    }

    if (taskIdParam) {
      const taskObjectId = resolveObjectId(taskIdParam)
      if (taskObjectId) {
        filter.task_id = taskObjectId
      }
    }

    // Get activities sorted by createdAt (newest first)
    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(100) // Limit to last 100 activities

    const activitiesList = activities.map((activity) => {
      const activityObj = activity.toObject({ flattenMaps: true })
      return {
        id: activityObj._id,
        activity_message: activityObj.activity_message,
        task_name: activityObj.task_name,
        assigned_from_name: activityObj.assigned_from_name,
        assigned_to_name: activityObj.assigned_to_name,
        task_id: activityObj.task_id,
        project_id: activityObj.project_id,
        timestamp: activityObj.createdAt,
        formatted_time: new Date(activityObj.createdAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: "Activities retrieved",
        result: activitiesList,
        count: activitiesList.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching activities", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}

// ======================
// POST /api/activities
// - Create a new activity log entry
// - Body: activity_message, task_name, assigned_from_name, assigned_to_name, task_id (optional), project_id (optional)
// ======================
export async function POST(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const body = await request.json()
    const {
      activity_message,
      task_name,
      assigned_from_name,
      assigned_to_name,
      task_id,
      project_id,
    } = body ?? {}
    const requestUserId = authResult.payload.userId

    // Validate required fields
    if (!activity_message || typeof activity_message !== "string" || !activity_message.trim()) {
      return NextResponse.json(
        { success: false, message: "activity_message is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!task_name || typeof task_name !== "string" || !task_name.trim()) {
      return NextResponse.json(
        { success: false, message: "task_name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!assigned_from_name || typeof assigned_from_name !== "string" || !assigned_from_name.trim()) {
      return NextResponse.json(
        { success: false, message: "assigned_from_name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!assigned_to_name || typeof assigned_to_name !== "string" || !assigned_to_name.trim()) {
      return NextResponse.json(
        { success: false, message: "assigned_to_name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    // Build activity document
    const activityData: any = {
      activity_message: activity_message.trim(),
      task_name: task_name.trim(),
      assigned_from_name: assigned_from_name.trim(),
      assigned_to_name: assigned_to_name.trim(),
      user_id: requestUserId,
    }

    if (task_id) {
      const taskObjectId = resolveObjectId(extractString(task_id))
      if (taskObjectId) {
        activityData.task_id = taskObjectId
      }
    }

    if (project_id) {
      const projectObjectId = resolveObjectId(extractString(project_id))
      if (projectObjectId) {
        activityData.project_id = projectObjectId
      }
    }

    const newActivity = await Activity.create(activityData)
    const activityObj = newActivity.toObject({ flattenMaps: true })

    return NextResponse.json(
      {
        success: true,
        message: "Activity logged",
        result: {
          id: activityObj._id,
          activity_message: activityObj.activity_message,
          task_name: activityObj.task_name,
          assigned_from_name: activityObj.assigned_from_name,
          assigned_to_name: activityObj.assigned_to_name,
          task_id: activityObj.task_id,
          project_id: activityObj.project_id,
          timestamp: activityObj.createdAt,
          formatted_time: new Date(activityObj.createdAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating activity", error)
    return NextResponse.json(
      { success: false, message: "Failed to create activity" },
      { status: 500 }
    )
  }
}

