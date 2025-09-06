import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const loginUrl = `https://${process.env.AUTH0_DOMAIN}/authorize?` +
    `response_type=code&` +
    `client_id=${process.env.AUTH0_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.APP_BASE_URL + '/auth/callback')}&` +
    `scope=${encodeURIComponent(process.env.AUTH0_SCOPE || 'openid profile email')}&` +
    `state=${encodeURIComponent(Math.random().toString(36).substring(2, 15))}`
  
  return NextResponse.redirect(loginUrl)
}
