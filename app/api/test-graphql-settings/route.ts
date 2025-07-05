import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// Copy the settings resolver logic here for testing
async function getSettings() {
  try {
    // Try to get settings from database
    const result = await db.query(
      'SELECT value FROM settings WHERE key = $1',
      ['default']
    )
    
    if (result.rows.length > 0) {
      return result.rows[0].value
    }
    
    // If no settings found, return default settings
    return {
      general: {
        apiUrl: "",
        defaultPageSize: "20",
        theme: "system",
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
        rateLimit: "100",
        tokenExpiration: "7",
        logLevel: "info",
      },
      leakCheck: {
        enabled: false,
        quota: 0,
        lastSync: null,
      },
    }
  } catch (error) {
    console.error('Error fetching settings from database:', error)
    // If database error, return default settings
    return {
      general: {
        apiUrl: "",
        defaultPageSize: "20",
        theme: "system",
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
        rateLimit: "100",
        tokenExpiration: "7",
        logLevel: "info",
      },
      leakCheck: {
        enabled: false,
        quota: 0,
        lastSync: null,
      },
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const settings = await getSettings()
    
    return NextResponse.json({
      success: true,
      settings: settings,
      settingsType: typeof settings,
      hasLeakCheck: !!settings.leakCheck,
      leakCheckEnabled: settings.leakCheck?.enabled
    })
  } catch (error) {
    console.error('Settings test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 