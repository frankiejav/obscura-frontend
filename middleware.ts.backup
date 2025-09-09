import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simply pass through all requests without any processing
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};