import { NextRequest, NextResponse } from 'next/server'

interface LeakCheckDatabase {
  id: number
  name: string
  count: number
  breach_date: string | null
  unverified: number
  passwordless: number
  compilation: number
}

interface LeakCheckResponse {
  data: LeakCheckDatabase[]
}

export async function GET() {
  try {
    // Fetch data from LeakCheck API
    const response = await fetch('https://leakcheck.io/databases-list?_=1751679364404', {
      headers: {
        'User-Agent': 'Obscura-Labs/1.0',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: LeakCheckResponse = await response.json()

    // Calculate total count across all databases
    const totalCount = data.data.reduce((sum, db) => sum + db.count, 0)

    // Get recent databases (last 10 with recent breach dates)
    const recentDatabases = data.data
      .filter(db => db.breach_date)
      .sort((a, b) => {
        const dateA = new Date(a.breach_date!)
        const dateB = new Date(b.breach_date!)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, 10)

    // Get top databases by count
    const topDatabases = data.data
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      totalCount,
      totalDatabases: data.data.length,
      recentDatabases,
      topDatabases,
      allDatabases: data.data
    })
  } catch (error) {
    console.error('Error fetching LeakCheck databases:', error)
    
    // Return fallback data if API fails
    return NextResponse.json({
      totalCount: 10000000000, // 10 billion as fallback
      totalDatabases: 12967, // Approximate count from the data
      recentDatabases: [],
      topDatabases: [],
      allDatabases: []
    })
  }
} 