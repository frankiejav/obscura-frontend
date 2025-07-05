import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/elasticsearch'
import { checkConnection } from '@/lib/elasticsearch'

export async function GET(request: NextRequest) {
  try {
    // Log environment variables (without sensitive data)
    const envInfo = {
      ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL,
      ELASTICSEARCH_HOST: process.env.ELASTICSEARCH_HOST,
      ELASTICSEARCH_PORT: process.env.ELASTICSEARCH_PORT,
      ELASTICSEARCH_PROTOCOL: process.env.ELASTICSEARCH_PROTOCOL,
      ELASTICSEARCH_USERNAME: process.env.ELASTICSEARCH_USERNAME,
      ELASTICSEARCH_PASSWORD: process.env.ELASTICSEARCH_PASSWORD ? '[SET]' : '[NOT SET]',
      LEAKCHECK_API_KEY: process.env.LEAKCHECK_API_KEY ? '[SET]' : '[NOT SET]',
    }

    // Test connection
    const isConnected = await checkConnection()

    return NextResponse.json({
      success: true,
      environment: envInfo,
      clientExists: !!client,
      connectionTest: isConnected,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 