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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const [userId, { id }] = await Promise.all([
      Promise.resolve(authResult.payload.userId),
      params,
    ])

    const { searchParams } = new URL(request.url)
    const queryUserId = extractString(searchParams.get("user_id"))

    if (!queryUserId) {
      return NextResponse.json(
        { success: false, message: "user_id query parameter is required" },
        { status: 400 }
      )
    }

    if (userId !== queryUserId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: user mismatch" },
        { status: 403 }
      )
    }

    const projectObjectId = resolveObjectId(id)
    if (!projectObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid identifier" },
        { status: 400 }
      )
    }

    const project = await Project.findOne({
      _id: projectObjectId,
      user_id: queryUserId,
    }).populate({
      path: "team_id",
      populate: {
        path: "members",
      },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      )
    }

    const projectObj = project.toObject()
    const populatedTeam =
      projectObj.team_id && typeof projectObj.team_id === "object"
        ? projectObj.team_id
        : null

    const formattedProject = {
      ...projectObj,
      team_id: populatedTeam
        ? populatedTeam._id.toString()
        : projectObj.team_id?.toString?.() ?? projectObj.team_id,
      team_info: populatedTeam,
    }

    return NextResponse.json(
      { success: true, message: "Project retrieved", result: formattedProject },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching project", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch project" },
      { status: 500 }
    )
  }
}

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
    const { user_id, name, team_id } = body ?? {}

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

    const projectObjectId = resolveObjectId(id)
    if (!projectObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid identifier" },
        { status: 400 }
      )
    }

    const updatePayload: Record<string, unknown> = {}

    if (typeof name !== "undefined") {
      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { success: false, message: "Name must be a non-empty string" },
          { status: 400 }
        )
      }
      updatePayload.name = name.trim()
    }

    if (typeof team_id !== "undefined") {
      const resolvedTeamId = extractString(team_id)
      if (!resolvedTeamId) {
        return NextResponse.json(
          { success: false, message: "team_id must be provided when supplied" },
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

      updatePayload.team_id = teamObjectId
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      )
    }

    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectObjectId, user_id: resolvedUserId },
      { $set: updatePayload },
      { new: true }
    )

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Project updated", result: updatedProject },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating project", error)
    return NextResponse.json(
      { success: false, message: "Failed to update project" },
      { status: 500 }
    )
  }
}

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

    // Get user_id from decoded token (sub field)
    const userId = authResult.payload.userId

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found in token" },
        { status: 401 }
      )
    }

    const projectObjectId = resolveObjectId(id)
    if (!projectObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid identifier" },
        { status: 400 }
      )
    }

    const deletedProject = await Project.findOneAndDelete({
      _id: projectObjectId,
      user_id: userId,
    })

    if (!deletedProject) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Project deleted" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting project", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete project" },
      { status: 500 }
    )
  }
}


