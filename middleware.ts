import type { NextRequest } from "next/server";
import { NextResponse } from 'next/server';
import { auth0 } from "./lib/auth0";

// Routes that require IP check (login/signup pages)
const IP_RESTRICTED_ROUTES = ['/login', '/signup']

// Routes that are completely disabled (redirect to restricted)
const DISABLED_ROUTES = ['/checkout']

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

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Check if this route is completely disabled
  const isDisabledRoute = DISABLED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  if (isDisabledRoute) {
    // Redirect disabled routes to restricted page
    return NextResponse.redirect(new URL('/restricted', request.url))
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
  
  // Apply Auth0 middleware for authentication
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};