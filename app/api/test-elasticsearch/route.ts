import { NextResponse } from "next/server"
import { checkConnection } from "@/lib/elasticsearch"

export async function GET() {
  try {
    const isConnected = await checkConnection()
    
    if (isConnected) {
      return NextResponse.json({ 
        status: "success", 
        message: "Elasticsearch connection successful" 
      })
    } else {
      return NextResponse.json({ 
        status: "error", 
        message: "Elasticsearch connection failed" 
      }, { status: 503 })
    }
  } catch (error) {
    console.error("Test endpoint error:", error)
    return NextResponse.json({ 
      status: "error", 
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 