import type { NextRequest } from "next/server";
import { NextResponse } from 'next/server';
import { auth0 } from "./lib/auth0";

// Routes that require IP check (login/signup/auth pages)
const IP_RESTRICTED_ROUTES = ['/login', '/signup', '/auth/login', '/auth/callback']

// Routes that are completely disabled (redirect to restricted)
const DISABLED_ROUTES = ['/checkout']

// Parse allowed IPs from environment variable
function getAllowedIPs(): Set<string> {
  const ipList = process.env.IP_ADDRESS || ''
  if (!ipList) return new Set()
  
  // Split by comma, newline, or space and trim whitespace
  const ips = ipList
    .split(/[,\n\s]+/)
    .map(ip => ip.trim())
    .filter(ip => ip && ip.length > 0)
  
  console.log('[IP Check] Allowed IPs from env:', ips)
  return new Set(ips)
}

// Get client IP from various headers
function getClientIP(request: NextRequest): string | null {
  // Vercel-specific header (most reliable on Vercel)
  const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for')
  if (vercelForwardedFor) {
    const ip = vercelForwardedFor.split(',')[0].trim()
    console.log('[IP Check] Got IP from x-vercel-forwarded-for:', ip)
    return ip
  }
  
  // Standard forwarded-for header
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0].trim()
    console.log('[IP Check] Got IP from x-forwarded-for:', ip)
    return ip
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    console.log('[IP Check] Got IP from x-real-ip:', realIP.trim())
    return realIP.trim()
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    console.log('[IP Check] Got IP from cf-connecting-ip:', cfConnectingIP.trim())
    return cfConnectingIP.trim()
  }
  
  // Fallback to request IP (may not be accurate behind proxies)
  console.log('[IP Check] Fallback to request.ip:', request.ip)
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