interface GeolocationData {
  country: string
  region: string
  city: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
}

export async function getIPGeolocation(ip: string): Promise<GeolocationData | null> {
  try {
    // Skip localhost and private IPs
    if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        country: 'Local',
        region: 'Development',
        city: 'Localhost',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
        isp: 'Local Network'
      }
    }

    // Use ipapi.co for geolocation (free tier)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'ObscuraLabs/1.0'
      }
    })

    if (!response.ok) {
      console.warn(`Failed to get geolocation for IP ${ip}: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    return {
      country: data.country_name || 'Unknown',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      latitude: parseFloat(data.latitude) || 0,
      longitude: parseFloat(data.longitude) || 0,
      timezone: data.timezone || 'UTC',
      isp: data.org || 'Unknown'
    }
  } catch (error) {
    console.error('Error getting IP geolocation:', error)
    return null
  }
}

export function getClientIP(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to localhost for development
  return '127.0.0.1'
} 