import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the client's IP address from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = forwardedFor 
    ? forwardedFor.split(',')[0].trim() 
    : realIP || request.ip || null

  // Get the authorized IP from environment variable
  const authorizedIP = process.env.IP_ADDRESS

  // Define paths that should always be accessible
  const allowedPaths = [
    '/coming-soon',
    '/_next',
    '/favicon.ico',
    '/favicon.png',
    '/robots.txt',
    '/api/public'
  ]

  // Check if the current path should be allowed
  const isAllowedPath = allowedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // If it's an allowed path, allow access
  if (isAllowedPath) {
    return NextResponse.next()
  }

  // If no authorized IP is set, allow all access (development mode)
  if (!authorizedIP) {
    return NextResponse.next()
  }

  // If client IP doesn't match authorized IP, redirect to coming-soon
  if (clientIP !== authorizedIP) {
    return NextResponse.redirect(new URL('/coming-soon', request.url))
  }

  // Allow access for authorized IPs
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - favicon.png (favicon file)
     * - robots.txt (robots file)
     */
    '/((?!api/public|_next/static|_next/image|favicon.ico|favicon.png|robots.txt).*)',
  ],
} 