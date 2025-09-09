import { handleAuth, handleCallback, handleLogin, handleLogout, handleProfile } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

const afterCallback = async (req: NextRequest, session: any) => {
  // You can modify the session here if needed
  return session;
};

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard',
  }),
  logout: handleLogout({
    returnTo: '/',
  }),
  callback: handleCallback({
    afterCallback,
  }),
  me: handleProfile(),
});

export const POST = handleAuth();
