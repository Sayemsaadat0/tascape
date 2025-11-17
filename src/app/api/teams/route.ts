import { NextResponse } from "next/server"
import "@/DB/db"
import { Team } from "@/models/Team"
import { authenticateRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const isValidMembersArray = (members: unknown) => {
  if (!Array.isArray(members)) return false
  return members.every(
    (member) =>
      member &&
      typeof member === "object" &&
      typeof (member as any).name === "string" &&
      typeof (member as any).role === "string" &&
      typeof (member as any).capacity === "number"
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

    const teams = await Team.find({
      user_id: queryUserId,
    }).sort({ createdAt: -1 })

    return NextResponse.json(
      { success: true, message: "Teams retrieved", results: teams },
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
    const { title, members, user_id } = body

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

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      )
    }

    if (!isValidMembersArray(members)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Members must be an array of { name: string, role: string, capacity: number }",
        },
        { status: 400 }
      )
    }

    const team = await Team.create({
      title: title.trim(),
      members: members.map((member: any) => ({
        name: member.name.trim(),
        role: member.role.trim(),
        capacity: member.capacity,
      })),
      user_id: resolvedUserId,
    })

    return NextResponse.json(
      { success: true, message: "Team created", result: team },
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

