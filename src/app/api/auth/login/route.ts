import { NextResponse } from "next/server";
import "@/DB/db";
import { User, type IUser } from "@/models/User";
import jwt from "jsonwebtoken";
import type { HydratedDocument } from "mongoose";

// Configure for static export
 

// POST /api/auth/login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and Password are required" },
        { status: 400 }
      );
    }

    // Explicitly select password since it's select: false
    const user = await User.findOne({ email }).select("+password") as HydratedDocument<IUser> | null;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword?.(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET || process.env.JWT_SICRECT_KEY; // align with existing usage
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "JWT secret not configured" },
        { status: 500 }
      );
    }

    const userId = (user._id as unknown as { toString(): string }).toString();

    const token = jwt.sign(
      { sub: userId, role: user.role, email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    const safeUser = user.toObject() as unknown as Record<string, unknown>;
    delete safeUser.password;
    delete safeUser.resetPasswordToken;
    delete safeUser.resetPasswordExpires;
// some changes done 
    return NextResponse.json(
      { success: true, message: "Logged in successfully", token, user: safeUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json({ success: false, message: "Failed to login" }, { status: 500 });
  }
}