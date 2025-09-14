T WAS A# IP Access Control Configuration

## Overview
Obscura Labs implements IP-based access control to restrict access during the beta phase. Only approved IP addresses can access the login and signup pages.

## Configuration

### Environment Variable
Set the `IP_ADDRESS` environment variable with a comma-separated list of allowed IP addresses:

```bash
# Single IP
IP_ADDRESS=192.168.1.100

# Multiple IPs (comma-separated)
IP_ADDRESS=192.168.1.100,10.0.0.50,203.0.113.45

# Leave empty to allow all IPs (development only)
IP_ADDRESS=
```

### Deployment Examples

#### Vercel
Add the environment variable in your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add `IP_ADDRESS` with your allowed IPs

#### Local Development
Create a `.env.local` file:
```
IP_ADDRESS=127.0.0.1,::1,localhost
```

#### Docker
Pass the environment variable:
```bash
docker run -e IP_ADDRESS="192.168.1.100,10.0.0.50" your-app
```

## How It Works

1. When a user tries to access `/login`, `/signup`, or any `/auth/*` routes
2. The middleware checks their IP address against the allowed list
3. If not authorized, they are redirected to `/restricted` page
4. The restricted page shows a "Coming Soon" message with contact information

## Testing

To test the IP restriction:
1. Set `IP_ADDRESS` to a specific IP (not your current one)
2. Try to access `/login` - you should be redirected to `/restricted`
3. Add your IP to the list and try again - you should see the login page

## Security Notes

- The middleware checks multiple headers to determine the real client IP:
  - `x-forwarded-for` (standard proxy header)
  - `x-real-ip` (nginx)
  - `cf-connecting-ip` (Cloudflare)
  - Falls back to `request.ip`

- In production, ensure your hosting provider properly sets these headers
- Consider using a CDN like Cloudflare for additional security

## Contact for Access

Users who need access can contact: **contact@obscuralabs.io**
