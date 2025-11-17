import { NextResponse } from "next/server"
import "@/DB/db"
import { User } from "@/models/User"

// POST /api/auth/register
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, Email, and Password are required" },
        { status: 400 }
      )
    }

    // Create user (pre-save hook hashes password)
    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    })

    const safeUser = user.toObject() as unknown as Record<string, unknown>
    delete safeUser.password

    return NextResponse.json(
      { success: true, message: "User registered successfully", user: safeUser },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json({ success: false, message: "Failed to register" }, { status: 500 })
  }
}