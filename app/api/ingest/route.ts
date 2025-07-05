import { type NextRequest, NextResponse } from "next/server"
import { ingestDataRecords, ParsedDataRecord } from "@/lib/data-ingestion"
import { checkConnection } from "@/lib/elasticsearch"

export async function POST(request: NextRequest) {
  try {
    // Check Elasticsearch connection
    const isConnected = await checkConnection()
    if (!isConnected) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 503 })
    }

    const body = await request.json()
    const { records, sourceName } = body

    // Validate input
    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Records array is required" }, { status: 400 })
    }

    if (!sourceName || typeof sourceName !== 'string') {
      return NextResponse.json({ error: "Source name is required" }, { status: 400 })
    }

    // Validate record structure
    const validatedRecords: ParsedDataRecord[] = records.map((record: any, index: number) => {
      if (!record.source) {
        throw new Error(`Record at index ${index} is missing required 'source' field`)
      }

      return {
        name: record.name,
        email: record.email,
        ip: record.ip,
        domain: record.domain,
        source: record.source,
        additionalData: record.additionalData,
        timestamp: record.timestamp ? new Date(record.timestamp) : undefined,
      }
    })

    // Ingest the records
    const result = await ingestDataRecords(validatedRecords, sourceName)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully ingested ${result.count} records`,
        count: result.count,
        sourceName,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Data ingestion error:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error",
    }, { status: 500 })
  }
}

// Handle GET requests to show ingestion status
export async function GET(request: NextRequest) {
  try {
    const isConnected = await checkConnection()
    if (!isConnected) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 503 })
    }

    return NextResponse.json({
      status: "ready",
      message: "Data ingestion endpoint is ready",
      usage: {
        method: "POST",
        body: {
          records: "Array of data records",
          sourceName: "String identifying the data source",
        },
        example: {
          records: [
            {
              name: "John Doe",
              email: "john@example.com",
              ip: "192.168.1.1",
              domain: "example.com",
              source: "breach_2024",
              additionalData: { breach_type: "email" },
            },
          ],
          sourceName: "Breach Data 2024",
        },
      },
    })
  } catch (error) {
    console.error("Ingestion status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 