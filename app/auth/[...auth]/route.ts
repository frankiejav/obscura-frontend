import { handleAuth, handleLogin, handleCallback, handleLogout } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard',
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email'
    }
  }),
  callback: handleCallback({
    afterCallback: async (req, res, session, state) => {
      // You can add custom logic here after successful login
      console.log('User logged in:', session.user.email);
      return session;
    }
  }),
  logout: handleLogout({
    returnTo: '/'
  }),
  signup: handleLogin({
    authorizationParams: {
      screen_hint: 'signup',
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email'
    },
    returnTo: '/dashboard'
  })
});

export const POST = handleAuth();
