import { NextResponse } from "next/server"
import "@/DB/db"
import { Team } from "@/models/Team"
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
    })
    if (!team) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Team retrieved", result: team },
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

