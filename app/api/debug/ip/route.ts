import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const headers: Record<string, string | null> = {
    'x-vercel-forwarded-for': request.headers.get('x-vercel-forwarded-for'),
    'x-forwarded-for': request.headers.get('x-forwarded-for'),
    'x-real-ip': request.headers.get('x-real-ip'),
    'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
    'request.ip': request.ip || null,
  }

  const allowedIPs = (process.env.IP_ADDRESS || '')
    .split(/[,\n\s]+/)
    .map(ip => ip.trim())
    .filter(ip => ip && ip.length > 0)

  // Determine which IP would be used
  const detectedIP = 
    headers['x-vercel-forwarded-for']?.split(',')[0].trim() ||
    headers['x-forwarded-for']?.split(',')[0].trim() ||
    headers['x-real-ip']?.trim() ||
    headers['cf-connecting-ip']?.trim() ||
    headers['request.ip'] ||
    'unknown'

  const isAllowed = allowedIPs.includes(detectedIP) || allowedIPs.length === 0

  return NextResponse.json({
    detectedIP,
    isAllowed,
    allowedIPs,
    allowedIPsCount: allowedIPs.length,
    rawEnvValue: process.env.IP_ADDRESS ? `"${process.env.IP_ADDRESS}"` : 'not set',
    headers,
  })
}
