import { NextResponse } from "next/server"
import "@/DB/db"
import { authenticateRequest } from "@/lib/auth"
import { Project } from "@/models/Project"
import { Team } from "@/models/Team"
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

export async function GET(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const teamIdParam = extractString(searchParams.get("team_id"))
    const requestUserId = authResult.payload.userId

    const filter: Record<string, unknown> = { user_id: requestUserId }

    if (teamIdParam) {
      const teamObjectId = resolveObjectId(teamIdParam)
      if (!teamObjectId) {
        return NextResponse.json(
          { success: false, message: "Invalid team identifier" },
          { status: 400 }
        )
      }
      filter.team_id = teamObjectId
    }

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "team_id",
        populate: {
          path: "members",
        },
      })

    const formattedProjects = projects.map((project) => {
      const projectObj = project.toObject()
      const populatedTeam =
        projectObj.team_id && typeof projectObj.team_id === "object"
          ? projectObj.team_id
          : null

      return {
        ...projectObj,
        team_id: populatedTeam
          ? populatedTeam._id.toString()
          : projectObj.team_id?.toString?.() ?? projectObj.team_id,
        team_info: populatedTeam,
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: "Projects retrieved",
        results: formattedProjects,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching projects", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const body = await request.json()
    const { name, team_id, user_id } = body ?? {}

    const resolvedUserId = extractString(user_id)
    if (!resolvedUserId) {
      return NextResponse.json(
        { success: false, message: "user_id is required" },
        { status: 400 }
      )
    }

    if (authResult.payload.userId !== resolvedUserId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: user mismatch" },
        { status: 403 }
      )
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      )
    }

    const resolvedTeamId = extractString(team_id)
    if (!resolvedTeamId) {
      return NextResponse.json(
        { success: false, message: "team_id is required" },
        { status: 400 }
      )
    }

    const teamObjectId = resolveObjectId(resolvedTeamId)
    if (!teamObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid team identifier" },
        { status: 400 }
      )
    }

    const team = await Team.findOne({
      _id: teamObjectId,
      user_id: resolvedUserId,
    })

    if (!team) {
      return NextResponse.json(
        { success: false, message: "Team not found or unauthorized" },
        { status: 404 }
      )
    }

    const project = await Project.create({
      name: name.trim(),
      team_id: teamObjectId,
      user_id: resolvedUserId,
    })

    return NextResponse.json(
      { success: true, message: "Project created", result: project },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating project", error)
    return NextResponse.json(
      { success: false, message: "Failed to create project" },
      { status: 500 }
    )
  }
}


