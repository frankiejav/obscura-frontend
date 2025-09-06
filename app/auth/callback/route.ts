import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  
  if (error) {
    console.error('Auth0 callback error:', error)
    return NextResponse.redirect(new URL('/login?error=' + error, request.url))
  }
  
  if (code) {
    // For now, just redirect to dashboard
    // In a full implementation, you'd exchange the code for tokens
    console.log('Auth0 callback received code:', code)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.redirect(new URL('/login', request.url))
}
