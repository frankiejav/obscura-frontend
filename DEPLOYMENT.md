# Obscura Labs - Production Deployment Guide

## Infrastructure Overview

- **Frontend/Backend**: Next.js 15 with App Router
- **Authentication**: Auth0
- **User Database**: Neon PostgreSQL (Serverless)
- **Data Source**: ClickHouse Cloud
- **Hosting**: Cloudflare Pages / Vercel
- **Payments**: Stripe (Cards) + NOWPayments (Crypto)

## Environment Variables

### Required Variables

```env
# Auth0 Configuration
AUTH0_SECRET=                      # Random 32+ character string for session encryption
AUTH0_BASE_URL=                    # Your app URL (e.g., https://obscura.io)
AUTH0_ISSUER_BASE_URL=             # Auth0 tenant URL (e.g., https://your-tenant.auth0.com/)
AUTH0_CLIENT_ID=                   # Auth0 application client ID
AUTH0_CLIENT_SECRET=               # Auth0 application client secret
AUTH0_AUDIENCE=                    # Auth0 API audience
AUTH0_DOMAIN=                      # Auth0 domain (e.g., your-tenant.auth0.com)
AUTH0_SCOPE=openid profile email   # OAuth scopes
AUTH0_MGMT_AUDIENCE=               # Management API audience (https://your-tenant.auth0.com/api/v2/)

# Database (Neon PostgreSQL)
DATABASE_URL=                      # Neon connection string
NEON=                              # Alternative Neon connection string

# ClickHouse (Data Source)
CLICKHOUSE_URL=                    # ClickHouse Cloud URL (https://...)
CLICKHOUSE_HOST=                   # ClickHouse host
CLICKHOUSE_PORT=8443               # Port (8443 for HTTPS)
CLICKHOUSE_USER=default            # Username
CLICKHOUSE_PASSWORD=               # Password
CLICKHOUSE_DATABASE=vault          # Database name

# Stripe (Card Payments)
STRIPE_API_KEY=                    # Stripe secret key (sk_live_...)
STRIPE_SECRET_KEY=                 # Same as STRIPE_API_KEY
STRIPE_WEBHOOK_SECRET=             # Webhook signing secret (whsec_...)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # Stripe publishable key (pk_live_...)

# Stripe Price IDs
STRIPE_PRICE_STARTER_MONTHLY=      # Starter monthly price ID
STRIPE_PRICE_STARTER_YEARLY=       # Starter yearly price ID
STRIPE_PRICE_PRO_MONTHLY=          # Professional monthly price ID
STRIPE_PRICE_PRO_QUARTERLY=        # Professional quarterly price ID
STRIPE_PRICE_PRO_YEARLY=           # Professional yearly price ID
STRIPE_PRICE_ENTERPRISE_MONTHLY=   # Enterprise monthly price ID
STRIPE_PRICE_ENTERPRISE_YEARLY=    # Enterprise yearly price ID

# NOWPayments (Crypto)
NOWPAYMENTS_API_KEY=               # NOWPayments API key
NP_API_KEY=                        # Alternative NOWPayments API key
NP_IPN_KEY=                        # IPN secret for webhook verification

# App Configuration
NEXT_PUBLIC_BASE_URL=              # Public app URL
NEXT_PUBLIC_APP_URL=               # Same as above (legacy)

# LeakCheck API (Optional)
LEAKCHECK_API_KEY=                 # LeakCheck API key for breach data

# Personal Account Override (Optional)
PERSONAL_AUTH0_USER_ID=            # Auth0 user ID for admin/owner account

# IP Restriction (Optional)
IP_ADDRESS=                        # Comma-separated list of allowed IPs for login
```

## Database Schema

### Neon PostgreSQL Tables

Run the following SQL to set up the required tables:

