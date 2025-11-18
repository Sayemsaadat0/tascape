import { NextResponse } from "next/server"
import "@/DB/db"
import { authenticateRequest } from "@/lib/auth"
import { Project } from "@/models/Project"
import { Task } from "@/models/Task"
import { Team } from "@/models/Team"
import { Member } from "@/models/Member"
import { User } from "@/models/User"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const requestUserId = authResult.payload.userId
    const role = authResult.payload.role?.toLowerCase()
    const isAdmin = role === "admin"

    const baseFilter = isAdmin ? {} : { user_id: requestUserId }

    const [totalProjects, totalTasks, totalMembers, totalTeams] =
      await Promise.all([
        Project.countDocuments(baseFilter),
        Task.countDocuments(baseFilter),
        Member.countDocuments(baseFilter),
        Team.countDocuments(baseFilter),
      ])

    const totalUsers = isAdmin ? await User.countDocuments() : null

    const summary = {
      total_projects: totalProjects,
      total_tasks: totalTasks,
      total_members: totalMembers,
      total_teams: totalTeams,
      total_users: totalUsers,
      user_id: requestUserId,
      generated_at: new Date().toISOString(),
    }

    return NextResponse.json(
      { success: true, message: "Stats summary retrieved", result: summary },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching stats summary", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch stats summary" },
      { status: 500 }
    )
  }
}
