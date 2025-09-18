# Auth0 Post-Login Action Setup

This document explains how to configure the Auth0 Post-Login Action for the subscription and entitlements system.

## Overview

The Post-Login Action adds custom claims to both ID and Access tokens with the user's plan and permissions based on their subscription stored in Neon database.

## Setup Instructions

### 1. Navigate to Auth0 Actions

1. Log into your Auth0 Dashboard
2. Go to **Actions** → **Flows** → **Login**

### 2. Create a New Custom Action

1. Click **Custom** in the Add Action panel
2. Click **Create Action**
3. Name it: `Add Subscription Claims`
4. Select **Login / Post Login** as the trigger
5. Select **Node 18** as the runtime

### 3. Add the Action Code

Copy and paste this code into the action editor:

```javascript
/**
 * Handler that will be called during the execution of a PostLogin flow.
 * 
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  // Get personal account ID from secrets
  const personalAccountId = event.secrets.PERSONAL_AUTH0_USER_ID;
  
  // Get the user's plan from app_metadata (set by webhook)
  const rawPlan = (event.user.app_metadata && event.user.app_metadata.plan) || 'free';
  
  // Override for personal account - always enterprise
  const effectivePlan = (event.user.user_id === personalAccountId) ? 'enterprise' : rawPlan;
  
  // Define permissions for each plan
  const permissionsByPlan = {
    free: [
      'creds:read_redacted'
    ],
    pro: [
      'creds:read_full',
      'monitoring:basic',
      'api:access'
    ],
    enterprise: [
      'creds:read_full',
      'monitoring:advanced',
      'api:access',
      'realtime:feeds',
      'analytics:custom'
    ]
  };
  
  // Get permissions for the user's plan
  const permissions = permissionsByPlan[effectivePlan] || permissionsByPlan.free;
  
  // Add custom claims to tokens
  // Namespace is required for custom claims
  const namespace = 'https://obscura';
  
  // Set plan claim in both ID and Access tokens
  api.idToken.setCustomClaim(`${namespace}/plan`, effectivePlan);
  api.accessToken.setCustomClaim(`${namespace}/plan`, effectivePlan);
  
  // Set permissions claim in Access token only
  api.accessToken.setCustomClaim(`${namespace}/perms`, permissions);
  
  // Optional: Add user metadata to ID token for frontend display
  api.idToken.setCustomClaim(`${namespace}/subscription`, {
    plan: effectivePlan,
    features: getFeatures(effectivePlan)
  });
};

/**
 * Helper function to get feature flags for a plan
 */
function getFeatures(plan) {
  const features = {
    free: {
      hasFullCredentialAccess: false,
      hasMonitoring: false,
      hasApiAccess: false,
      hasRealtimeFeeds: false,
      hasCustomAnalytics: false,
      searchLimit: 100
    },
    pro: {
      hasFullCredentialAccess: true,
      hasMonitoring: true,
      hasApiAccess: true,
      hasRealtimeFeeds: false,
      hasCustomAnalytics: false,
      searchLimit: 10000
    },
    enterprise: {
      hasFullCredentialAccess: true,
      hasMonitoring: true,
      hasApiAccess: true,
      hasRealtimeFeeds: true,
      hasCustomAnalytics: true,
      searchLimit: -1 // Unlimited
    }
  };
  
  return features[plan] || features.free;
}
```

### 4. Add Action Secrets

In the action editor, click on the **Secrets** icon and add:

- **Key:** `PERSONAL_AUTH0_USER_ID`
- **Value:** Your Auth0 user ID (e.g., `auth0|xxxxxxxx`)

To find your Auth0 user ID:
1. Go to **User Management** → **Users**
2. Click on your user
3. Copy the User ID (starts with `auth0|`, `google-oauth2|`, etc.)

### 5. Deploy the Action

1. Click **Deploy**
2. Drag the action to the Login flow
3. Click **Apply**

## Testing the Action

### 1. Test with Auth0 Actions Test Tool

1. In the action editor, click **Test**
2. Select a test user or create a mock event
3. Run the test and verify the tokens contain the custom claims

### 2. Test with Real Login

1. Log out of your application
2. Log back in
3. Decode your access token at [jwt.io](https://jwt.io)
4. Verify the custom claims are present:
   - `https://obscura/plan`
   - `https://obscura/perms`

### 3. Test via API

Call your `/api/auth/me` endpoint with the access token:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://your-app.vercel.app/api/auth/me
```

## Troubleshooting

### Claims Not Appearing

1. **Check namespace:** Custom claims must be namespaced (e.g., `https://obscura/`)
2. **Check deployment:** Ensure the action is deployed and added to the Login flow
3. **Clear cache:** Auth0 may cache tokens; try logging out and back in

### Personal Account Override Not Working

1. Verify the `PERSONAL_AUTH0_USER_ID` secret is set correctly
2. Check the user ID format (should include provider prefix like `auth0|`)
3. Test with console.log in the action (temporarily) to debug

### Permissions Not Updating

1. Ensure webhooks are updating `app_metadata.plan` correctly
2. Check that the plan value matches exactly: `free`, `pro`, or `enterprise`
3. Verify the webhook endpoint is receiving Stripe events

## Integration with Application

### Backend Verification

Your API routes should verify permissions using the token claims:

```typescript
// Example from /lib/perms.ts
export const need = (required: string[]) => (payload: TokenPayload) => {
  const perms: string[] = payload['https://obscura/perms'] || [];
  for (const p of required) {
    if (!perms.includes(p)) {
      throw new Error(`Missing required permission: ${p}`);
    }
  }
};
```

### Frontend Display

The frontend can use the plan claim to show/hide features:

```typescript
// Example from frontend
const user = useUser();
const plan = user?.['https://obscura/plan'] || 'free';
const isPro = plan === 'pro' || plan === 'enterprise';
```

## Maintenance

### Adding New Permissions

1. Update the `permissionsByPlan` object in the action
2. Update `/lib/perms.ts` with new permission constants
3. Update API routes to check for new permissions
4. Deploy the action changes

### Changing Plan Features

1. Update the `getFeatures()` function in the action
2. Update `/lib/perms.ts` PLAN_FEATURES constant
3. Deploy the action changes

## Security Considerations

1. **Never trust client-side claims** - Always verify on the backend
2. **Use short token lifetimes** - Configure 5-15 minute access tokens
3. **Rotate refresh tokens** - Enable rotation in Auth0 settings
4. **Audit plan changes** - Log all subscription updates
5. **Validate webhooks** - Verify Stripe signatures

## Related Documentation

- [Auth0 Actions Documentation](https://auth0.com/docs/customize/actions)
- [Auth0 Custom Claims](https://auth0.com/docs/secure/tokens/json-web-tokens/create-custom-claims)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
