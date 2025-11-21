# Environment Configuration Guide

## Required Environment Variables

### For Local Development (.env.local file)
Create a `.env.local` file in the root directory with the following variables:

```env
# Neon Database Configuration (Required)
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# Auth0 Configuration (Required)
AUTH0_SECRET=use-a-long-random-string-here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CONNECTION=Username-Password-Authentication
AUTH0_MGMT_AUDIENCE=https://your-tenant.auth0.com/api/v2/
AUTH0_AUDIENCE=https://api.obscura
AUTH0_SCOPE=openid profile email

# Personal Account Override (Required)
PERSONAL_AUTH0_USER_ID=auth0|xxxxxxxx  # Your Auth0 user ID for enterprise override

# Stripe Configuration (Required for payments)
STRIPE_API_KEY=sk_test_xxxxx  # Use sk_live_xxxxx for production
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_PRO=price_xxxxx  # Pro plan price ID
STRIPE_PRICE_ENTERPRISE=price_xxxxx  # Enterprise plan price ID

# NowPayments Configuration (Optional - for crypto payments)
NP_API_KEY=xxxxx
NP_IPN_KEY=xxxxx

# Resend Email Configuration (Required for contact form)
RESEND_API_KEY=re_xxxxx  # Your Resend API key
RESEND_FROM_ADDRESS=Obscura Labs <contact@obscuralabs.io>  # From address using your verified domain

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Configuration (Legacy - for bypass)
ADMIN_EMAIL=your-admin-email@example.com  # Email allowed to self-upgrade account type
```

### For Vercel/Production (Environment Variables UI)
**IMPORTANT:** When setting these in Vercel, Netlify, or other hosting platforms, **DO NOT include quotes** around the values

Add all the variables from the local development section above, with these production-specific values:

```
# Production URLs (no quotes!)
AUTH0_BASE_URL=https://www.obscuralabs.io
NEXT_PUBLIC_APP_URL=https://www.obscuralabs.io

# Stripe Production (no quotes!)
STRIPE_API_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_xxxxx

# Set Node Environment
NODE_ENV=production
```

## Database Setup

The application now supports Neon database for persistent storage. The settings API will:

1. **With Database**: Store user settings persistently in Neon
2. **Without Database**: Fall back to session-only storage (resets on logout)

### Setting up Neon Database

1. Create a Neon account at https://neon.tech
2. Create a new database
3. Copy your connection string
4. Add it to `.env.local` as `DATABASE_URL`

### Database Schema

The settings API will automatically create the required table:

```sql
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Auth0 Setup

### Required Auth0 Permissions

For email and password change functionality, ensure your Auth0 application has:

1. **Management API Access**
   - Go to Auth0 Dashboard > APIs
   - Authorize your application for the Management API
   - Grant scopes: `update:users`, `update:users_app_metadata`

2. **Email Verification**
   - Enable email verification in Auth0 Dashboard > Authentication > Database
   - Configure email templates

3. **Password Reset**
   - Configure password reset email templates
   - Ensure the connection allows password changes

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. Run database migrations (if using Neon):
   ```bash
   npm run db:setup
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Troubleshooting

### Database Connection Issues
- Ensure your Neon database URL includes `?sslmode=require`
- Check if the database is accessible from your network
- Verify the connection string format: `postgresql://user:password@host/database?sslmode=require`

### Auth0 Issues
- Verify all Auth0 environment variables are set correctly
- Check Auth0 application settings match your local URL
- Ensure callback URLs are configured in Auth0 dashboard

### Module Not Found Errors
If you see module errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

For production:
1. Update `AUTH0_BASE_URL` and `NEXT_PUBLIC_APP_URL` to your production domain
2. Use a production database URL
3. Set `NODE_ENV=production`
4. Generate a secure `AUTH0_SECRET` (at least 32 characters)
5. Configure Auth0 production settings

