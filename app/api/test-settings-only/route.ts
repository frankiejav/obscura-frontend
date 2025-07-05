import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// Copy the exact settings resolver logic
async function getSettings() {
  console.log('Settings resolver called')
  try {
    // Try to get settings from database
    const result = await db.query(
      'SELECT value FROM settings WHERE key = $1',
      ['default']
    )
    
    console.log('Database result:', result.rows.length, 'rows')
    
    const raw = result.rows.length > 0 ? result.rows[0].value : {
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
    };
    const settings = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const defaults = {
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
    };
    
    // Explicitly map the fields to ensure the shape matches the GraphQL type
    const mappedSettings = {
      general: {
        apiUrl: settings.general?.apiUrl || defaults.general.apiUrl,
        defaultPageSize: settings.general?.defaultPageSize || defaults.general.defaultPageSize,
        theme: settings.general?.theme || defaults.general.theme,
      },
      security: {
        twoFactorAuth: settings.security?.twoFactorAuth || defaults.security.twoFactorAuth,
        sessionTimeout: settings.security?.sessionTimeout || defaults.security.sessionTimeout,
        ipWhitelist: settings.security?.ipWhitelist || defaults.security.ipWhitelist,
        enforceStrongPasswords: settings.security?.enforceStrongPasswords || defaults.security.enforceStrongPasswords,
      },
      notifications: {
        emailAlerts: settings.notifications?.emailAlerts || defaults.notifications.emailAlerts,
        dailySummary: settings.notifications?.dailySummary || defaults.notifications.dailySummary,
        securityAlerts: settings.notifications?.securityAlerts || defaults.notifications.securityAlerts,
        dataUpdates: settings.notifications?.dataUpdates || defaults.notifications.dataUpdates,
      },
      api: {
        rateLimit: settings.api?.rateLimit || defaults.api.rateLimit,
        tokenExpiration: settings.api?.tokenExpiration || defaults.api.tokenExpiration,
        logLevel: settings.api?.logLevel || defaults.api.logLevel,
      },
      leakCheck: {
        enabled: settings.leakCheck?.enabled || defaults.leakCheck.enabled,
        quota: settings.leakCheck?.quota || defaults.leakCheck.quota,
        lastSync: settings.leakCheck?.lastSync ? new Date(settings.leakCheck.lastSync) : null,
      },
    }
    console.log('Returning mapped settings:', mappedSettings)
    return mappedSettings
  } catch (error) {
    console.error('Error fetching settings from database:', error)
    // If database error, return default settings
    const defaultSettings = {
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
    };
    console.log('Returning default settings due to error:', defaultSettings)
    return defaultSettings
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
      leakCheckEnabled: settings.leakCheck?.enabled,
      generalApiUrl: settings.general?.apiUrl
    })
  } catch (error) {
    console.error('Settings test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 