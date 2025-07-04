import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        error: "No token provided",
        hasAuthHeader: !!authHeader,
        authHeader: authHeader 
      }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    console.log("Testing token:", token.substring(0, 20) + "...")
    
    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      payload: payload,
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0
      }
    })
  } catch (error) {
    console.error("Test auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 