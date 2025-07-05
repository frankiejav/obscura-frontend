import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    // Get settings from database
    const result = await db.query(
      'SELECT * FROM settings WHERE id = 1'
    )
    
    if (result.rows.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        general: {
          apiUrl: "https://api.obscuralabs.io",
          defaultPageSize: "10",
          theme: "dark",
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
        leakCheck: {
          enabled: !!process.env.LEAKCHECK_API_KEY,
          quota: 400,
          lastSync: null,
        },
      })
    }
    
    const settings = result.rows[0]
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      {
        general: {
          apiUrl: "https://api.obscuralabs.io",
          defaultPageSize: "10",
          theme: "dark",
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
        leakCheck: {
          enabled: !!process.env.LEAKCHECK_API_KEY,
          quota: 400,
          lastSync: null,
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
      `INSERT INTO settings (id, general, security, notifications, api, leak_check) 
       VALUES (1, $1, $2, $3, $4, $5) 
       ON CONFLICT (id) 
       DO UPDATE SET 
         general = EXCLUDED.general,
         security = EXCLUDED.security,
         notifications = EXCLUDED.notifications,
         api = EXCLUDED.api,
         leak_check = EXCLUDED.leak_check`,
      [
        JSON.stringify(settings.general),
        JSON.stringify(settings.security),
        JSON.stringify(settings.notifications),
        JSON.stringify(settings.api),
        JSON.stringify(settings.leakCheck),
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