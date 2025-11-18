import { NextResponse } from "next/server"
import "@/DB/db"
import { Member } from "@/models/Member"
import { authenticateRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// const extractString = (value: unknown) => {
//   if (typeof value !== "string") return ""
//   return value.trim()
// }

// ======================
// GET /api/members
// - Get all members for authenticated user (or all for admin)
// ======================
export async function GET(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const requestUserId = authResult.payload.userId
    const role = authResult.payload.role?.toLowerCase()
    const isAdmin = role === "admin"

    const filter = isAdmin ? {} : { user_id: requestUserId }

    const members = await Member.find(filter).sort({ createdAt: -1 })

    return NextResponse.json(
      { success: true, message: "Members retrieved", results: members },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching members", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

// ======================
// POST /api/members
// - Create a new member
// ======================
export async function POST(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const body = await request.json()
    const { name, role, capacity, used_capacity } = body ?? {}
    const requestUserId = authResult.payload.userId

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!role || typeof role !== "string" || !role.trim()) {
      return NextResponse.json(
        { success: false, message: "Role is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (typeof capacity !== "number" || capacity < 0 || capacity > 5) {
      return NextResponse.json(
        { success: false, message: "Capacity is required and must be a number between 0 and 5" },
        { status: 400 }
      )
    }

    const resolvedUsedCapacity =
      typeof used_capacity === "number" ? used_capacity : 0

    if (typeof resolvedUsedCapacity !== "number" || resolvedUsedCapacity < 0 || resolvedUsedCapacity > 5) {
      return NextResponse.json(
        { success: false, message: "used_capacity must be a number between 0 and 5" },
        { status: 400 }
      )
    }

    if (resolvedUsedCapacity > capacity) {
      return NextResponse.json(
        { success: false, message: "used_capacity cannot exceed capacity" },
        { status: 400 }
      )
    }

    const member = await Member.create({
      name: name.trim(),
      role: role.trim(),
      capacity: capacity,
      used_capacity: resolvedUsedCapacity,
      user_id: requestUserId,
    })

    return NextResponse.json(
      { success: true, message: "Member created", result: member },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating member", error)
    return NextResponse.json(
      { success: false, message: "Failed to create member" },
      { status: 500 }
    )
  }
}

