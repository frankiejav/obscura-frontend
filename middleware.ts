import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // List of public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/privacy-policy',
    '/terms-of-service',
    '/api/public',
    '/images',
  ];
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Skip Auth0 middleware for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Apply Auth0 middleware only to protected routes
  try {
    return await auth0.middleware(request);
  } catch (error) {
    console.error('Auth0 middleware error:', error);
    // Redirect to login on auth errors
    return NextResponse.redirect(new URL('/login', request.url));
  }
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