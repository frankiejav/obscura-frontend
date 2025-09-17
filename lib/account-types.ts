/**
 * Account Types and Feature Configuration
 * Defines all subscription tiers and their associated features/limits
 */

export enum AccountType {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional', 
  ENTERPRISE = 'enterprise',
}

export enum Feature {
  // Core Features
  DASHBOARD_ACCESS = 'dashboard_access',
  SEARCH = 'search',
  DATA_EXPORT = 'data_export',
  
  // Advanced Features
  CREDENTIAL_MONITORING = 'credential_monitoring',
  API_ACCESS = 'api_access',
  REALTIME_FEEDS = 'realtime_feeds',
  CUSTOM_ANALYTICS = 'custom_analytics',
  
  // User Management
  USER_MANAGEMENT = 'user_management',
  TEAM_COLLABORATION = 'team_collaboration',
  
  // Support
  PRIORITY_SUPPORT = 'priority_support',
  DEDICATED_SUPPORT = 'dedicated_support',
}

export interface FeatureLimit {
  enabled: boolean
  limit?: number
  unit?: 'day' | 'month' | 'total'
}

export interface AccountFeatures {
  type: AccountType
  displayName: string
  features: Record<Feature, FeatureLimit>
  limits: {
    lookupsPerDay?: number
    lookupsPerMonth?: number
    apiCreditsPerMonth?: number
    maxMonitoringTargets?: number
    maxTeamMembers?: number
    dataRetentionDays?: number
  }
}

// Feature configurations for each account type
export const ACCOUNT_FEATURES: Record<AccountType, AccountFeatures> = {
  [AccountType.FREE]: {
    type: AccountType.FREE,
    displayName: 'Free',
    features: {
      [Feature.DASHBOARD_ACCESS]: { enabled: true },
      [Feature.SEARCH]: { enabled: true },
      [Feature.DATA_EXPORT]: { enabled: false },
      [Feature.CREDENTIAL_MONITORING]: { enabled: false },
      [Feature.API_ACCESS]: { enabled: false },
      [Feature.REALTIME_FEEDS]: { enabled: false },
      [Feature.CUSTOM_ANALYTICS]: { enabled: false },
      [Feature.USER_MANAGEMENT]: { enabled: false },
      [Feature.TEAM_COLLABORATION]: { enabled: false },
      [Feature.PRIORITY_SUPPORT]: { enabled: false },
      [Feature.DEDICATED_SUPPORT]: { enabled: false },
    },
    limits: {
      lookupsPerDay: 10,
      maxMonitoringTargets: 0,
      maxTeamMembers: 1,
      dataRetentionDays: 7,
    },
  },
  
  [AccountType.STARTER]: {
    type: AccountType.STARTER,
    displayName: 'Starter',
    features: {
      [Feature.DASHBOARD_ACCESS]: { enabled: true },
      [Feature.SEARCH]: { enabled: true },
      [Feature.DATA_EXPORT]: { enabled: true },
      [Feature.CREDENTIAL_MONITORING]: { enabled: false },
      [Feature.API_ACCESS]: { enabled: false },
      [Feature.REALTIME_FEEDS]: { enabled: false },
      [Feature.CUSTOM_ANALYTICS]: { enabled: false },
      [Feature.USER_MANAGEMENT]: { enabled: false },
      [Feature.TEAM_COLLABORATION]: { enabled: false },
      [Feature.PRIORITY_SUPPORT]: { enabled: false },
      [Feature.DEDICATED_SUPPORT]: { enabled: false },
    },
    limits: {
      lookupsPerDay: 200,
      maxMonitoringTargets: 0,
      maxTeamMembers: 1,
      dataRetentionDays: 30,
    },
  },
  
  [AccountType.PROFESSIONAL]: {
    type: AccountType.PROFESSIONAL,
    displayName: 'Professional',
    features: {
      [Feature.DASHBOARD_ACCESS]: { enabled: true },
      [Feature.SEARCH]: { enabled: true },
      [Feature.DATA_EXPORT]: { enabled: true },
      [Feature.CREDENTIAL_MONITORING]: { enabled: true },
      [Feature.API_ACCESS]: { enabled: true },
      [Feature.REALTIME_FEEDS]: { enabled: false },
      [Feature.CUSTOM_ANALYTICS]: { enabled: false },
      [Feature.USER_MANAGEMENT]: { enabled: true },
      [Feature.TEAM_COLLABORATION]: { enabled: true },
      [Feature.PRIORITY_SUPPORT]: { enabled: true },
      [Feature.DEDICATED_SUPPORT]: { enabled: false },
    },
    limits: {
      lookupsPerMonth: -1, // Unlimited
      apiCreditsPerMonth: 10000, // Per month even though billed quarterly
      maxMonitoringTargets: 100,
      maxTeamMembers: 5,
      dataRetentionDays: 90,
    },
  },
  
  [AccountType.ENTERPRISE]: {
    type: AccountType.ENTERPRISE,
    displayName: 'Enterprise',
    features: {
      [Feature.DASHBOARD_ACCESS]: { enabled: true },
      [Feature.SEARCH]: { enabled: true },
      [Feature.DATA_EXPORT]: { enabled: true },
      [Feature.CREDENTIAL_MONITORING]: { enabled: true },
      [Feature.API_ACCESS]: { enabled: true },
      [Feature.REALTIME_FEEDS]: { enabled: true },
      [Feature.CUSTOM_ANALYTICS]: { enabled: true },
      [Feature.USER_MANAGEMENT]: { enabled: true },
      [Feature.TEAM_COLLABORATION]: { enabled: true },
      [Feature.PRIORITY_SUPPORT]: { enabled: true },
      [Feature.DEDICATED_SUPPORT]: { enabled: true },
    },
    limits: {
      lookupsPerMonth: -1, // Unlimited
      apiCreditsPerMonth: -1, // Unlimited
      maxMonitoringTargets: -1, // Unlimited
      maxTeamMembers: -1, // Unlimited
      dataRetentionDays: 365,
    },
  },
}

