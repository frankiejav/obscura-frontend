import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT, signJWT } from "@/lib/jwt"

// Mock user database (same as in login route)
const users = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "client@example.com",
    password: "client123",
    name: "Client User",
    role: "client",
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    // Verify the refresh token
    const payload = await verifyJWT(refreshToken)
    if (!payload || payload.type !== "refresh") {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Find the user
    const user = users.find((u) => u.id === payload.sub)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create new tokens
    const newToken = await signJWT(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      "15m", // 15 minutes
    )

    const newRefreshToken = await signJWT(
      {
        sub: user.id,
        type: "refresh",
      },
      "7d", // 7 days
    )

    // Set cookies
    const response = NextResponse.json({
      token: newToken,
      refreshToken: newRefreshToken,
    })

    response.cookies.set({
      name: "token",
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    })

    response.cookies.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
