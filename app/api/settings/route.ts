import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    // Get settings from database
    const result = await db.query(
      'SELECT * FROM settings WHERE key = $1',
      ['default']
    )
    
    if (result.rows.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        general: {
          apiUrl: "https://api.obscuralabs.io",
          defaultPageSize: "10",
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: "30",
          ipWhitelist: "",
          enforceStrongPasswords: true,
        },
        notifications: {
          emailAlerts: true,
          dailySummary: false,
          securityAlerts: true,
          dataUpdates: false,
        },
        api: {
          rateLimit: "1000",
          tokenExpiration: "24",
          logLevel: "info",
        },
      })
    }
    
    const settings = result.rows[0]
    return NextResponse.json(settings.value)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      {
        general: {
          apiUrl: "https://api.obscuralabs.io",
          defaultPageSize: "10",
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: "30",
          ipWhitelist: "",
          enforceStrongPasswords: true,
        },
        notifications: {
          emailAlerts: true,
          dailySummary: false,
          securityAlerts: true,
          dataUpdates: false,
        },
        api: {
          rateLimit: "1000",
          tokenExpiration: "24",
          logLevel: "info",
        },
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()
    
    // Upsert settings in database
    await db.query(
      `INSERT INTO settings (id, key, value) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (id) 
       DO UPDATE SET 
         value = EXCLUDED.value,
         updated_at = NOW()`,
      [
        'ec42d5d8-4a2d-4c9d-8e6d-b7fe64547018',
        'default',
        JSON.stringify(settings),
      ]
    )
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
} 