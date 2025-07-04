import { type NextRequest, NextResponse } from "next/server"
import { Client } from "pg"
import { getIPGeolocation, getClientIP } from "@/lib/geolocation"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user token
    const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userData = await verifyRes.json()
    const userId = userData.user.id

    // Get client IP
    const clientIP = getClientIP(request)
    
    // Get geolocation data
    const geoData = await getIPGeolocation(clientIP)

    // Connect to PostgreSQL
    const pgClient = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    await pgClient.connect()

    // Check if connection already exists for this user and IP
    const existingConnection = await pgClient.query(`
      SELECT id FROM user_connections 
      WHERE user_id = $1 AND ip_address = $2
    `, [userId, clientIP])

    if (existingConnection.rows.length > 0) {
      // Update existing connection
      await pgClient.query(`
        UPDATE user_connections 
        SET last_seen = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND ip_address = $2
      `, [userId, clientIP])
    } else {
      // Insert new connection
      await pgClient.query(`
        INSERT INTO user_connections (
          user_id, ip_address, country, region, city, 
          latitude, longitude, timezone, isp, connection_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        userId,
        clientIP,
        geoData?.country || 'Unknown',
        geoData?.region || 'Unknown',
        geoData?.city || 'Unknown',
        geoData?.latitude || 0,
        geoData?.longitude || 0,
        geoData?.timezone || 'UTC',
        geoData?.isp || 'Unknown',
        'web'
      ])
    }

    await pgClient.end()

    return NextResponse.json({ 
      success: true, 
      ip: clientIP,
      location: geoData 
    })
  } catch (error) {
    console.error("Track connection error:", error)
    return NextResponse.json({ error: "Failed to track connection" }, { status: 500 })
  }
} 