```sql
-- Plan enum type
CREATE TYPE plan AS ENUM ('free', 'starter', 'professional', 'enterprise');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  auth0_user_id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing customers (Stripe/NowPayments)
CREATE TABLE IF NOT EXISTS billing_customers (
  auth0_user_id VARCHAR(255) PRIMARY KEY REFERENCES users(auth0_user_id),
  stripe_customer_id VARCHAR(255),
  np_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  auth0_user_id VARCHAR(255) PRIMARY KEY REFERENCES users(auth0_user_id),
  plan plan NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crypto payments tracking
CREATE TABLE IF NOT EXISTS crypto_payments (
  id SERIAL PRIMARY KEY,
  auth0_user_id VARCHAR(255) REFERENCES users(auth0_user_id),
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  order_id VARCHAR(500),
  plan VARCHAR(50),
  amount DECIMAL(10, 2),
  currency VARCHAR(20),
  status VARCHAR(50),
  period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entitlements
CREATE TABLE IF NOT EXISTS entitlements (
  auth0_user_id VARCHAR(255) PRIMARY KEY REFERENCES users(auth0_user_id),
  perms TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monitoring targets
CREATE TABLE IF NOT EXISTS monitoring_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) REFERENCES users(auth0_user_id),
  type VARCHAR(50) NOT NULL,
  value VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  auto_scan BOOLEAN DEFAULT true,
  last_scanned TIMESTAMP,
  breach_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, type, value)
);

-- Scan results
CREATE TABLE IF NOT EXISTS scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID REFERENCES monitoring_targets(id) ON DELETE CASCADE,
  source VARCHAR(100),
  breach_name VARCHAR(255),
  breach_date DATE,
  data_types TEXT[],
  severity VARCHAR(50),
  details JSONB,
  found_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(target_id, breach_name, source)
);

-- Monitoring notifications
CREATE TABLE IF NOT EXISTS monitoring_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) REFERENCES users(auth0_user_id),
  target_id UUID REFERENCES monitoring_targets(id) ON DELETE SET NULL,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  severity VARCHAR(50) DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Upsert subscription function
CREATE OR REPLACE FUNCTION upsert_subscription(
  p_user_id VARCHAR(255),
  p_plan plan,
  p_status VARCHAR(50),
  p_period_end TIMESTAMP
) RETURNS VOID AS $$
BEGIN
  INSERT INTO subscriptions (auth0_user_id, plan, status, current_period_end, updated_at)
  VALUES (p_user_id, p_plan, p_status, p_period_end, CURRENT_TIMESTAMP)
  ON CONFLICT (auth0_user_id) DO UPDATE
  SET plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      current_period_end = EXCLUDED.current_period_end,
      updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- WebAuthn/FIDO Security Keys
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) REFERENCES users(auth0_user_id) ON DELETE CASCADE,
  credential_id VARCHAR(500) UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  device_type VARCHAR(50) DEFAULT 'cross-platform',
  transports TEXT[] DEFAULT '{}',
  name VARCHAR(255) NOT NULL,
  attestation_object TEXT,
  client_data_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP
);

-- WebAuthn Challenges (temporary storage)
CREATE TABLE IF NOT EXISTS webauthn_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  challenge VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'registration' or 'authentication'
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_billing_stripe ON billing_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_monitoring_user ON monitoring_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON monitoring_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_webauthn_user ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credential ON webauthn_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_expires ON webauthn_challenges(expires_at);
```

## Cloudflare Pages Deployment

### Build Settings

- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/frontend` (if monorepo)

### Edge Compatibility

The app uses Edge Runtime for optimal performance on Cloudflare. Key middleware and API routes are configured for Edge:

```typescript
export const runtime = 'edge';
```

### Custom Domain Setup

1. Add your domain in Cloudflare Pages
2. Update DNS records as instructed
3. Enable SSL/TLS (Full or Full (Strict))
4. Update `AUTH0_BASE_URL` and `NEXT_PUBLIC_BASE_URL`

## Stripe Setup

### Webhook Configuration

1. Create webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
2. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
3. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Create Products and Prices

In Stripe Dashboard, create:

1. **Starter** product with monthly ($19.99) and yearly ($191.88) prices
2. **Professional** product with monthly ($49), quarterly ($99), yearly ($349) prices
3. **Enterprise** product with monthly ($299) and yearly ($2868) prices

Copy price IDs to respective environment variables.

## NOWPayments Setup

### IPN Configuration

1. Set IPN callback URL: `https://your-domain.com/api/webhooks/nowpayments`
2. Copy IPN secret to `NP_IPN_KEY`
3. Enable desired cryptocurrencies in dashboard

