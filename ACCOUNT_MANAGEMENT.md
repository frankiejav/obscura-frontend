# Account Management System Documentation

## Overview
This application implements a comprehensive account type management system with Auth0 integration, feature toggling, and usage-based rate limiting. Each subscription tier has specific features and limits that are enforced throughout the system.

## Account Types & Features

### 1. FREE Plan
- **Price**: $0
- **Features**:
  - ✅ Dashboard access
  - ✅ Basic search (10 lookups/day)
  - ❌ Data export
  - ❌ Credential monitoring
  - ❌ API access
- **Limits**:
  - 10 lookups per day
  - 7 days data retention
  - 1 team member

### 2. STARTER Plan  
- **Price**: $19.99/month
- **Features**:
  - ✅ Dashboard access
  - ✅ Search (200 lookups/day)
  - ✅ CSV/JSON exports
  - ❌ Credential monitoring
  - ❌ API access
- **Limits**:
  - 200 lookups per day
  - 30 days data retention
  - 1 team member

### 3. PROFESSIONAL Plan
- **Price**: $99/quarter (billed every 3 months)
- **Features**:
  - ✅ Dashboard access
  - ✅ Unlimited lookups
  - ✅ CSV/JSON exports
  - ✅ Credential monitoring
  - ✅ API access
  - ✅ Team collaboration
  - ✅ Priority support
- **Limits**:
  - Unlimited lookups
  - 10,000 API credits/month
  - 100 monitoring targets
  - 5 team members
  - 90 days data retention

### 4. ENTERPRISE Plan
- **Price**: Custom
- **Features**:
  - ✅ All Professional features
  - ✅ Real-time feeds
  - ✅ Custom analytics
  - ✅ Dedicated support
  - ✅ SLA guarantees
- **Limits**:
  - Unlimited everything
  - 365 days data retention

## Implementation Details

### 1. Core Files

#### Account Type Configuration
- **File**: `/lib/account-types.ts`
- **Purpose**: Defines all account types, features, and limits
- **Key Exports**:
  - `AccountType` enum
  - `Feature` enum
  - `ACCOUNT_FEATURES` configuration
  - Helper functions: `hasFeature()`, `getLimit()`, `canAccessDashboardSection()`

#### User Subscription Management
- **File**: `/lib/user-subscription.ts`
- **Purpose**: Manages user subscriptions with Auth0
- **Key Functions**:
  - `getUserSubscription()`: Get current user's subscription data
  - `updateUserSubscription()`: Update subscription in Auth0 metadata
  - `userHasFeature()`: Check if user has specific feature
  - `checkUserLimit()`: Check usage against limits
  - `incrementUsage()`: Track usage for rate limiting

#### Feature Guards
- **File**: `/lib/feature-guards.ts`
- **Purpose**: Middleware for API route protection
- **Key Functions**:
  - `withFeatureGuard()`: Middleware wrapper
  - `protectedRoute()`: Create protected API routes
  - `checkFeatures()`: Check multiple features at once

### 2. React Components

#### Feature Gate Component
- **File**: `/components/feature-gates/FeatureGate.tsx`
- **Usage**: Conditionally render UI based on features
```tsx
<FeatureGate feature={Feature.CREDENTIAL_MONITORING}>
  <MonitoringDashboard />
</FeatureGate>
```

#### Subscription Status Component
- **File**: `/components/dashboard/SubscriptionStatus.tsx`
- **Usage**: Display current plan and usage stats
```tsx
<SubscriptionStatus />
```

### 3. React Hooks

#### useFeatures Hook
- **File**: `/hooks/useFeatures.ts`
- **Usage**: Access user features in components
```tsx
const { features, checkFeature, getRemainingLimit } = useFeatures()

if (checkFeature(Feature.API_ACCESS)) {
  // Show API section
}
```

## API Protection

### Protected Routes
All API routes that require feature checks use the `protectedRoute` wrapper:

```typescript
// Example: Search API with lookup limits
export const POST = protectedRoute(handleSearch, {
  feature: Feature.SEARCH,
  checkLimit: 'lookups',
  incrementUsage: 'lookups',
})

// Example: Monitoring API with target limits
export const POST = protectedRoute(addTarget, {
  feature: Feature.CREDENTIAL_MONITORING,
  checkLimit: 'monitoringTargets',
})
```

