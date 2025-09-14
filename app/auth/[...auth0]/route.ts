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
      
      // Get the base URL from the request if AUTH0_BASE_URL is not set
      const baseUrl = process.env.AUTH0_BASE_URL || 
                      process.env.APP_BASE_URL || 
                      `https://${request.headers.get('host')}`;
      
      // Ensure AUTH0_ISSUER_BASE_URL is properly formatted
      const issuerUrl = process.env.AUTH0_ISSUER_BASE_URL?.startsWith('http') 
        ? process.env.AUTH0_ISSUER_BASE_URL
        : `https://${process.env.AUTH0_ISSUER_BASE_URL || 'auth0.obscuralabs.io'}`;
        
      const loginUrl = new URL('/authorize', issuerUrl);
      loginUrl.searchParams.set('response_type', 'code');
      loginUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
      loginUrl.searchParams.set('redirect_uri', `${baseUrl}/auth/callback`);
      loginUrl.searchParams.set('scope', 'openid profile email');
      loginUrl.searchParams.set('state', Buffer.from(JSON.stringify({ returnTo })).toString('base64'));
      
      if (screenHint) {
        loginUrl.searchParams.set('screen_hint', screenHint);
      }
      
      console.log('Login redirect URL:', loginUrl.toString());
      console.log('Callback URL:', `${baseUrl}/auth/callback`);
      
      return NextResponse.redirect(loginUrl.toString());
    }
    
    if (action === 'callback') {
      // Use the Auth0Client to handle the callback
      const response = await client.callback(request);
      return response;
    }
    
    if (action === 'logout') {
      // Get the base URL from the request if AUTH0_BASE_URL is not set
      const baseUrl = process.env.AUTH0_BASE_URL || 
                      process.env.APP_BASE_URL || 
                      `https://${request.headers.get('host')}`;
                      
      // Ensure AUTH0_ISSUER_BASE_URL is properly formatted
      const issuerUrl = process.env.AUTH0_ISSUER_BASE_URL?.startsWith('http') 
        ? process.env.AUTH0_ISSUER_BASE_URL
        : `https://${process.env.AUTH0_ISSUER_BASE_URL || 'auth0.obscuralabs.io'}`;
        
      const logoutUrl = new URL('/v2/logout', issuerUrl);
      logoutUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
      logoutUrl.searchParams.set('returnTo', baseUrl);
      
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
