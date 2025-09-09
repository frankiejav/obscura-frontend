# Environment Configuration Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Neon Database Configuration
DATABASE_URL=your-neon-database-url
# or
NEON=your-neon-database-url

# Auth0 Configuration
AUTH0_SECRET='use-a-long-random-string-here'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'
AUTH0_DOMAIN='your-tenant.auth0.com'
AUTH0_CONNECTION='Username-Password-Authentication'

# Optional: Auth0 Audience (for API access)
AUTH0_AUDIENCE='your-api-identifier'
AUTH0_SCOPE='openid profile email'

# Application Settings
NEXT_PUBLIC_APP_URL='http://localhost:3000'
NODE_ENV='development'
```

## Database Setup

The application now supports Neon database for persistent storage. The settings API will:

1. **With Database**: Store user settings persistently in Neon
2. **Without Database**: Fall back to session-only storage (resets on logout)

### Setting up Neon Database

1. Create a Neon account at https://neon.tech
2. Create a new database
3. Copy your connection string
4. Add it to `.env.local` as `DATABASE_URL` or `NEON`

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

