import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const isConnected = await db.ping()
    
    return NextResponse.json({
      status: isConnected ? "online" : "offline",
      timestamp: new Date().toISOString(),
      database: isConnected ? "connected" : "disconnected"
    })
  } catch (error) {
    console.error("System status check error:", error)
    return NextResponse.json({
      status: "offline",
      timestamp: new Date().toISOString(),
      database: "error"
    }, { status: 500 })
  }
} 