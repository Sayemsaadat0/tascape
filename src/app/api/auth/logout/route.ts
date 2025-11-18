import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// POST /api/auth/logout
// Since authentication is stateless (JWT), logging out simply means
// clearing/removing the token on the client. This endpoint exists so the
// frontend has a unified place to hit and can expand later if we add token
// blacklists or refresh-token revocation.
export async function POST() {
  try {
    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully. Please remove the token on the client.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Logout error", error)
    return NextResponse.json(
      { success: false, message: "Failed to logout" },
      { status: 500 }
    )
  }
}
