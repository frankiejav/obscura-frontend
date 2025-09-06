import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const logoutUrl = `https://${process.env.AUTH0_DOMAIN}/v2/logout?` +
    `client_id=${process.env.AUTH0_CLIENT_ID}&` +
    `returnTo=${encodeURIComponent(process.env.APP_BASE_URL)}`
  
  return NextResponse.redirect(logoutUrl)
}
