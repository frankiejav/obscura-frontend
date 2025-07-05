import { NextResponse } from "next/server"
import client from "@/lib/elasticsearch"
import { ensureIndex } from "@/lib/elasticsearch"

export async function POST() {
  try {
    // Ensure indices exist
    await ensureIndex('data_sources')
    await ensureIndex('data_records')

    // Add sample data sources
    const sampleDataSources = [
      {
        name: "Breach Database 2024",
        recordCount: 1500000,
        lastUpdated: new Date().toISOString(),
        status: "ACTIVE"
      },
      {
        name: "Email Leaks 2023",
        recordCount: 850000,
        lastUpdated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: "ACTIVE"
      },
      {
        name: "Password Dumps",
        recordCount: 420000,
        lastUpdated: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: "PROCESSING"
      }
    ]

    // Add sample data records
    const sampleDataRecords = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        ip: "192.168.1.100",
        domain: "example.com",
        source: "Breach Database 2024",
        timestamp: new Date().toISOString(),
        additionalData: {
          breach_type: "email",
          severity: "medium"
        }
      },
      {
        name: "Jane Smith",
        email: "jane.smith@test.org",
        ip: "10.0.0.50",
        domain: "test.org",
        source: "Email Leaks 2023",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        additionalData: {
          breach_type: "email",
          severity: "low"
        }
      },
      {
        name: "Bob Johnson",
        email: "bob.johnson@company.net",
        ip: "172.16.0.25",
        domain: "company.net",
        source: "Password Dumps",
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        additionalData: {
          breach_type: "password",
          severity: "high"
        }
      }
    ]

    // Index data sources
    for (const source of sampleDataSources) {
      await client.index({
        index: 'data_sources',
        body: source
      })
    }

    // Index data records
    for (const record of sampleDataRecords) {
      await client.index({
        index: 'data_records',
        body: record
      })
    }

    // Refresh indices to make data searchable
    await client.indices.refresh({ index: ['data_sources', 'data_records'] })

    return NextResponse.json({
      message: "Sample data added successfully",
      dataSources: sampleDataSources.length,
      dataRecords: sampleDataRecords.length
    })

  } catch (error) {
    console.error('Error adding test data:', error)
    return NextResponse.json(
      { error: 'Failed to add test data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 