/**
 * Check if a feature is enabled for a given account type
 */
export function hasFeature(accountType: AccountType, feature: Feature): boolean {
  const account = ACCOUNT_FEATURES[accountType]
  return account?.features[feature]?.enabled || false
}

/**
 * Get the limit for a specific resource
 */
export function getLimit(accountType: AccountType, limitKey: keyof AccountFeatures['limits']): number {
  const account = ACCOUNT_FEATURES[accountType]
  return account?.limits[limitKey] || 0
}

/**
 * Check if an account type can access a dashboard section
 */
export function canAccessDashboardSection(
  accountType: AccountType,
  section: 'search' | 'monitoring' | 'data' | 'users' | 'settings'
): boolean {
  switch (section) {
    case 'search':
      return hasFeature(accountType, Feature.DASHBOARD_ACCESS)
    case 'monitoring':
      return hasFeature(accountType, Feature.CREDENTIAL_MONITORING)
    case 'data':
      return hasFeature(accountType, Feature.DATA_EXPORT)
    case 'users':
      return hasFeature(accountType, Feature.USER_MANAGEMENT)
    case 'settings':
      return true // All users can access settings
    default:
      return false
  }
}

/**
 * Get upgrade suggestions based on current account type
 */
export function getUpgradeReasons(accountType: AccountType): string[] {
  const reasons: string[] = []
  
  switch (accountType) {
    case AccountType.FREE:
      reasons.push(
        'Increase daily lookups from 10 to 200',
        'Enable CSV/JSON data exports',
        'Extended 30-day data retention'
      )
      break
    case AccountType.STARTER:
      reasons.push(
        'Unlimited lookups',
        'Credential monitoring with 100 targets',
        'API access with 10,000 credits/month',
        'Team collaboration for up to 5 members',
        'Save with quarterly billing at $99/quarter'
      )
      break
    case AccountType.PROFESSIONAL:
      reasons.push(
        'Unlimited API credits',
        'Real-time data feeds',
        'Custom analytics',
        'Dedicated 24/7 support',
        'Unlimited team members'
      )
      break
  }
  
  return reasons
}
