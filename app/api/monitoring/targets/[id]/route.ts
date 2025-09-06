import { NextRequest, NextResponse } from 'next/server'

// Import the shared storage (in production, use a database)
let monitoringTargets: any[] = []
let scanResults: any[] = []

// This is a workaround for the demo - in production, use a proper database
if (typeof global !== 'undefined') {
  if (!global.monitoringTargets) {
    global.monitoringTargets = []
  }
  if (!global.scanResults) {
    global.scanResults = []
  }
  monitoringTargets = global.monitoringTargets
  scanResults = global.scanResults
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For demo purposes, using a default user
    // In production, integrate with Auth0
    const userEmail = 'demo@example.com'

    const targetId = params.id

    // Find the target
    const targetIndex = monitoringTargets.findIndex(
      t => t.id === targetId && t.userId === userEmail
    )

    if (targetIndex === -1) {
      return NextResponse.json(
        { error: 'Target not found' },
        { status: 404 }
      )
    }

    // Remove the target
    monitoringTargets.splice(targetIndex, 1)

    // Remove associated scan results
    scanResults = scanResults.filter(r => r.targetId !== targetId)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.monitoringTargets = monitoringTargets
      global.scanResults = scanResults
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting monitoring target:', error)
    return NextResponse.json(
      { error: 'Failed to delete monitoring target' },
      { status: 500 }
    )
  }
}
