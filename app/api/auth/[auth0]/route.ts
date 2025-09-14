import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest } from 'next/server';

const auth0 = new Auth0Client();

export async function GET(
  req: NextRequest,
  { params }: { params: { auth0: string } }
) {
  const handler = params.auth0;
  
  try {
    if (handler === 'login') {
      return auth0.login(req, {
        returnTo: '/dashboard'
      });
    }
    
    if (handler === 'logout') {
      return auth0.logout(req, {
        returnTo: '/'
      });
    }
    
    if (handler === 'callback') {
      return auth0.callback(req);
    }
    
    if (handler === 'me') {
      const session = await auth0.getSession(req);
      if (session) {
        return Response.json({ user: session.user });
      }
      return Response.json({ user: null });
    }
    
    return new Response('Not Found', { status: 404 });
  } catch (error) {
    console.error('Auth0 route error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export const POST = GET;
