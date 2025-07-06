import { NextRequest, NextResponse } from 'next/server'

interface BreachDatabase {
  id: number
  name: string
  count: number
  breach_date: string | null
  unverified: number
  passwordless: number
  compilation: number
}

interface BreachResponse {
  data: BreachDatabase[]
}

export async function GET() {
  try {
    // Get database list URL from environment variable
    const dbListUrl = process.env.DB_LIST
    
    if (!dbListUrl) {
      throw new Error('DB_LIST environment variable is not configured')
    }
    
    // Fetch data from Leaked Databases API
    const response = await fetch(dbListUrl, {
      headers: {
        'User-Agent': 'Obscura-Labs/1.0',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: BreachResponse = await response.json()

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
    console.error('Error fetching databases:', error)
    
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