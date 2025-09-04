import { type NextRequest, NextResponse } from "next/server"
import { ingestDataRecords, ParsedDataRecord } from "@/lib/data-ingestion"
import { checkConnection } from "@/lib/clickhouse"

export async function POST(request: NextRequest) {
  try {
    // Check ClickHouse connection
    const isConnected = await checkConnection()
    if (!isConnected) {
      return NextResponse.json({ error: "ClickHouse connection failed" }, { status: 503 })
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
      return {
        victim_id: record.victim_id,
        source_name: record.source_name || sourceName,
        domain: record.domain,
        email: record.email,
        username: record.username,
        password: record.password,
        phone: record.phone,
        name: record.name,
        address: record.address,
        country: record.country,
        origin: record.origin,
        fields: record.fields,
        hostname: record.hostname,
        ip_address: record.ip_address || record.ip,
        language: record.language,
        timezone: record.timezone,
        os_version: record.os_version,
        hwid: record.hwid,
        cpu_name: record.cpu_name,
        gpu: record.gpu,
        ram_size: record.ram_size,
        ts: record.ts || record.timestamp ? new Date(record.ts || record.timestamp) : undefined,
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
      error: error instanceof Error ? error.message : "Internal server error",
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
                username: "johndoe",
                ip_address: "192.168.1.1",
                domain: "example.com",
                source_name: "breach_2024",
                password: "password123",
                phone: "+1234567890",
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