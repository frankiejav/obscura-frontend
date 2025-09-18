/**
 * Permission and Entitlement Helpers
 * Enforces permission-based access control
 */

import { TokenPayload } from './auth';

// Permission definitions
export const PERMISSIONS = {
  // Credential permissions
  CREDS_READ_REDACTED: 'creds:read_redacted',
  CREDS_READ_FULL: 'creds:read_full',
  
  // Monitoring permissions
  MONITORING_BASIC: 'monitoring:basic',
  MONITORING_ADVANCED: 'monitoring:advanced',
  
  // API access
  API_ACCESS: 'api:access',
  
  // Premium features
  REALTIME_FEEDS: 'realtime:feeds',
  ANALYTICS_CUSTOM: 'analytics:custom',
} as const;

// Plan definitions
export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

// Plan feature mappings
export const PLAN_FEATURES = {
  free: {
    name: 'Free',
    permissions: [PERMISSIONS.CREDS_READ_REDACTED],
    limits: {
      searches_per_month: 100,
      monitoring_targets: 0,
      api_calls_per_month: 0,
    }
  },
  pro: {
    name: 'Professional',
    permissions: [
      PERMISSIONS.CREDS_READ_FULL,
      PERMISSIONS.MONITORING_BASIC,
      PERMISSIONS.API_ACCESS,
    ],
    limits: {
      searches_per_month: 10000,
      monitoring_targets: 10,
      api_calls_per_month: 50000,
    }
  },
  enterprise: {
    name: 'Enterprise',
    permissions: [
      PERMISSIONS.CREDS_READ_FULL,
      PERMISSIONS.MONITORING_ADVANCED,
      PERMISSIONS.API_ACCESS,
      PERMISSIONS.REALTIME_FEEDS,
      PERMISSIONS.ANALYTICS_CUSTOM,
    ],
    limits: {
      searches_per_month: -1, // Unlimited
      monitoring_targets: -1, // Unlimited
      api_calls_per_month: -1, // Unlimited
    }
  },
};

/**
 * Check if user has required permissions
 */
export function hasPermissions(
  userPerms: string[],
  requiredPerms: string[]
): boolean {
  return requiredPerms.every(perm => userPerms.includes(perm));
}

/**
 * Require specific permissions (throws if not met)
 */
export const need = (required: string[]) => (payload: TokenPayload) => {
  const perms: string[] = payload['https://obscura/perms'] || [];
  for (const p of required) {
    if (!perms.includes(p)) {
      throw new Error(`Missing required permission: ${p}`);
    }
  }
};

/**
 * Require specific plan (throws if not met)
 */
export const requirePlan = (allowed: string[]) => (payload: TokenPayload) => {
  const plan = payload['https://obscura/plan'] || 'free';
  if (!allowed.includes(plan)) {
    throw new Error(`Plan ${plan} not allowed. Required: ${allowed.join(' or ')}`);
  }
};

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  payload: TokenPayload,
  permission: string
): boolean {
  const perms: string[] = payload['https://obscura/perms'] || [];
  return perms.includes(permission);
}

/**
 * Get user's plan from token
 */
export function getPlanFromToken(payload: TokenPayload): string {
  return payload['https://obscura/plan'] || 'free';
}

/**
 * Get user's permissions from token
 */
export function getPermissionsFromToken(payload: TokenPayload): string[] {
  return payload['https://obscura/perms'] || [];
}

/**
 * Check if plan has access to a feature
 */
export function planHasFeature(
  plan: string,
  permission: string
): boolean {
  const planConfig = PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES];
  if (!planConfig) return false;
  return planConfig.permissions.includes(permission);
}

/**
 * Get upgrade path for a permission
 */
export function getUpgradePath(
  currentPlan: string,
  requiredPermission: string
): string | null {
  // If enterprise already, no upgrade possible
  if (currentPlan === 'enterprise') return null;
  
  // Check if pro has the permission
  if (planHasFeature('pro', requiredPermission)) {
    return 'pro';
  }
  
  // Check if enterprise has the permission
  if (planHasFeature('enterprise', requiredPermission)) {
    return 'enterprise';
  }
  
  return null;
}

/**
 * Middleware helper for API routes
 */
export function withPermissions(requiredPerms: string[]) {
  return (handler: Function) => {
    return async (req: any, ...args: any[]) => {
      try {
        const payload = req.auth; // Assumes auth middleware has set this
        need(requiredPerms)(payload);
        return handler(req, ...args);
      } catch (error) {
        return new Response('Forbidden', { status: 403 });
      }
    };
  };
}
