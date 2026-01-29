/**
 * WebAuthn Authentication API
 * Handles security key and passkey authentication using @simplewebauthn/server
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { sql } from '@/lib/db'
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'

type AuthenticatorTransportFuture = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb'

function getRpId(request: NextRequest): string {
  const hostname = request.headers.get('host') || 'localhost'
  return hostname.split(':')[0]
}

function getExpectedOrigin(request: NextRequest): string {
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('host') || 'localhost:3000'
  return `${protocol}://${host}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession(request)
    const userId = session?.user?.sub
    const rpId = getRpId(request)

    let allowCredentials: { id: string; transports?: AuthenticatorTransportFuture[] }[] = []
    
    if (userId) {
      const credentials = await sql`
        SELECT credential_id, transports 
        FROM webauthn_credentials 
        WHERE user_id = ${userId}
      `

      const credList = Array.isArray(credentials) ? credentials : []
      allowCredentials = credList.map((cred: any) => ({
        id: cred.credential_id,
        transports: (cred.transports || []) as AuthenticatorTransportFuture[],
      }))
    }

    const options = await generateAuthenticationOptions({
      rpID: rpId,
      userVerification: 'preferred',
      allowCredentials,
    })

    const challengeUserId = userId || 'anonymous'
    await sql`
      INSERT INTO webauthn_challenges (user_id, challenge, type, expires_at)
      VALUES (${challengeUserId}, ${options.challenge}, 'authentication', NOW() + INTERVAL '5 minutes')
      ON CONFLICT (user_id, type) 
      DO UPDATE SET challenge = EXCLUDED.challenge, expires_at = EXCLUDED.expires_at
    `

    return NextResponse.json(options)
  } catch (error) {
    console.error('WebAuthn authentication options error:', error)
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { expectedUserId, ...credential } = body

    if (!credential?.id || !credential?.response) {
      return NextResponse.json(
        { error: 'Invalid credential data' },
        { status: 400 }
      )
    }

    const credentialResult = await sql`
      SELECT 
        wc.user_id,
        wc.credential_id,
        wc.public_key,
        wc.counter,
        wc.transports,
        wc.name,
        wc.device_type,
        u.email
      FROM webauthn_credentials wc
      JOIN users u ON u.auth0_user_id = wc.user_id
      WHERE wc.credential_id = ${credential.id}
    `

    const credentials = Array.isArray(credentialResult) ? credentialResult : []
    
    if (credentials.length === 0) {
      return NextResponse.json(
        { error: 'Security key not recognized' },
        { status: 401 }
      )
    }

    const storedCredential = credentials[0]
    const userId = storedCredential.user_id

    if (expectedUserId && expectedUserId !== userId) {
      return NextResponse.json(
        { error: 'Security key does not belong to this account' },
        { status: 401 }
      )
    }

    const challengeResult = await sql`
      SELECT challenge FROM webauthn_challenges 
      WHERE (user_id = ${userId} OR user_id = 'anonymous')
        AND type = 'authentication' 
        AND expires_at > NOW()
      ORDER BY expires_at DESC
      LIMIT 1
    `

    const challenges = Array.isArray(challengeResult) ? challengeResult : []
    
    if (challenges.length === 0) {
      return NextResponse.json(
        { error: 'Challenge expired or not found' },
        { status: 400 }
      )
    }

    const expectedChallenge = challenges[0].challenge
    const rpId = getRpId(request)
    const expectedOrigin = getExpectedOrigin(request)

    const publicKeyBytes = Buffer.from(storedCredential.public_key, 'base64url')
    
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpId,
      credential: {
        id: storedCredential.credential_id,
        publicKey: new Uint8Array(publicKeyBytes),
        counter: storedCredential.counter || 0,
        transports: (storedCredential.transports || []) as AuthenticatorTransportFuture[],
      },
      requireUserVerification: false,
    })

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    await sql`
      UPDATE webauthn_credentials 
      SET counter = ${verification.authenticationInfo.newCounter}, last_used_at = NOW()
      WHERE credential_id = ${credential.id}
    `

    await sql`
      DELETE FROM webauthn_challenges 
      WHERE user_id = ${userId} AND type = 'authentication'
    `

    await sql`
      DELETE FROM webauthn_challenges 
      WHERE user_id = 'anonymous' AND type = 'authentication'
    `

    return NextResponse.json({
      success: true,
      verified: true,
      user: {
        id: userId,
        email: storedCredential.email,
      },
      credential: {
        id: credential.id,
        name: storedCredential.name,
        deviceType: storedCredential.device_type,
      }
    })
  } catch (error: any) {
    console.error('WebAuthn authentication error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify security key' },
      { status: 500 }
    )
  }
}
