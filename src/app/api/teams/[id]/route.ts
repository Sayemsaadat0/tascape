import { NextResponse } from "next/server"
import "@/DB/db"
import { Team } from "@/models/Team"
import { Member } from "@/models/Member"
import { authenticateRequest } from "@/lib/auth"
import { Types } from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const resolveObjectId = (value: string) => {
  if (!value || !Types.ObjectId.isValid(value)) return null
  return new Types.ObjectId(value)
}

const extractUserIdParam = (value: unknown) => {
  if (typeof value !== "string") return ""
  return value.trim()
}

const isValidMemberIdsArray = (members: unknown) => {
  if (!Array.isArray(members)) return false
  return members.every(
    (memberId) =>
      memberId &&
      (typeof memberId === "string" || memberId instanceof Types.ObjectId) &&
      Types.ObjectId.isValid(memberId)
  )
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
    const queryUserId = extractUserIdParam(searchParams.get("user_id"))

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

    const teamObjectId = resolveObjectId(id)

    if (!teamObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid identifier" },
        { status: 400 }
      )
    }

    const team = await Team.findOne({
      _id: teamObjectId,
      user_id: queryUserId,
    }).populate("members")

    if (!team) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      )
    }

    const teamObj = team.toObject({ flattenMaps: true })

    return NextResponse.json(
      { success: true, message: "Team retrieved", result: teamObj },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching team", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch team" },
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
    const { user_id, title, members } = body ?? {}

    const resolvedUserId = extractUserIdParam(user_id)
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

    const teamObjectId = resolveObjectId(id)
    if (!teamObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid identifier" },
        { status: 400 }
      )
    }

    const updatePayload: Record<string, unknown> = {}

    if (typeof title !== "undefined") {
      if (!title || typeof title !== "string" || !title.trim()) {
        return NextResponse.json(
          { success: false, message: "Title must be a non-empty string" },
          { status: 400 }
        )
      }
      updatePayload.title = title.trim()
    }

    if (typeof members !== "undefined") {
      if (!isValidMemberIdsArray(members)) {
        return NextResponse.json(
          {
            success: false,
            message: "Members must be an array of valid member IDs (ObjectId strings)",
          },
          { status: 400 }
        )
      }

      // Convert member IDs to ObjectIds and validate they exist and belong to user
      const memberObjectIds: Types.ObjectId[] = []
      for (const memberId of members) {
        if (!Types.ObjectId.isValid(memberId)) {
          return NextResponse.json(
            { success: false, message: `Invalid member ID: ${memberId}` },
            { status: 400 }
          )
        }
        memberObjectIds.push(new Types.ObjectId(memberId))
      }

      // Validate all members exist and belong to the user
      const existingMembers = await Member.find({
        _id: { $in: memberObjectIds },
        user_id: resolvedUserId,
      })

      if (existingMembers.length !== memberObjectIds.length) {
        return NextResponse.json(
          {
            success: false,
            message: "One or more member IDs not found or do not belong to you",
          },
          { status: 400 }
        )
      }

      updatePayload.members = memberObjectIds
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      )
    }

    const updatedTeam = await Team.findOneAndUpdate(
      { _id: teamObjectId, user_id: resolvedUserId },
      { $set: updatePayload },
      { new: true }
    ).populate("members")

    if (!updatedTeam) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      )
    }

    const teamObj = updatedTeam.toObject({ flattenMaps: true })

    return NextResponse.json(
      { success: true, message: "Team updated", result: teamObj },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating team", error)
    return NextResponse.json(
      { success: false, message: "Failed to update team" },
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
    const [{ id }] = await Promise.all([params])
    const { searchParams } = new URL(request.url)
    const queryUserId = extractUserIdParam(searchParams.get("user_id"))

    if (!queryUserId) {
      return NextResponse.json(
        { success: false, message: "user_id query parameter is required" },
        { status: 400 }
      )
    }

    if (authResult.payload.userId !== queryUserId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: user mismatch" },
        { status: 403 }
      )
    }

    const teamObjectId = resolveObjectId(id)
    if (!teamObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid identifier" },
        { status: 400 }
      )
    }

    const deletedTeam = await Team.findOneAndDelete({
      _id: teamObjectId,
      user_id: queryUserId,
    })

    if (!deletedTeam) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Team deleted" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting team", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete team" },
      { status: 500 }
    )
  }
}

