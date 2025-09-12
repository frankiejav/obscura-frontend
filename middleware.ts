import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  // The Auth0 middleware handles authentication routes automatically
  // Routes like /auth/login, /auth/logout, /auth/callback are handled internally
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - images (public images)
     * - api/public (public API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|api/public).*)",
  ],
};
