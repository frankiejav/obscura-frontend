import { Client } from '@elastic/elasticsearch'

// Build Elasticsearch URL from Vercel environment variables
const buildElasticsearchUrl = () => {
  const host = process.env.ELASTICSEARCH_HOST || 'localhost'
  const port = process.env.ELASTICSEARCH_PORT || '9200'
  const protocol = process.env.ELASTICSEARCH_PROTOCOL || 'http'
  
  // For IPv6 addresses, try without brackets first
  let formattedHost = host
  if (host.includes(':') && !host.startsWith('[')) {
    // Try without brackets first, then with brackets if needed
    formattedHost = host
  }
  
  return `${protocol}://${formattedHost}:${port}`
}

const elasticsearchUrl = buildElasticsearchUrl()
const isHttps = elasticsearchUrl.startsWith('https://')

const client = new Client({
  node: elasticsearchUrl,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
  ...(isHttps && {
    tls: {
      rejectUnauthorized: false, // For development - set to true in production
    },
  })
})

export default client

// Helper function to check if Elasticsearch is connected
export async function checkConnection() {
  try {
    console.log('Attempting to connect to Elasticsearch...')
    console.log('URL:', elasticsearchUrl)
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
    console.error('Host:', process.env.ELASTICSEARCH_HOST || 'localhost')
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