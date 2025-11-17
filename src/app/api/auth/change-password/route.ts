import { NextResponse } from "next/server";
import "@/DB/db";
import { User } from "@/models/User";

// POST /api/auth/change-password
// headers: Authorization: Bearer <token>
// body: { currentPassword, newPassword }
// Note: In production, verify JWT properly in a middleware. Here we keep it simple.
import jwt from "jsonwebtoken";

// Configure for static export
 

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || process.env.JWT_SICRECT_KEY;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "JWT secret not configured" },
        { status: 500 }
      );
    }

    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current and new password are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(payload.sub).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await user.comparePassword?.(currentPassword);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    user.password = newPassword; // will be hashed on save
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error", error);
    return NextResponse.json(
      { success: false, message: "Failed to change password" },
      { status: 500 }
    );
  }
}