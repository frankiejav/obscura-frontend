# Auth0 Configuration for Obscura Labs

## Required Environment Variables

Set these in your `.env.local` file (local development) or in your Vercel/deployment environment:

```bash
# Auth0 Configuration
AUTH0_SECRET='[A long random string - at least 32 characters]'
AUTH0_BASE_URL='https://www.obscuralabs.io'  # Your domain (no trailing slash)
AUTH0_ISSUER_BASE_URL='https://auth0.obscuralabs.io'  # Your Auth0 domain
AUTH0_CLIENT_ID='[Your Auth0 Application Client ID]'
AUTH0_CLIENT_SECRET='[Your Auth0 Application Client Secret]'

# Optional - if you need to specify an audience
AUTH0_AUDIENCE='[Your API identifier if using Auth0 APIs]'
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

1. User visits `/login` → Shows login page (if IP is allowed)
2. User clicks "Sign In" → Redirected to `/auth/login`
3. App redirects to Auth0 → `https://auth0.obscuralabs.io/authorize`
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
- Check AUTH0_ISSUER_BASE_URL format (should be `https://your-domain.auth0.com`)
- Verify AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET are correct
- Ensure AUTH0_BASE_URL matches your deployment URL

### Redirect Issues
- Verify callback URLs are added in Auth0 dashboard
- Check that AUTH0_BASE_URL doesn't have a trailing slash
- Ensure middleware isn't blocking `/auth/*` routes
- AUTH0_BASE_URL must be set (e.g., https://www.obscuralabs.io)

### Session Issues
- AUTH0_SECRET must be at least 32 characters
- Use the same secret across all instances/deployments
- Check cookie settings if behind a proxy
