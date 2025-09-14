import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require IP check (login/signup pages, not the API routes)
const IP_RESTRICTED_ROUTES = ['/login', '/signup']

// Parse allowed IPs from environment variable
function getAllowedIPs(): Set<string> {
  const ipList = process.env.IP_ADDRESS || ''
  if (!ipList) return new Set()
  
  // Split by comma and trim whitespace
  const ips = ipList.split(',').map(ip => ip.trim()).filter(ip => ip)
  return new Set(ips)
}

// Get client IP from various headers
function getClientIP(request: NextRequest): string | null {
  // Check various headers in order of reliability
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }
  
  // Fallback to request IP (may not be accurate behind proxies)
  return request.ip || null
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // ALWAYS allow Auth0 routes to work without ANY restriction
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }
  
  // Check if this is an IP-restricted route (login/signup pages ONLY)
  const isIPRestrictedRoute = IP_RESTRICTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  if (isIPRestrictedRoute) {
    const allowedIPs = getAllowedIPs()
    
    // If no IPs are configured, allow all (for development)
    if (allowedIPs.size === 0) {
      console.warn('No IP restrictions configured (IP_ADDRESS env var is empty)')
      return NextResponse.next()
    }
    
    const clientIP = getClientIP(request)
    
    if (!clientIP) {
      console.warn('Could not determine client IP address')
      // Redirect to restricted page if we can't determine IP
      return NextResponse.redirect(new URL('/restricted', request.url))
    }
    
    // Check if IP is allowed
    if (!allowedIPs.has(clientIP)) {
      console.log(`Access denied for IP: ${clientIP}`)
      // Redirect to restricted page
      return NextResponse.redirect(new URL('/restricted', request.url))
    }
    
    console.log(`Access granted for IP: ${clientIP}`)
  }
  
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ]
}