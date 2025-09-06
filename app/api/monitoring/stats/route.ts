import { NextRequest, NextResponse } from 'next/server'

// Use global storage for demo
let monitoringTargets: any[] = []
let scanResults: any[] = []
let scanStats: any = {}

if (typeof global !== 'undefined') {
  if (!global.monitoringTargets) {
    global.monitoringTargets = []
  }
  if (!global.scanResults) {
    global.scanResults = []
  }
  if (!global.scanStats) {
    global.scanStats = {}
  }
  monitoringTargets = global.monitoringTargets
  scanResults = global.scanResults
  scanStats = global.scanStats
}

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, using a default user
    // In production, integrate with Auth0
    const userEmail = 'demo@example.com'
    
    // Get user-specific stats
    const userTargets = monitoringTargets.filter(t => t.userId === userEmail)
    const userResults = scanResults.filter(
      r => userTargets.some(t => t.id === r.targetId)
    )

    // Calculate stats
    const stats = {
      totalScans: scanStats[userEmail]?.totalScans || 0,
      breachesFound: userResults.length,
      lastScanTime: scanStats[userEmail]?.lastScanTime || null,
      nextScanTime: null as string | null
    }

    // Calculate next scan time (6 hours from last scan)
    if (stats.lastScanTime) {
      const lastScan = new Date(stats.lastScanTime)
      const nextScan = new Date(lastScan.getTime() + 6 * 60 * 60 * 1000)
      stats.nextScanTime = nextScan.toISOString()
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching scan stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scan stats' },
      { status: 500 }
    )
  }
}
