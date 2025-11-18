import { NextResponse } from "next/server"
import "@/DB/db"
import { Team } from "@/models/Team"
import { Member } from "@/models/Member"
import { authenticateRequest } from "@/lib/auth"
import { Types } from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const isValidMemberIdsArray = (members: unknown) => {
  if (!Array.isArray(members)) return false
  return members.every(
    (memberId) =>
      memberId &&
      (typeof memberId === "string" || memberId instanceof Types.ObjectId) &&
      Types.ObjectId.isValid(memberId)
  )
}

const extractUserIdParam = (value: unknown) => {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  return trimmed
}

export async function GET(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const requestUserId = authResult.payload.userId

    const teams = await Team.find({
      user_id: requestUserId,
    })
      .populate("members")
      .sort({ createdAt: -1 })

    const teamsWithPopulatedMembers = teams.map((team) => {
      const teamObj = team.toObject({ flattenMaps: true })
      return teamObj
    })

    return NextResponse.json(
      { success: true, message: "Teams retrieved", results: teamsWithPopulatedMembers },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching teams", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch teams" },
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
    const { title, members } = body
    const requestUserId = authResult.payload.userId

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      )
    }

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
      user_id: requestUserId,
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

    const team = await Team.create({
      title: title.trim(),
      members: memberObjectIds,
      user_id: requestUserId,
    })

    // Populate members before returning
    const populatedTeam = await Team.findById(team._id).populate("members")
    const teamObj = populatedTeam?.toObject({ flattenMaps: true }) || team.toObject({ flattenMaps: true })

    return NextResponse.json(
      { success: true, message: "Team created", result: teamObj },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating team", error)
    return NextResponse.json(
      { success: false, message: "Failed to create team" },
      { status: 500 }
    )
  }
}

