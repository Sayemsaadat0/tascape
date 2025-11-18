import { NextResponse, type NextResponse as NextResponseType } from "next/server"
import jwt from "jsonwebtoken"

type AuthSuccess = {
  payload: {
    userId: string
    role?: string
    email?: string
    tokenPayload: jwt.JwtPayload | string
  }
}

type AuthFailure = {
  response: NextResponseType
}

export type AuthResult = AuthSuccess | AuthFailure

const buildErrorResponse = (message: string, status: number): AuthFailure => ({
  response: NextResponse.json({ success: false, message }, { status }),
})

export const authenticateRequest = (request: Request): AuthResult => {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return buildErrorResponse("Unauthorized", 401)
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim()

  if (!token) {
    return buildErrorResponse("Unauthorized", 401)
  }
  const secret = process.env.JWT_SECRET

  if (!secret) {
    return buildErrorResponse("JWT secret not configured", 500)
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload | string
    // Extract userId from sub field (which is an ObjectId)
    let userId = ""
    if (typeof decoded === "string") {
      userId = decoded
    } else if (decoded.sub) {
      // sub is an ObjectId - convert to string for comparison
      // ObjectId can be stringified directly
      userId = String(decoded.sub).trim()
    }

    if (!userId) {
      return buildErrorResponse("Invalid token payload", 401)
    }

    return {
      payload: {
        userId,
        role: typeof decoded === "string" ? undefined : (decoded.role as string),
        email:
          typeof decoded === "string" ? undefined : (decoded.email as string),
        tokenPayload: decoded,
      },
    }
  } catch {
    return buildErrorResponse("Invalid or expired token", 401)
  }
}

