import { Pool } from "pg"
import { Client } from "@elastic/elasticsearch"

// PostgreSQL connection for user data
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Elasticsearch client for search data
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  auth: process.env.ELASTICSEARCH_USERNAME
    ? {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD || "",
      }
    : undefined,
  requestTimeout: 30000,
  pingTimeout: 3000,
})

// PostgreSQL helper functions
export const db = {
  query: (text: string, params?: any[]) => pgPool.query(text, params),
  getClient: () => pgPool.connect(),
}

// Elasticsearch helper functions
export const search = {
  client: esClient,

  // Search in main data index
  searchData: async (query: any) => {
    return await esClient.search({
      index: "obscura_data",
      body: query,
    })
  },

  // Index new data
  indexData: async (id: string, document: any) => {
    return await esClient.index({
      index: "obscura_data",
      id,
      body: document,
    })
  },

  // Log search analytics
  logSearch: async (searchData: any) => {
    return await esClient.index({
      index: "obscura_analytics",
      body: {
        ...searchData,
        timestamp: new Date(),
      },
    })
  },

  // Search threat intelligence
  searchThreats: async (query: any) => {
    return await esClient.search({
      index: "obscura_threats",
      body: query,
    })
  },
}

// Health check functions
export const healthCheck = {
  postgres: async () => {
    try {
      const result = await db.query("SELECT 1")
      return { status: "healthy", details: result.rows }
    } catch (error) {
      return { status: "unhealthy", error: error.message }
    }
  },

  elasticsearch: async () => {
    try {
      const health = await esClient.cluster.health()
      return { status: "healthy", details: health }
    } catch (error) {
      return { status: "unhealthy", error: error.message }
    }
  },
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Closing database connections...")
  await pgPool.end()
  await esClient.close()
  process.exit(0)
})