### Rate Limiting Headers
Protected routes automatically add rate limit headers:
- `X-RateLimit-Limit`: Total limit
- `X-RateLimit-Remaining`: Remaining usage

## Auth0 Integration

### User Metadata Structure
The system stores subscription data in Auth0 user metadata:

```json
{
  "app_metadata": {
    "account_type": "professional",
    "subscription": {
      "status": "active",
      "startDate": "2024-01-01",
      "stripeCustomerId": "cus_xxx",
      "stripeSubscriptionId": "sub_xxx",
      "paymentMethod": "stripe"
    }
  },
  "user_metadata": {
    "lookupsToday": 150,
    "lookupsThisMonth": 4500,
    "apiCreditsUsed": 2000,
    "monitoringTargets": 25,
    "lastLookupDate": "2024-01-15",
    "lastLookupMonth": "2024-01"
  }
}
```

### Required Auth0 Scopes
- `read:users`
- `update:users`
- `update:users_app_metadata`

## Payment Integration

### Stripe Webhook Handler
- **File**: `/app/api/payments/stripe/webhook/route.ts`
- Automatically updates user subscription on successful payment
- Maps price amounts to account types

### NOWPayments Webhook Handler
- **File**: `/app/api/payments/nowpayments/webhook/route.ts`
- Handles crypto payments
- Updates subscription on payment confirmation

## Usage in Dashboard

### 1. Protecting Dashboard Sections
```tsx
// In dashboard layout or page
const { canAccessSection } = useFeatures()

if (!canAccessSection('monitoring')) {
  return <UpgradePrompt feature={Feature.CREDENTIAL_MONITORING} />
}
```

### 2. Showing/Hiding Features
```tsx
// Conditionally render based on features
<FeatureGate feature={Feature.API_ACCESS}>
  <ApiKeyManager />
</FeatureGate>
```

### 3. Display Usage Limits
```tsx
// Show remaining lookups
const { getRemainingLimit } = useFeatures()
const remaining = getRemainingLimit('lookups')

<span>{remaining === -1 ? 'Unlimited' : `${remaining} remaining`}</span>
```

### 4. Upgrade Prompts
```tsx
// Use built-in upgrade prompt
<UpgradePrompt 
  feature={Feature.DATA_EXPORT}
  currentPlan={accountType}
  compact={true}
/>
```

## Testing Account Types

### Manual Testing
1. Update user metadata in Auth0 Dashboard
2. Set `app_metadata.account_type` to desired plan
3. Clear browser cache and refresh

### Programmatic Testing
```typescript
// Update user subscription via API
await updateUserSubscription(userId, AccountType.PROFESSIONAL, {
  status: 'active',
  startDate: new Date(),
})
```

## Monitoring & Analytics

### Track Feature Usage
- All protected routes automatically track usage
- Usage data stored in Auth0 user metadata
- Daily and monthly counters reset automatically

### Usage Analytics Queries
```typescript
// Get current usage
const subscription = await getUserSubscription(request)
console.log('Lookups today:', subscription.limits.lookupsToday)
console.log('API credits used:', subscription.limits.apiCreditsUsed)
```

## Troubleshooting

### Common Issues

1. **Feature not accessible despite subscription**
   - Check Auth0 metadata is properly set
   - Verify feature mapping in `account-types.ts`
   - Clear browser cache

2. **Rate limits not enforcing**
   - Check API route uses `protectedRoute` wrapper
   - Verify `checkLimit` option is set
   - Check user metadata counters

3. **Payment not updating subscription**
   - Check webhook endpoints are configured
   - Verify webhook secrets are correct
   - Check Auth0 Management API permissions

### Debug Mode
Enable debug logging by setting environment variable:
```env
DEBUG_FEATURES=true
```

## Future Enhancements

1. **Admin Dashboard**
   - Manage user subscriptions
   - Override limits
   - View usage analytics

2. **Grace Periods**
   - Allow temporary access after subscription expires
   - Send reminder emails

3. **Usage Alerts**
   - Email notifications at 80% usage
   - Dashboard warnings

4. **Granular Permissions**
   - Role-based access within teams
   - Custom feature sets for enterprise