### Supported Cryptocurrencies

- Bitcoin (BTC)
- Ethereum (ETH)
- Tether (USDT)
- Litecoin (LTC)
- Binance Coin (BNB)
- TRON (TRX)
- Dogecoin (DOGE)

## Auth0 Configuration

### Application Settings

1. Create Regular Web Application
2. Set Allowed Callback URLs: `https://your-domain.com/api/auth/callback`
3. Set Allowed Logout URLs: `https://your-domain.com`
4. Enable ID Token (Implicit Grant)

### API Settings

1. Create API with identifier (audience)
2. Enable RBAC if using permissions
3. Add scopes: `openid`, `profile`, `email`

### Rules/Actions (Optional)

Add custom claims to tokens:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://obscura/';
  api.idToken.setCustomClaim(`${namespace}plan`, event.user.app_metadata?.plan || 'free');
  api.accessToken.setCustomClaim(`${namespace}plan`, event.user.app_metadata?.plan || 'free');
};
```

## WebAuthn/FIDO Security Keys

The platform supports hardware security keys (YubiKey, Titan Key, etc.) and platform authenticators (Touch ID, Windows Hello, Android Biometrics) for multi-factor authentication.

### Database Migration

Run the WebAuthn migration to create required tables:

```bash
npm run db:migrate:webauthn
```

### Supported Authenticators

- **Hardware Security Keys**: YubiKey, Google Titan, Feitian, and other FIDO2 keys via USB/NFC
- **Platform Authenticators**: Touch ID, Face ID, Windows Hello, Android Biometrics
- **Phone Passkeys**: Use your phone as an authenticator via QR code (hybrid transport)

### Security Features

- WebAuthn credentials store public keys only (private keys never leave the authenticator)
- Challenge tokens expire after 5 minutes to prevent replay attacks
- Counter verification detects cloned authenticators
- User verification is preferred for additional security

### User Experience

Users can manage security keys from Dashboard > Settings > Security:
- Add multiple security keys for redundancy
- Rename keys for easier identification
- View last used timestamps
- Remove keys (minimum one required)

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema initialized
- [ ] WebAuthn tables created (`npm run db:migrate:webauthn`)
- [ ] Auth0 application configured
- [ ] Stripe webhook endpoint verified
- [ ] NOWPayments IPN endpoint configured
- [ ] Custom domain configured with SSL
- [ ] Test authentication flow
- [ ] Test security key registration
- [ ] Test Stripe payment flow
- [ ] Test crypto payment flow
- [ ] ClickHouse connection verified
- [ ] Monitor error logs

## Monitoring & Logging

### Recommended Services

- **Error Tracking**: Sentry
- **Logging**: LogFlare / Cloudflare Logs
- **Uptime**: UptimeRobot / Better Uptime
- **Analytics**: Cloudflare Analytics / Plausible

### Key Metrics to Monitor

- Authentication success/failure rates
- Payment conversion rates
- API response times
- ClickHouse query performance
- Webhook delivery success

## Security Considerations

1. **IP Restrictions**: Configure `IP_ADDRESS` for admin-only access to login pages
2. **Rate Limiting**: Implemented in middleware for API routes
3. **CORS**: Configured in Next.js config
4. **CSP Headers**: Add Content-Security-Policy headers
5. **Regular Updates**: Keep dependencies updated
6. **Audit Logging**: Sensitive operations are logged
7. **WebAuthn/FIDO**: Hardware security keys for phishing-resistant MFA
   - Only public keys stored in database
   - Private keys never leave authenticator hardware
   - Cryptographic verification prevents credential theft
