/**
 * GET /api/auth/me
 * Returns current user information from JWT token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractBearerToken, getEffectivePlan } from '@/lib/auth';
import { getSubscription, getEntitlements } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractBearerToken(authHeader);
    const payload = await verifyAccessToken(token);
    
    if (!payload.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get subscription from database
    const subscription = await getSubscription(payload.sub);
    const entitlements = await getEntitlements(payload.sub);
    
    // Get effective plan (with personal account override)
    const effectivePlan = getEffectivePlan(
      payload.sub, 
      subscription?.plan || 'free'
    );
    
    return NextResponse.json({
      sub: payload.sub,
      email: payload.email,
      plan: effectivePlan,
      perms: payload['https://obscura/perms'] || entitlements,
      subscription: subscription ? {
        status: subscription.status,
        current_period_end: subscription.current_period_end,
      } : null,
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
