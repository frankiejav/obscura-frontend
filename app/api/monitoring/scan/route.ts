import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { getUserMonitoringTargets } from '@/lib/neon-db'

export async function POST(request: NextRequest) {
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
    const body = await request.json()
    const { targetId, scanAll } = body

    // Import the scan function from the targets route
    const { scanTarget } = await import('../targets/route')

    // If scanAll is true, scan all targets
    if (scanAll) {
      const targets = await getUserMonitoringTargets(userId)
      
      if (!targets || targets.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No targets to scan'
        })
      }

      // Scan all targets
      const scanPromises = targets.map((target: any) => 
        scanTarget(target, userId, session.user.email)
          .catch(error => {
            console.error(`Error scanning target ${target.id}:`, error)
            return { error: true, targetId: target.id }
          })
      )

      await Promise.all(scanPromises)

      return NextResponse.json({
        success: true,
        message: `Scanned ${targets.length} targets`
      })
    }

    // Single target scan
    if (!targetId) {
      return NextResponse.json(
        { error: 'Target ID is required when scanAll is not true' },
        { status: 400 }
      )
    }

    // Verify the target belongs to the user
    const targets = await getUserMonitoringTargets(userId)
    const target = targets.find((t: any) => t.id === targetId)

    if (!target) {
      return NextResponse.json(
        { error: 'Target not found or you do not have permission to scan it' },
        { status: 404 }
      )
    }
    
    // Trigger the scan
    await scanTarget(target, userId, session.user.email)

    return NextResponse.json({
      success: true,
      message: 'Scan initiated successfully'
    })
  } catch (error) {
    console.error('Error initiating scan:', error)
    return NextResponse.json(
      { error: 'Failed to initiate scan' },
      { status: 500 }
    )
  }
}