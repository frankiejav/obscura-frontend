import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { 
  getUserMonitoringTargets, 
  getUserScanResults, 
  addMonitoringTarget,
  updateTargetStatus,
  addScanResult,
  addMonitoringNotification
} from '@/lib/neon-db'
import { searchDataRecords, searchCookieRecords } from '@/lib/data-ingestion'
import { protectedRoute } from '@/lib/feature-guards'
import { Feature } from '@/lib/account-types'

async function getMonitoringTargets(request: NextRequest) {
  try {
    // Check if Auth0 is configured
    if (!auth0) {
      return NextResponse.json({ error: 'Authentication not configured' }, { status: 503 })
    }
    
    // Get the Auth0 session
    const session = await auth0.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.sub || session.user.id

    // Get user's monitoring targets and scan results from Neon
    const [targets, results] = await Promise.all([
      getUserMonitoringTargets(userId),
      getUserScanResults(userId)
    ])

    return NextResponse.json({
      targets,
      results
    })
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

async function addTarget(request: NextRequest) {
  try {
    // Check if Auth0 is configured
    if (!auth0) {
      return NextResponse.json({ error: 'Authentication not configured' }, { status: 503 })
    }
    
    // Get the Auth0 session
    const session = await auth0.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.sub || session.user.id
    const userEmail = session.user.email

    const body = await request.json()
    const { type, value, autoScan } = body

    // Validate input
    if (!type || !value) {
      return NextResponse.json(
        { error: 'Type and value are required' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['email', 'domain', 'phone', 'username', 'ip']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: ' + validTypes.join(', ') },
        { status: 400 }
      )
    }

    // Add the monitoring target to Neon database
    const newTarget = await addMonitoringTarget(userId, type, value, autoScan !== false)

    if (!newTarget) {
      return NextResponse.json(
        { error: 'Target already exists or could not be added' },
        { status: 400 }
      )
    }

    // If autoScan is enabled, trigger an immediate scan
    if (autoScan !== false) {
      // Trigger scan in background (don't await)
      setTimeout(() => {
        scanTarget(newTarget, userId, userEmail).catch(error => {
          console.error('Background scan error:', error)
        })
      }, 1000) // Small delay to ensure the target is properly saved
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

// Export protected routes with feature checks
export const GET = protectedRoute(getMonitoringTargets, {
  feature: Feature.CREDENTIAL_MONITORING,
})

export const POST = protectedRoute(addTarget, {
  feature: Feature.CREDENTIAL_MONITORING,
  checkLimit: 'monitoringTargets',
})

export async function scanTarget(target: any, userId: string, userEmail: string) {
  try {
    // Update status to scanning
    await updateTargetStatus(target.id, 'scanning')

    let breachesFound = 0
    const foundBreaches: any[] = []

    // Search in ClickHouse database based on target type
    if (target.type === 'email') {
      // Search for email in credentials
      const credsResult = await searchDataRecords({
        term: target.value,
        type: 'EMAIL',
        limit: 100
      })

      if (credsResult.results.length > 0) {
        // Group by source/domain
        const breachesBySource = new Map<string, any[]>()
        
        credsResult.results.forEach(record => {
          const key = record.source || record.domain || 'Unknown'
          if (!breachesBySource.has(key)) {
            breachesBySource.set(key, [])
          }
          breachesBySource.get(key)!.push(record)
        })

        // Create scan results for each breach
        for (const [source, records] of breachesBySource) {
          const breach = {
            source: 'database',
            breachName: source,
            breachDate: records[0].timestamp ? new Date(records[0].timestamp) : null,
            dataTypes: extractDataTypes(records[0]),
            severity: calculateSeverity(records[0]),
            details: {
              recordCount: records.length,
              sampleRecord: records[0]
            }
          }
          foundBreaches.push(breach)
          breachesFound++
        }
      }
    } else if (target.type === 'domain') {
      // Search for domain in credentials
      const credsResult = await searchDataRecords({
        term: target.value,
        type: 'DOMAIN',
        limit: 100
      })

      if (credsResult.results.length > 0) {
        const breach = {
          source: 'database',
          breachName: `${target.value} breach`,
          breachDate: null,
          dataTypes: ['email', 'password'],
          severity: 'high',
          details: {
            affectedAccounts: credsResult.results.length,
            uniqueEmails: new Set(credsResult.results.map(r => r.email)).size
          }
        }
        foundBreaches.push(breach)
        breachesFound = credsResult.results.length
      }

      // Also search in cookies
      const cookiesResult = await searchCookieRecords({
        term: target.value,
        type: 'DOMAIN',
        limit: 100
      })

      if (cookiesResult.results.length > 0) {
        const breach = {
          source: 'database',
          breachName: `${target.value} cookies`,
          breachDate: null,
          dataTypes: ['cookies'],
          severity: 'critical',
          details: {
            cookieCount: cookiesResult.results.length,
            uniqueVictims: new Set(cookiesResult.results.map(r => r.id)).size
          }
        }
        foundBreaches.push(breach)
        breachesFound += cookiesResult.results.length
      }
    } else if (target.type === 'username') {
      // Search for username in credentials
      const credsResult = await searchDataRecords({
        term: target.value,
        type: 'ALL',
        limit: 100
      })

      const usernameMatches = credsResult.results.filter(
        r => r.username?.toLowerCase() === target.value.toLowerCase()
      )

      if (usernameMatches.length > 0) {
        // Group by domain
        const breachesByDomain = new Map<string, any[]>()
        
        usernameMatches.forEach(record => {
          const key = record.domain || record.source || 'Unknown'
          if (!breachesByDomain.has(key)) {
            breachesByDomain.set(key, [])
          }
          breachesByDomain.get(key)!.push(record)
        })

        for (const [domain, records] of breachesByDomain) {
          const breach = {
            source: 'database',
            breachName: domain,
            breachDate: null,
            dataTypes: extractDataTypes(records[0]),
            severity: calculateSeverity(records[0]),
            details: {
              recordCount: records.length
            }
          }
          foundBreaches.push(breach)
          breachesFound++
        }
      }
    }

    // Check LeakCheck API if configured (optional)
    if (process.env.LEAKCHECK_API_KEY && target.type === 'email') {
      try {
        const leakcheckResponse = await fetch(`https://leakcheck.io/api/public?check=${target.value}`, {
          headers: {
            'X-API-Key': process.env.LEAKCHECK_API_KEY
          }
        })

        if (leakcheckResponse.ok) {
          const leakcheckData = await leakcheckResponse.json()
          if (leakcheckData.found && leakcheckData.sources) {
            leakcheckData.sources.forEach((source: any) => {
              const breach = {
                source: 'leakcheck',
                breachName: source.name,
                breachDate: source.breach_date ? new Date(source.breach_date) : null,
                dataTypes: ['email', 'password'],
                severity: 'high',
                details: source
              }
              foundBreaches.push(breach)
              breachesFound++
            })
          }
        }
      } catch (leakcheckError) {
        console.error('LeakCheck API error:', leakcheckError)
      }
    }

    // Save scan results to database
    for (const breach of foundBreaches) {
      await addScanResult(
        target.id,
        breach.source,
        breach.breachName,
        breach.breachDate,
        breach.dataTypes,
        breach.severity,
        breach.details
      )
    }

    // Update target status
    const finalStatus = breachesFound > 0 ? 'found' : 'clean'
    await updateTargetStatus(target.id, finalStatus, breachesFound)

    // Create notification if breaches were found
    if (breachesFound > 0) {
      await addMonitoringNotification(
        userId,
        target.id,
        'breach_found',
        `Breaches found for ${target.value}`,
        `We found ${breachesFound} breach${breachesFound > 1 ? 'es' : ''} for ${target.type}: ${target.value}`,
        foundBreaches[0].severity
      )
    }

    return { breachesFound, foundBreaches }
  } catch (error) {
    console.error('Error scanning target:', error)
    await updateTargetStatus(target.id, 'error')
    throw error
  }
}

function extractDataTypes(record: any): string[] {
  const types = []
  if (record.email) types.push('email')
  if (record.password) types.push('password')
  if (record.name) types.push('name')
  if (record.phone) types.push('phone')
  if (record.address) types.push('address')
  if (record.ip) types.push('ip_address')
  if (types.length === 0) types.push('unknown')
  return types
}

function calculateSeverity(record: any): string {
  if (record.is_privileged) return 'critical'
  if (record.password && record.email) return 'high'
  if (record.password || record.email) return 'medium'
  return 'low'
}