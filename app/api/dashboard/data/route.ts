import { type NextRequest, NextResponse } from "next/server"
import { Client as ElasticClient } from "@elastic/elasticsearch"
import { Client } from "pg"

export async function GET(request: NextRequest) {
  try {
    // Connect to Elasticsearch
    const esClient = new ElasticClient({
      node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
    })

    // Connect to PostgreSQL
    const pgClient = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    await pgClient.connect()

    // Get Elasticsearch indices info
    const indices = await esClient.cat.indices({ format: "json" })
    
    // Get data sources from audit logs
    const dataSources = await pgClient.query(`
      SELECT 
        resource as source,
        COUNT(*) as record_count,
        MAX(created_at) as last_updated,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as recent_updates
      FROM audit_logs 
      WHERE resource IS NOT NULL 
      AND action LIKE '%DATA%'
      GROUP BY resource
      ORDER BY last_updated DESC
      LIMIT 10
    `)

    await pgClient.end()

    // Format the response
    const dataSourcesList = dataSources.rows.map(source => ({
      name: source.source,
      recordCount: parseInt(source.record_count || "0"),
      lastUpdated: source.last_updated,
      recentUpdates: parseInt(source.recent_updates || "0"),
      status: "active"
    }))

    // Add Elasticsearch indices as data sources
    const esDataSources = indices.map(index => ({
      name: `Elasticsearch: ${index.index}`,
      recordCount: parseInt(index["docs.count"] || "0"),
      lastUpdated: new Date().toISOString(), // ES doesn't provide this easily
      recentUpdates: 0,
      status: "active"
    }))

    const allDataSources = [...dataSourcesList, ...esDataSources]

    return NextResponse.json({ 
      dataSources: allDataSources,
      totalIndices: indices.length,
      totalRecords: indices.reduce((sum, index) => sum + parseInt(index["docs.count"] || "0"), 0)
    })
  } catch (error) {
    console.error("Data API error:", error)
    return NextResponse.json({ error: "Failed to fetch data sources" }, { status: 500 })
  }
} 