import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      env: {
        domain: process.env.AUTH0_DOMAIN,
        clientId: process.env.AUTH0_CLIENT_ID,
        baseUrl: process.env.APP_BASE_URL,
        hasSecret: !!process.env.AUTH0_SECRET,
        hasAudience: !!process.env.AUTH0_AUDIENCE,
        scope: process.env.AUTH0_SCOPE
      },
      status: 'Auth0 configuration loaded'
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      status: 'Error loading Auth0 configuration'
    }, { status: 500 })
  }
}
