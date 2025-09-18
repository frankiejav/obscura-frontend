/**
 * GET /api/entitlements
 * Returns user's current entitlements and permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractBearerToken, getEffectivePlan } from '@/lib/auth';
import { getSubscription, getEntitlements } from '@/lib/db';
import { PLAN_FEATURES } from '@/lib/perms';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractBearerToken(authHeader);
    const payload = await verifyAccessToken(token);
    
    if (!payload.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get subscription and entitlements from database
    const subscription = await getSubscription(payload.sub);
    const dbEntitlements = await getEntitlements(payload.sub);
    
    // Get effective plan (with personal account override)
    const effectivePlan = getEffectivePlan(
      payload.sub, 
      subscription?.plan || 'free'
    );
    
    // Get plan features
    const planFeatures = PLAN_FEATURES[effectivePlan as keyof typeof PLAN_FEATURES];
    
    // Combine token permissions with DB entitlements
    const tokenPerms = payload['https://obscura/perms'] || [];
    const allPerms = [...new Set([...tokenPerms, ...dbEntitlements])];
    
    return NextResponse.json({
      plan: effectivePlan,
      planDisplayName: planFeatures.name,
      permissions: allPerms,
      limits: planFeatures.limits,
      subscription: subscription ? {
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        isActive: subscription.status === 'active',
        isCancelled: subscription.status === 'cancelled',
        isPastDue: subscription.status === 'past_due',
      } : null,
      features: {
        hasFullCredentialAccess: allPerms.includes('creds:read_full'),
        hasMonitoring: allPerms.includes('monitoring:basic') || allPerms.includes('monitoring:advanced'),
        hasAdvancedMonitoring: allPerms.includes('monitoring:advanced'),
        hasApiAccess: allPerms.includes('api:access'),
        hasRealtimeFeeds: allPerms.includes('realtime:feeds'),
        hasCustomAnalytics: allPerms.includes('analytics:custom'),
      },
      upgradePaths: getUpgradePaths(effectivePlan),
    });
  } catch (error) {
    console.error('Error in /api/entitlements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entitlements' },
      { status: 500 }
    );
  }
}

function getUpgradePaths(currentPlan: string) {
  const paths = [];
  
  if (currentPlan === 'free') {
    paths.push({
      plan: 'pro',
      name: 'Professional',
      price: '$99/month',
      benefits: [
        'Full credential access',
        'Basic monitoring',
        'API access',
        '10,000 searches/month'
      ]
    });
    paths.push({
      plan: 'enterprise',
      name: 'Enterprise',
      price: '$299/month',
      benefits: [
        'Everything in Pro',
        'Advanced monitoring',
        'Real-time feeds',
        'Custom analytics',
        'Unlimited searches'
      ]
    });
  } else if (currentPlan === 'pro') {
    paths.push({
      plan: 'enterprise',
      name: 'Enterprise',
      price: '$299/month',
      benefits: [
        'Advanced monitoring',
        'Real-time feeds',
        'Custom analytics',
        'Unlimited searches',
        'Priority support'
      ]
    });
  }
  
  return paths;
}
