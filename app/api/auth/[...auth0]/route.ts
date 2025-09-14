// Auth0 route handler for Next.js App Router
import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest, NextResponse } from 'next/server';

const client = new Auth0Client();

export async function GET(
  request: NextRequest,
  { params }: { params: { auth0: string[] } }
) {
  const action = params.auth0?.[0];
  
  try {
    if (action === 'login') {
      const returnTo = request.nextUrl.searchParams.get('returnTo') || '/dashboard';
      const screenHint = request.nextUrl.searchParams.get('screen_hint');
      
      const loginUrl = new URL('/authorize', process.env.AUTH0_ISSUER_BASE_URL!);
      loginUrl.searchParams.set('response_type', 'code');
      loginUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
      loginUrl.searchParams.set('redirect_uri', `${process.env.AUTH0_BASE_URL}/api/auth/callback`);
      loginUrl.searchParams.set('scope', 'openid profile email');
      loginUrl.searchParams.set('state', Buffer.from(JSON.stringify({ returnTo })).toString('base64'));
      
      if (screenHint) {
        loginUrl.searchParams.set('screen_hint', screenHint);
      }
      
      return NextResponse.redirect(loginUrl.toString());
    }
    
    if (action === 'callback') {
      // Use the Auth0Client to handle the callback
      const response = await client.callback(request);
      return response;
    }
    
    if (action === 'logout') {
      const logoutUrl = new URL('/v2/logout', process.env.AUTH0_ISSUER_BASE_URL!);
      logoutUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
      logoutUrl.searchParams.set('returnTo', process.env.AUTH0_BASE_URL!);
      
      const response = NextResponse.redirect(logoutUrl.toString());
      // Clear the session cookie
      response.cookies.delete('appSession');
      return response;
    }
    
    if (action === 'me') {
      const session = await client.getSession(request);
      if (session) {
        return NextResponse.json({ user: session.user });
      }
      return NextResponse.json({ user: null });
    }
    
    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error('Auth0 error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const POST = GET;
