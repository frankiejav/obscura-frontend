/**
 * WebAuthn Registration API
 * Handles security key and passkey registration using @simplewebauthn/server
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { sql } from '@/lib/db'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server'

type AuthenticatorTransportFuture = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb'

const RP_NAME = 'Obscura Labs'

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
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.sub
    const userEmail = session.user.email || ''
    const userName = session.user.name || userEmail
    const rpId = getRpId(request)

    const existingCredentialsResult = await sql`
      SELECT credential_id, transports 
      FROM webauthn_credentials 
      WHERE user_id = ${userId}
    `

    const existingCredentials = Array.isArray(existingCredentialsResult) 
      ? existingCredentialsResult 
      : []

    const excludeCredentials = existingCredentials.map((cred: any) => ({
      id: cred.credential_id,
      transports: (cred.transports || []) as AuthenticatorTransportFuture[],
    }))

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: rpId,
      userName: userEmail,
      userDisplayName: userName,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257, -8],
    })

    await sql`
      INSERT INTO webauthn_challenges (user_id, challenge, type, expires_at)
      VALUES (${userId}, ${options.challenge}, 'registration', NOW() + INTERVAL '5 minutes')
      ON CONFLICT (user_id, type) 
      DO UPDATE SET challenge = EXCLUDED.challenge, expires_at = EXCLUDED.expires_at
    `

    return NextResponse.json(options)
  } catch (error) {
    console.error('WebAuthn registration options error:', error)
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.sub
    const body = await request.json()
    const { name, ...credential } = body

    if (!credential?.id || !credential?.response) {
      return NextResponse.json(
        { error: 'Invalid credential data' },
        { status: 400 }
      )
    }

    const challengeResult = await sql`
      SELECT challenge FROM webauthn_challenges 
      WHERE user_id = ${userId} 
        AND type = 'registration' 
        AND expires_at > NOW()
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

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpId,
      requireUserVerification: false,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      )
    }

    const { credential: verifiedCredential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo
    const transports = credential.response.transports || []
    const deviceType = credentialDeviceType === 'singleDevice' ? 'cross-platform' : 'platform'
    const credentialName = name || getDefaultName(transports, deviceType)

    const credentialIdBase64 = Buffer.from(verifiedCredential.id).toString('base64url')
    const publicKeyBase64 = Buffer.from(verifiedCredential.publicKey).toString('base64url')

    await sql`
      INSERT INTO webauthn_credentials (
        user_id,
        credential_id,
        public_key,
        counter,
        device_type,
        transports,
        name
      )
      VALUES (
        ${userId},
        ${credentialIdBase64},
        ${publicKeyBase64},
        ${verifiedCredential.counter},
        ${deviceType},
        ${transports},
        ${credentialName}
      )
    `

    await sql`
      DELETE FROM webauthn_challenges 
      WHERE user_id = ${userId} AND type = 'registration'
    `

    return NextResponse.json({
      success: true,
      verified: verification.verified,
      credential: {
        id: credentialIdBase64,
        name: credentialName,
        deviceType,
        transports,
        backedUp: credentialBackedUp,
        createdAt: new Date().toISOString(),
      }
    })
  } catch (error: any) {
    console.error('WebAuthn registration error:', error)
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'This security key is already registered' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to register security key' },
      { status: 500 }
    )
  }
}

function getDefaultName(transports: string[], deviceType: string): string {
  if (deviceType === 'platform') {
    return 'Built-in Authenticator'
  }
  
  if (transports.includes('usb')) {
    return 'Security Key (USB)'
  }
  if (transports.includes('nfc')) {
    return 'Security Key (NFC)'
  }
  if (transports.includes('ble')) {
    return 'Security Key (Bluetooth)'
  }
  if (transports.includes('hybrid')) {
    return 'Phone/Tablet'
  }
  
  return 'Security Key'
}
