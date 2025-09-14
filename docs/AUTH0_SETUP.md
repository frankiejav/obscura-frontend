# Auth0 Configuration for Obscura Labs

## Required Environment Variables

Set these in your `.env.local` file (local development) or in your Vercel/deployment environment:

```bash
# Auth0 Configuration (v4 SDK)
AUTH0_SECRET='[Use openssl rand -hex 32 to generate a 32 bytes value]'
APP_BASE_URL='https://www.obscuralabs.io'  # Your domain (no trailing slash)
AUTH0_DOMAIN='obscuralabs.us.auth0.com'  # Your Auth0 domain (without https://)
AUTH0_CLIENT_ID='[Your Auth0 Application Client ID]'
AUTH0_CLIENT_SECRET='[Your Auth0 Application Client Secret]'

# Optional - if you need to specify an audience
AUTH0_AUDIENCE='[Your API identifier if using Auth0 APIs]'
AUTH0_SCOPE='openid profile email'
```

## Auth0 Application Settings

In your Auth0 Dashboard, ensure these settings are configured:

### Allowed Callback URLs
```
https://www.obscuralabs.io/auth/callback
http://localhost:3000/auth/callback
```

### Allowed Logout URLs
```
https://www.obscuralabs.io
http://localhost:3000
```

### Allowed Web Origins
```
https://www.obscuralabs.io
http://localhost:3000
```

## Authentication Flow

The Auth0 SDK v4 auto-configures these routes:
- `/auth/login` - Performs login with Auth0
- `/auth/logout` - Logs the user out
- `/auth/callback` - Auth0 redirects here after successful login
- `/auth/profile` - Fetches the user profile
- `/auth/access-token` - Returns an access token

Flow:
1. User visits `/login` → Shows login page (if IP is allowed)
2. User clicks "Sign In" → Redirected to `/auth/login`
3. App redirects to Auth0 → `https://obscuralabs.us.auth0.com/authorize`
4. User authenticates → Auth0 redirects to `/auth/callback`
5. Callback processes auth → User redirected to `/dashboard`

## IP Restriction (Optional)

Set allowed IPs in `IP_ADDRESS` environment variable:
```bash
IP_ADDRESS='192.168.1.1,10.0.0.1'  # Comma-separated list
```

Leave empty to allow all IPs (development).

## Troubleshooting

### Internal Server Error on Login
- Check AUTH0_DOMAIN format (should be `your-domain.auth0.com` without https://)
- Verify AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET are correct
- Ensure APP_BASE_URL matches your deployment URL (not AUTH0_BASE_URL)

### Redirect Issues
- Verify callback URLs are added in Auth0 dashboard
- Check that APP_BASE_URL doesn't have a trailing slash
- The middleware auto-configures `/auth/*` routes - don't create custom handlers
- APP_BASE_URL must be set (e.g., https://www.obscuralabs.io)

### Session Issues
- AUTH0_SECRET must be at least 32 characters
- Use the same secret across all instances/deployments
- Check cookie settings if behind a proxy
