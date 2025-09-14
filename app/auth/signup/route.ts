import { handleAuth } from '@auth0/nextjs-auth0'
import { NextResponse } from 'next/server'

export const GET = async (request: Request) => {
  try {
    // The middleware will handle IP checking before this route is reached
    // Redirect to Auth0 signup page with screen_hint parameter
    const url = new URL('/auth/authorize', process.env.AUTH0_ISSUER_BASE_URL!)
    
    // Add signup screen hint
    url.searchParams.set('screen_hint', 'signup')
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!)
    url.searchParams.set('redirect_uri', `${process.env.AUTH0_BASE_URL}/auth/callback`)
    url.searchParams.set('scope', 'openid profile email')
    url.searchParams.set('state', crypto.randomUUID())
    
    return NextResponse.redirect(url.toString())
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.redirect('/login')
  }
}
