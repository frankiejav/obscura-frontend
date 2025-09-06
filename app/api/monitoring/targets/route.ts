import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/clickhouse'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for demo purposes - in production, use a database
let monitoringTargets: any[] = []
let scanResults: any[] = []

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, using a default user
    // In production, integrate with Auth0
    const userEmail = 'demo@example.com'

    // Filter targets and results based on user
    const userTargets = monitoringTargets.filter(
      target => target.userId === userEmail
    )
    const userResults = scanResults.filter(
      result => userTargets.some(t => t.id === result.targetId)
    )

    return NextResponse.json({
      targets: userTargets,
      results: userResults
    })
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // For demo purposes, using a default user
    // In production, integrate with Auth0
    const userEmail = 'demo@example.com'

    const body = await request.json()
    const { type, value, autoScan } = body

    // Validate input
    if (!type || !value) {
      return NextResponse.json(
        { error: 'Type and value are required' },
        { status: 400 }
      )
    }

    // Check if target already exists for this user
    const existing = monitoringTargets.find(
      t => t.value === value && t.userId === userEmail
    )

    if (existing) {
      return NextResponse.json(
        { error: 'Target already exists' },
        { status: 400 }
      )
    }

    // Create new monitoring target
    const newTarget = {
      id: uuidv4(),
      type,
      value: value.toLowerCase().trim(),
      userId: userEmail,
      lastScanned: null,
      status: 'pending',
      breachCount: 0,
      addedAt: new Date().toISOString(),
      autoScan: autoScan !== false
    }

    monitoringTargets.push(newTarget)

    // If autoScan is enabled, trigger an immediate scan
    if (newTarget.autoScan) {
      // In production, this would trigger a background job
      setTimeout(() => scanTarget(newTarget), 1000)
    }

    return NextResponse.json(newTarget)
  } catch (error) {
    console.error('Error adding monitoring target:', error)
    return NextResponse.json(
      { error: 'Failed to add monitoring target' },
      { status: 500 }
    )
  }
}

async function scanTarget(target: any) {
  try {
    // Update status to scanning
    const targetIndex = monitoringTargets.findIndex(t => t.id === target.id)
    if (targetIndex !== -1) {
      monitoringTargets[targetIndex].status = 'scanning'
    }

    // Simulate scanning with LeakCheck API and ClickHouse
    // In production, you would make actual API calls here
    
    // Search in ClickHouse database
    const clickhouse = createClient()
    let query = ''
    
    if (target.type === 'email') {
      query = `
        SELECT DISTINCT database_name, breach_date, COUNT(*) as count
        FROM breaches
        WHERE email = '${target.value}'
        GROUP BY database_name, breach_date
        LIMIT 100
      `
    } else if (target.type === 'domain') {
      query = `
        SELECT DISTINCT database_name, breach_date, COUNT(*) as count
        FROM breaches
        WHERE email LIKE '%@${target.value}'
        GROUP BY database_name, breach_date
        LIMIT 100
      `
    } else if (target.type === 'phone') {
      query = `
        SELECT DISTINCT database_name, breach_date, COUNT(*) as count
        FROM breaches
        WHERE phone = '${target.value}'
        GROUP BY database_name, breach_date
        LIMIT 100
      `
    }

    // For demo purposes, simulate finding some breaches randomly
    const hasBreaches = Math.random() > 0.6
    
    if (hasBreaches) {
      const breachCount = Math.floor(Math.random() * 5) + 1
      
      for (let i = 0; i < breachCount; i++) {
        const breachNames = ['LinkedIn', 'Adobe', 'Dropbox', 'Twitter', 'Facebook', 'Yahoo', 'Uber']
        const result = {
          id: uuidv4(),
          targetId: target.id,
          targetValue: target.value,
          source: Math.random() > 0.5 ? 'leakcheck' : 'database',
          breachName: breachNames[Math.floor(Math.random() * breachNames.length)],
          breachDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12)).toISOString(),
          dataTypes: ['email', 'password', 'name'].slice(0, Math.floor(Math.random() * 3) + 1),
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
          foundAt: new Date().toISOString()
        }
        scanResults.push(result)
      }
      
      // Update target status and breach count
      if (targetIndex !== -1) {
        monitoringTargets[targetIndex].status = 'found'
        monitoringTargets[targetIndex].breachCount = breachCount
        monitoringTargets[targetIndex].lastScanned = new Date().toISOString()
      }
    } else {
      // No breaches found
      if (targetIndex !== -1) {
        monitoringTargets[targetIndex].status = 'clean'
        monitoringTargets[targetIndex].breachCount = 0
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
