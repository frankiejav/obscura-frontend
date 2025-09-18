/**
 * Auth0 JWT Verification and Management
 * Handles token verification and Auth0 Management API operations
 */

import { jwtVerify, createRemoteJWKSet } from 'jose';

const issuer = process.env.AUTH0_ISSUER_BASE_URL!;
const audience = process.env.AUTH0_AUDIENCE!;
const jwks = createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`));

export interface TokenPayload {
  sub?: string;
  email?: string;
  'https://obscura/plan'?: string;
  'https://obscura/perms'?: string[];
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
}

/**
 * Verify an Auth0 access token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience,
      clockTolerance: 60
    });
    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No bearer token provided');
  }
  return authHeader.slice(7);
}

/**
 * Get Auth0 Management API access token
 */
async function getManagementToken(): Promise<string> {
  const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.AUTH0_MGMT_AUDIENCE
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get Management API token');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Update user's app_metadata with plan information
 */
export async function setAppMetadataPlan(userId: string, plan: 'free' | 'pro' | 'enterprise'): Promise<void> {
  try {
    const accessToken = await getManagementToken();
    
    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
      {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          app_metadata: { plan }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update user metadata: ${error}`);
    }
  } catch (error) {
    console.error('Error updating Auth0 app_metadata:', error);
    throw error;
  }
}

/**
 * Get user details from Auth0
 */
export async function getUserFromAuth0(userId: string): Promise<any> {
  try {
    const accessToken = await getManagementToken();
    
    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
      {
        headers: {
          'authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get user from Auth0');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user from Auth0:', error);
    throw error;
  }
}

/**
 * Check if user is the personal account (always Enterprise)
 */
export function isPersonalAccount(userId: string): boolean {
  return userId === process.env.PERSONAL_AUTH0_USER_ID;
}

/**
 * Get effective plan for a user (personal account override)
 */
export function getEffectivePlan(userId: string, actualPlan: string): 'free' | 'pro' | 'enterprise' {
  if (isPersonalAccount(userId)) {
    return 'enterprise';
  }
  return actualPlan as 'free' | 'pro' | 'enterprise';
}
