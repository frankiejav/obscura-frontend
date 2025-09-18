# Subscription & Entitlements System Implementation Guide

## Overview

This guide covers the complete subscription and entitlements system implementation using:
- **Neon Postgres** as the source of truth for subscriptions
- **Auth0** for authentication and token-based authorization
- **Stripe** for primary billing
- **NowPayments** for cryptocurrency payments (optional)
- **Next.js App Router** with TypeScript

## Architecture

```
User → Auth0 Login → JWT with Claims → API Routes → Neon DB
                ↑                           ↓
          Auth0 Action              Stripe Webhooks
         (adds claims)               (update subs)
```

## Setup Steps

### 1. Database Setup (Neon)

1. Create a Neon database at [neon.tech](https://neon.tech)
2. Get your connection string
3. Run the schema script:

```bash
psql $DATABASE_URL < scripts/neon-subscription-schema.sql
```

Or paste the contents of `scripts/neon-subscription-schema.sql` into the Neon SQL editor.

### 2. Stripe Setup

1. Create products and prices in Stripe Dashboard:
   - Professional: $99/month
   - Enterprise: $299/month

2. Get your API keys:
   - API Key: `sk_test_...` (or `sk_live_...` for production)
   - Price IDs: `price_...` for each plan

3. Configure webhook endpoint:
   - URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. Get webhook signing secret: `whsec_...`

### 3. Auth0 Configuration

#### A. Application Settings

1. Go to Applications → Your App → Settings
2. Add callback URL: `https://your-app.vercel.app/api/auth/callback`
3. Add logout URL: `https://your-app.vercel.app`
4. Save changes

#### B. API Configuration

1. Go to APIs → Create API
2. Name: `Obscura API`
3. Identifier: `https://api.obscura`
4. Signing Algorithm: RS256

#### C. Machine-to-Machine Application

1. Go to Applications → Create Application
2. Choose Machine to Machine
3. Authorize for Management API
4. Select scopes:
   - `read:users`
   - `update:users`
   - `update:users_app_metadata`

#### D. Post-Login Action

1. Go to Actions → Flows → Login
2. Create custom action named `Add Subscription Claims`
3. Add the code from `docs/AUTH0_ACTION_SETUP.md`
4. Add secret: `PERSONAL_AUTH0_USER_ID` = your Auth0 user ID
5. Deploy and add to flow

### 4. Environment Variables

Set all variables listed in `ENV_CONFIG.md`:

```env
# Neon
DATABASE_URL=postgresql://...

# Auth0
AUTH0_DOMAIN=...
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_MGMT_AUDIENCE=https://your-tenant.auth0.com/api/v2/
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.obscura
PERSONAL_AUTH0_USER_ID=auth0|xxxxxxxx

# Stripe
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Optional: NowPayments
NP_API_KEY=...
NP_IPN_KEY=...
```

### 5. Deploy to Vercel

1. Push code to GitHub
2. Import project to Vercel
3. Add all environment variables
4. Deploy

## User Flows

### New User Purchase Flow

1. User visits pricing page
2. Clicks "Get Started" on a plan
3. Redirected to Stripe Checkout
4. Completes payment
5. Stripe webhook fires → Updates Neon DB
6. Auth0 metadata updated
7. User redirected to dashboard
8. Next login includes plan in JWT

### Existing User Upgrade Flow

1. User goes to Settings → Subscription
2. Selects higher plan
3. Clicks "Upgrade"
4. Same checkout flow as above

### Billing Portal Access

1. User goes to Settings → Subscription
2. Clicks "Manage Billing"
3. Redirected to Stripe Customer Portal
4. Can update payment method, download invoices, cancel

## API Endpoints

### Authentication & User

- `GET /api/auth/me` - Get current user with plan/permissions
- `GET /api/entitlements` - Get detailed entitlements

### Billing

- `POST /api/billing/checkout` - Create Stripe checkout session
- `POST /api/billing/portal` - Create Stripe portal session

### Webhooks

- `POST /api/webhooks/stripe` - Handle Stripe events
- `POST /api/webhooks/nowpayments` - Handle crypto payments

## Permission System

### Plans & Permissions

```typescript
FREE:
  - creds:read_redacted

PROFESSIONAL:
  - creds:read_full
  - monitoring:basic
  - api:access

ENTERPRISE:
  - creds:read_full
  - monitoring:advanced
  - api:access
  - realtime:feeds
  - analytics:custom
```

### Protecting Routes

```typescript
// In your API route
import { verifyAccessToken, extractBearerToken } from '@/lib/auth';
import { need } from '@/lib/perms';

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('authorization'));
  const payload = await verifyAccessToken(token);
  
  // Require specific permission
  need(['creds:read_full'])(payload);
  
  // User has permission, proceed
  return NextResponse.json({ data: 'sensitive data' });
}
```

### Frontend Feature Gating

```typescript
// In your component
const { plan, permissions } = useSubscription();

if (!permissions.includes('monitoring:advanced')) {
  return <UpgradePrompt feature="Advanced Monitoring" />;
}
```

## Testing

### 1. Test Stripe Integration

Use test mode with test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### 2. Test Webhook

Use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

### 3. Test Permissions

1. Create free account → Verify limited access
2. Purchase Pro → Verify pro features unlocked
3. Cancel subscription → Verify downgrade to free

### 4. Test Personal Account

1. Set `PERSONAL_AUTH0_USER_ID` to your user ID
2. Login → Should have enterprise access regardless of payment

## Monitoring

### Key Metrics

1. **Subscription Events**
   - New subscriptions
   - Upgrades/downgrades
   - Cancellations
   - Failed payments

2. **Database Health**
   ```sql
   -- Check active subscriptions
   SELECT plan, status, COUNT(*) 
   FROM subscriptions 
   GROUP BY plan, status;
   
   -- Check recent updates
   SELECT * FROM subscriptions 
   WHERE updated_at > NOW() - INTERVAL '1 day'
   ORDER BY updated_at DESC;
   ```

3. **Webhook Health**
   - Monitor webhook endpoint response times
   - Check for failed webhook deliveries in Stripe

## Troubleshooting

### User Can't Access Paid Features

1. Check subscription status in Neon:
   ```sql
   SELECT * FROM subscriptions WHERE auth0_user_id = 'USER_ID';
   SELECT * FROM entitlements WHERE auth0_user_id = 'USER_ID';
   ```

2. Check Auth0 app_metadata:
   - User Management → Find User → Raw JSON
   - Look for `app_metadata.plan`

3. Decode their JWT at jwt.io
   - Check for `https://obscura/plan` claim
   - Check for `https://obscura/perms` claim

### Webhook Not Updating Subscription

1. Check webhook logs in Stripe Dashboard
2. Verify webhook secret is correct
3. Check Vercel function logs for errors
4. Manually trigger test event from Stripe

### Payment Successful but No Access

1. Check if webhook fired (Stripe Dashboard → Webhooks)
2. Check database was updated
3. User needs to logout/login to refresh JWT
4. Check Auth0 Action is deployed

## Security Best Practices

1. **Always verify on backend** - Never trust client-side permission checks
2. **Use short token lifetimes** - 5-15 minutes for access tokens
3. **Validate webhook signatures** - Always verify Stripe signatures
4. **Audit trail** - Log all subscription changes
5. **Idempotency** - Handle duplicate webhook events gracefully
6. **Rate limiting** - Protect endpoints from abuse
7. **Encryption** - Use HTTPS everywhere, encrypt sensitive data

## Maintenance

### Monthly Tasks

1. Review failed payments
2. Check for orphaned subscriptions
3. Audit permission usage
4. Review cancellation reasons

### Updating Plans/Prices

1. Create new price in Stripe
2. Update environment variables
3. Update UI pricing display
4. Migrate existing subscriptions if needed

### Adding New Features/Permissions

1. Update permission constants in `/lib/perms.ts`
2. Update Auth0 Action
3. Update database function `perms_for_plan()`
4. Update API route protection
5. Update UI feature gates

## Support

For issues:
1. Check user's subscription status
2. Check recent payments in Stripe
3. Review Auth0 logs
4. Check database for consistency
5. Have user clear cookies and re-login

## Related Files

- `/scripts/neon-subscription-schema.sql` - Database schema
- `/lib/db.ts` - Database client
- `/lib/auth.ts` - Auth0 integration
- `/lib/billing.ts` - Stripe integration
- `/lib/perms.ts` - Permission system
- `/components/dashboard/SubscriptionManager.tsx` - UI component
- `/docs/AUTH0_ACTION_SETUP.md` - Auth0 Action setup
- `/ENV_CONFIG.md` - Environment variables
