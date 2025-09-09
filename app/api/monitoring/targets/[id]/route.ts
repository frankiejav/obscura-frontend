import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { deleteMonitoringTarget } from '@/lib/neon-db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const targetId = params.id

    // Delete the monitoring target from Neon database
    const deleted = await deleteMonitoringTarget(targetId, userId)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Target not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Monitoring target deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting monitoring target:', error)
    return NextResponse.json(
      { error: 'Failed to delete monitoring target' },
      { status: 500 }
    )
  }
}