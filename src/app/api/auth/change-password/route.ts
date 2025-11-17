import { NextResponse } from "next/server";
import "@/DB/db";
import { User } from "@/models/User";
import { authenticateRequest } from "@/lib/auth";

// Configure for static export
 

export async function POST(request: Request) {
  const authResult = authenticateRequest(request);
  if ("response" in authResult) {
    return authResult.response;
  }

  try {
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current and new password are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(authResult.payload.userId).select("+password");
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