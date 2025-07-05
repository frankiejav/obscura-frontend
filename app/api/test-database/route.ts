import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const pingResult = await db.ping()
    
    // Test settings query
    const settingsResult = await db.query(
      'SELECT value FROM settings WHERE key = $1',
      ['default']
    )
    
    return NextResponse.json({
      success: true,
      database: {
        connected: pingResult,
        settingsFound: settingsResult.rows.length > 0,
        settings: settingsResult.rows.length > 0 ? settingsResult.rows[0].value : null
      },
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? '[SET]' : '[NOT SET]',
        NODE_ENV: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? '[SET]' : '[NOT SET]',
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 })
  }
} 