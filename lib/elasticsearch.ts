import { Client } from '@elastic/elasticsearch'

// Build Elasticsearch URL from environment variables
const buildElasticsearchUrl = () => {
  // Check if we have a complete URL in environment
  if (process.env.ELASTICSEARCH_URL) {
    // If the URL contains localhost, ignore it and use individual components
    if (process.env.ELASTICSEARCH_URL.includes('localhost')) {
      console.log('Ignoring localhost URL, using individual components')
    } else {
      return process.env.ELASTICSEARCH_URL
    }
  }
  
  // Build URL from individual components
  const host = process.env.ELASTICSEARCH_HOST
  const port = process.env.ELASTICSEARCH_PORT || '9200'
  const protocol = process.env.ELASTICSEARCH_PROTOCOL || 'http'
  
  // If no host is provided, return null to indicate no Elasticsearch
  if (!host) {
    return null
  }
  
  // Handle IPv6 addresses properly
  let formattedHost = host
  // Remove any existing brackets first
  if (formattedHost.startsWith('[') && formattedHost.endsWith(']')) {
    formattedHost = formattedHost.slice(1, -1)
  }
  if (formattedHost.includes(':') && !formattedHost.includes('.')) {
    // This is likely an IPv6 address, wrap it in brackets
    formattedHost = `[${formattedHost}]`
  }
  
  return `${protocol}://${formattedHost}:${port}`
}

const elasticsearchUrl = buildElasticsearchUrl()

// Only create client if we have a valid URL
let client: Client | null = null

if (elasticsearchUrl) {
  try {
    // Validate the URL
    new URL(elasticsearchUrl)
    
    const isHttps = elasticsearchUrl.startsWith('https://')
    
    client = new Client({
      node: elasticsearchUrl,
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || '',
      },
      tls: {
        rejectUnauthorized: false, // For self-signed certificates
      }
    })
  } catch (error) {
    console.error('Invalid Elasticsearch URL:', elasticsearchUrl)
    console.error('URL validation error:', error)
    client = null
  }
}

export default client

// Helper function to check if Elasticsearch is connected
export async function checkConnection() {
  if (!client) {
    console.log('Elasticsearch client not configured - no environment variables set')
    return false
  }
  
  try {
    console.log('Attempting to connect to Elasticsearch...')
    console.log('URL:', elasticsearchUrl)
    console.log('Environment variables:')
    console.log('- ELASTICSEARCH_URL:', process.env.ELASTICSEARCH_URL)
    console.log('- ELASTICSEARCH_HOST:', process.env.ELASTICSEARCH_HOST)
    console.log('- ELASTICSEARCH_PORT:', process.env.ELASTICSEARCH_PORT)
    console.log('- ELASTICSEARCH_PROTOCOL:', process.env.ELASTICSEARCH_PROTOCOL)
    console.log('Auth:', {
      username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD ? '[REDACTED]' : '[EMPTY]'
    })
    
    const info = await client.info()
    console.log('Elasticsearch connected successfully')
    console.log('Cluster info:', info.cluster_name, 'Version:', info.version.number)
    return true
  } catch (error) {
    console.error('Elasticsearch connection failed:')
    console.error('Host:', process.env.ELASTICSEARCH_HOST || 'not set')
    console.error('Port:', process.env.ELASTICSEARCH_PORT || '9200')
    console.error('Protocol:', process.env.ELASTICSEARCH_PROTOCOL || 'http')
    console.error('Built URL:', elasticsearchUrl)
    console.error('Error:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
    console.error('Make sure Elasticsearch is running and accessible')
    return false
  }
}

// Helper function to create index if it doesn't exist
export async function ensureIndex(indexName: string, mapping?: any) {
  if (!client) {
    console.log('Elasticsearch client not configured - skipping index creation')
    return
  }
  
  try {
    const exists = await client.indices.exists({ index: indexName })
    if (!exists) {
      await client.indices.create({
        index: indexName,
        body: mapping || {
          mappings: {
            properties: {
              name: { type: 'text' },
              email: { type: 'keyword' },
              ip: { type: 'ip' },
              domain: { type: 'keyword' },
              source: { type: 'keyword' },
              timestamp: { type: 'date' },
              additionalData: { type: 'object' }
            }
          }
        }
      })
      console.log(`Index ${indexName} created`)
    }
  } catch (error) {
    console.error(`Error ensuring index ${indexName}:`, error)
  }
} 