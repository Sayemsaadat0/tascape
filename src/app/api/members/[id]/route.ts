import { NextResponse } from "next/server"
import "@/DB/db"
import { Member } from "@/models/Member"
import { authenticateRequest } from "@/lib/auth"
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

// ======================
// GET /api/members/[id]?user_id={user_id}
// - Get a single member by ID
// ======================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const [{ id }, searchParams] = await Promise.all([
      params,
      Promise.resolve(new URL(request.url).searchParams),
    ])

    const queryUserId = extractString(searchParams.get("user_id"))

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

    const memberObjectId = resolveObjectId(id)
    if (!memberObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid member identifier" },
        { status: 400 }
      )
    }

    const member = await Member.findOne({
      _id: memberObjectId,
      user_id: queryUserId,
    })

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Member retrieved", result: member },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching member", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch member" },
      { status: 500 }
    )
  }
}

// ======================
// PATCH /api/members/[id]
// - Update a member
// ======================
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
    const { name, role, capacity, used_capacity } = body ?? {}

    // Get user_id from decoded token (sub field)
    const userId = authResult.payload.userId

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found in token" },
        { status: 401 }
      )
    }

    const memberObjectId = resolveObjectId(id)
    if (!memberObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid member identifier" },
        { status: 400 }
      )
    }

    // Check if member exists and belongs to user
    const existingMember = await Member.findOne({
      _id: memberObjectId,
      user_id: userId,
    })

    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
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

    if (typeof role !== "undefined") {
      if (!role || typeof role !== "string" || !role.trim()) {
        return NextResponse.json(
          { success: false, message: "Role must be a non-empty string" },
          { status: 400 }
        )
      }
      updatePayload.role = role.trim()
    }

    if (typeof capacity !== "undefined") {
      if (typeof capacity !== "number" || capacity < 0 || capacity > 5) {
        return NextResponse.json(
          { success: false, message: "Capacity must be a number between 0 and 5" },
          { status: 400 }
        )
      }
      updatePayload.capacity = capacity
    }

    if (typeof used_capacity !== "undefined") {
      if (typeof used_capacity !== "number" || used_capacity < 0 || used_capacity > 5) {
        return NextResponse.json(
          { success: false, message: "used_capacity must be a number between 0 and 5" },
          { status: 400 }
        )
      }
      updatePayload.used_capacity = used_capacity
    }

    // Validate that used_capacity doesn't exceed capacity
    const finalCapacity = updatePayload.capacity ?? existingMember.capacity
    const finalUsedCapacity = updatePayload.used_capacity ?? existingMember.used_capacity

    if (finalUsedCapacity > finalCapacity) {
      return NextResponse.json(
        { success: false, message: "used_capacity cannot exceed capacity" },
        { status: 400 }
      )
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      )
    }

    const updatedMember = await Member.findOneAndUpdate(
      { _id: memberObjectId, user_id: userId },
      { $set: updatePayload },
      { new: true }
    )

    if (!updatedMember) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Member updated", result: updatedMember },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating member", error)
    return NextResponse.json(
      { success: false, message: "Failed to update member" },
      { status: 500 }
    )
  }
}

// ======================
// DELETE /api/members/[id]
// - Delete a member
// ======================
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

    const memberObjectId = resolveObjectId(id)
    if (!memberObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid member identifier" },
        { status: 400 }
      )
    }

    const deletedMember = await Member.findOneAndDelete({
      _id: memberObjectId,
      user_id: userId,
    })

    if (!deletedMember) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Member deleted", result: { _id: deletedMember._id, name: deletedMember.name } },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting member", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete member" },
      { status: 500 }
    )
  }
}

