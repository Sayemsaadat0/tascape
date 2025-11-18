import { NextResponse } from "next/server"
import "@/DB/db"
import { authenticateRequest } from "@/lib/auth"
import { Task } from "@/models/Task"
// import { Team } from "@/models/Team"
// import { Member } from "@/models/Member"
import { Types } from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const extractString = (value: unknown) => {
  if (typeof value !== "string") return ""
  return value.trim()
}

// ======================
// GET /api/tasks/all
// - Get all tasks for the authenticated user (across all projects)
// - Optional filters: member (member_id), project (project_id), search (title substring)
// ======================
export async function GET(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const userId = authResult.payload.userId
    const { searchParams } = new URL(request.url)
    const memberParam = extractString(searchParams.get("member"))
    const projectParam = extractString(searchParams.get("project"))
    const searchParam = extractString(searchParams.get("search"))

    const filter: Record<string, any> = { user_id: userId }

    if (memberParam) {
      if (!Types.ObjectId.isValid(memberParam)) {
        return NextResponse.json(
          { success: false, message: "Invalid member identifier" },
          { status: 400 }
        )
      }
      filter.member_id = new Types.ObjectId(memberParam)
    }

    if (projectParam) {
      if (!Types.ObjectId.isValid(projectParam)) {
        return NextResponse.json(
          { success: false, message: "Invalid project identifier" },
          { status: 400 }
        )
      }
      filter.project_id = new Types.ObjectId(projectParam)
    }

    if (searchParam) {
      filter.title = { $regex: searchParam, $options: "i" }
    }

    // Fetch all tasks for this user
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate("assigned_member", "name email")
      .populate("member_id")
      .populate({
        path: "project_id",
        select: "name team_id user_id",
        populate: {
          path: "team_id",
          select: "title members",
          populate: {
            path: "members",
          },
        },
      })

    // Format each task with project_Info and assigned_member_info
    const formattedTasks = tasks.map((task) => {
      const taskObj = task.toObject()

      // Get project info from populated project
      let projectInfo: any = null
      let assignedMemberInfo: any = null

      if (taskObj.project_id && typeof taskObj.project_id === "object") {
        const project = taskObj.project_id as any
        const populatedTeam =
          project.team_id && typeof project.team_id === "object"
            ? project.team_id
            : null

        projectInfo = {
          _id: project._id,
          name: project.name,
          team_id: populatedTeam
            ? populatedTeam._id.toString()
            : project.team_id?.toString?.() ?? project.team_id,
          team_info: populatedTeam,
          user_id: project.user_id,
        }

        // Get assigned_member_info from populated member_id
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

      return {
        ...taskObj,
        project_id: taskObj.project_id?.toString?.() || taskObj.project_id,
        project_Info: projectInfo,
        assigned_member_info: assignedMemberInfo,
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: "All tasks retrieved",
        results: formattedTasks,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching all tasks", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

