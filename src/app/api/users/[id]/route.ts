import { NextResponse } from "next/server"
import "@/DB/db" // ensure DB connection
import { User } from "@/models/User"

// ======================
// GET /api/users/{id}
// - Get single user by ID
// ======================
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User id is required" },
        { status: 400 }
      )
    }

    const result = await User.findById(id)
    if (result) {
      return NextResponse.json(
        { success: true, message: "Single User Retrieved", result },
        { status: 200 }
      )
    }
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    )
  } catch (error) {
    console.error("Error Getting User", error)
    return NextResponse.json(
      { success: false, message: "Failed to Get User" },
      { status: 500 }
    )
  }
}
