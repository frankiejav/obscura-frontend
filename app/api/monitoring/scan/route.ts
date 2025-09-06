import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/clickhouse'
import { v4 as uuidv4 } from 'uuid'

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

export async function POST(request: NextRequest) {
  try {
    // For demo purposes, using a default user
    // In production, integrate with Auth0
    const userEmail = 'demo@example.com'

    const body = await request.json()
    const { targetId, scanAll } = body

    // Get targets to scan
    let targetsToScan = []
    
    if (scanAll) {
      targetsToScan = monitoringTargets.filter(t => t.userId === userEmail)
    } else if (targetId) {
      const target = monitoringTargets.find(
        t => t.id === targetId && t.userId === userEmail
      )
      if (target) {
        targetsToScan = [target]
      }
    }

    if (targetsToScan.length === 0) {
      return NextResponse.json(
        { error: 'No targets to scan' },
        { status: 400 }
      )
    }

    // Update scan stats
    if (!scanStats[userEmail]) {
      scanStats[userEmail] = { totalScans: 0, lastScanTime: null }
    }
    scanStats[userEmail].totalScans += targetsToScan.length
    scanStats[userEmail].lastScanTime = new Date().toISOString()

    // Scan each target
    for (const target of targetsToScan) {
      await scanTarget(target, userEmail)
    }

    // Update global storage
    if (typeof global !== 'undefined') {
      global.monitoringTargets = monitoringTargets
      global.scanResults = scanResults
      global.scanStats = scanStats
    }

    return NextResponse.json({
      success: true,
      scanned: targetsToScan.length
    })
  } catch (error) {
    console.error('Error scanning targets:', error)
    return NextResponse.json(
      { error: 'Failed to scan targets' },
      { status: 500 }
    )
  }
}

async function scanTarget(target: any, userEmail: string) {
  try {
    // Update status to scanning
    const targetIndex = monitoringTargets.findIndex(t => t.id === target.id)
    if (targetIndex !== -1) {
      monitoringTargets[targetIndex].status = 'scanning'
    }

    // In production, you would:
    // 1. Query LeakCheck API for the target
    // 2. Query ClickHouse database for the target
    // 3. Combine and deduplicate results
    
    // For demo, simulate scanning with random results
    const hasNewBreaches = Math.random() > 0.7
    
    if (hasNewBreaches) {
      const breachCount = Math.floor(Math.random() * 3) + 1
      const breachDatabase = [
        { name: 'LinkedIn', date: '2021-06-01', severity: 'high' },
        { name: 'Adobe', date: '2022-10-01', severity: 'critical' },
        { name: 'Dropbox', date: '2023-08-01', severity: 'medium' },
        { name: 'Twitter', date: '2023-01-01', severity: 'high' },
        { name: 'Facebook', date: '2021-04-01', severity: 'critical' },
        { name: 'Yahoo', date: '2022-09-01', severity: 'high' },
        { name: 'Uber', date: '2023-11-01', severity: 'medium' },
        { name: 'Canva', date: '2023-05-01', severity: 'low' },
        { name: 'Discord', date: '2023-03-01', severity: 'medium' },
        { name: 'Spotify', date: '2022-11-01', severity: 'low' }
      ]
      
      // Remove existing results for this target to avoid duplicates
      const existingResults = scanResults.filter(r => r.targetId === target.id)
      
      for (let i = 0; i < breachCount; i++) {
        const breach = breachDatabase[Math.floor(Math.random() * breachDatabase.length)]
        
        // Check if this breach already exists for this target
        const alreadyExists = existingResults.some(
          r => r.breachName === breach.name && r.targetId === target.id
        )
        
        if (!alreadyExists) {
          const result = {
            id: uuidv4(),
            targetId: target.id,
            targetValue: target.value,
            source: Math.random() > 0.5 ? 'leakcheck' : 'database',
            breachName: breach.name,
            breachDate: breach.date,
            dataTypes: getDataTypesForBreach(breach.name),
            severity: breach.severity,
            foundAt: new Date().toISOString()
          }
          scanResults.push(result)
        }
      }
      
      // Update breach count
      const totalBreaches = scanResults.filter(r => r.targetId === target.id).length
      
      if (targetIndex !== -1) {
        monitoringTargets[targetIndex].status = 'found'
        monitoringTargets[targetIndex].breachCount = totalBreaches
        monitoringTargets[targetIndex].lastScanned = new Date().toISOString()
      }
    } else {
      // No new breaches found, but keep existing ones
      const existingBreachCount = scanResults.filter(r => r.targetId === target.id).length
      
      if (targetIndex !== -1) {
        monitoringTargets[targetIndex].status = existingBreachCount > 0 ? 'found' : 'clean'
        monitoringTargets[targetIndex].breachCount = existingBreachCount
        monitoringTargets[targetIndex].lastScanned = new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Error scanning target:', error)
    const targetIndex = monitoringTargets.findIndex(t => t.id === target.id)
    if (targetIndex !== -1) {
      monitoringTargets[targetIndex].status = 'error'
    }
  }
}

function getDataTypesForBreach(breachName: string): string[] {
  const breachDataTypes: Record<string, string[]> = {
    'LinkedIn': ['email', 'password', 'name', 'job_title'],
    'Adobe': ['email', 'password_hash', 'username'],
    'Dropbox': ['email', 'password_hash'],
    'Twitter': ['email', 'username', 'phone', 'ip_address'],
    'Facebook': ['email', 'phone', 'name', 'location'],
    'Yahoo': ['email', 'password_hash', 'name', 'phone'],
    'Uber': ['email', 'name', 'phone', 'location'],
    'Canva': ['email', 'username', 'name'],
    'Discord': ['email', 'username', 'password_hash'],
    'Spotify': ['email', 'username', 'password']
  }
  
  return breachDataTypes[breachName] || ['email', 'password']
}
