/**
 * WebAuthn Credentials Management API
 * List, rename, and delete security keys
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.sub

    const result = await sql`
      SELECT 
        id,
        credential_id,
        name,
        device_type,
        transports,
        created_at,
        last_used_at
      FROM webauthn_credentials 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    const credentials = Array.isArray(result) ? result : []

    return NextResponse.json({
      credentials: credentials.map((cred: any) => ({
        id: cred.id,
        credentialId: cred.credential_id,
        name: cred.name,
        deviceType: cred.device_type,
        transports: cred.transports || [],
        createdAt: cred.created_at,
        lastUsedAt: cred.last_used_at,
      }))
    })
  } catch (error) {
    console.error('WebAuthn credentials list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credentials' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth0.getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.sub
    const { credentialId, name } = await request.json()

    if (!credentialId || !name) {
      return NextResponse.json(
        { error: 'Credential ID and name are required' },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE webauthn_credentials 
      SET name = ${name}
      WHERE user_id = ${userId} AND credential_id = ${credentialId}
      RETURNING id, name
    `

    const updated = Array.isArray(result) ? result : []

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      credential: {
        id: updated[0].id,
        name: updated[0].name,
      }
    })
  } catch (error) {
    console.error('WebAuthn credential rename error:', error)
    return NextResponse.json(
      { error: 'Failed to rename credential' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth0.getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.sub
    const { searchParams } = new URL(request.url)
    const credentialId = searchParams.get('credentialId')

    if (!credentialId) {
      return NextResponse.json(
        { error: 'Credential ID is required' },
        { status: 400 }
      )
    }

    const countResult = await sql`
      SELECT COUNT(*) as count 
      FROM webauthn_credentials 
      WHERE user_id = ${userId}
    `

    const counts = Array.isArray(countResult) ? countResult : []
    const credentialCount = parseInt(counts[0]?.count || '0', 10)

    if (credentialCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete your only security key. Add another one first.' },
        { status: 400 }
      )
    }

    const result = await sql`
      DELETE FROM webauthn_credentials 
      WHERE user_id = ${userId} AND credential_id = ${credentialId}
      RETURNING id
    `

    const deleted = Array.isArray(result) ? result : []

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Security key removed successfully'
    })
  } catch (error) {
    console.error('WebAuthn credential delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete credential' },
      { status: 500 }
    )
  }
}
