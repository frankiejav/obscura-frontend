import type { NextRequest } from "next/server"

// In-memory store for rate limiting
// In production, use Redis or another distributed store
const rateLimitStore = new Map<string, { count: number; timestamp: number }>()

export async function rateLimit(request: NextRequest, limit = 100, window = 60) {
  const ip = request.ip || "unknown"
  const key = `${ip}:${request.nextUrl.pathname}`
  const now = Date.now()

  const current = rateLimitStore.get(key) || { count: 0, timestamp: now }

  // Reset if outside window
  if (now - current.timestamp > window * 1000) {
    current.count = 0
    current.timestamp = now
  }

  current.count++
  rateLimitStore.set(key, current)

  return {
    success: current.count <= limit,
    limit,
    remaining: Math.max(0, limit - current.count),
    reset: new Date(current.timestamp + window * 1000),
  }
}
