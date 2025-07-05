import { graphql } from 'graphql'
import client from './elasticsearch'
import { ensureIndex } from './elasticsearch'

// Type-safe wrapper for Elasticsearch client
const esClient = client as any

// Custom scalar resolvers
const customScalars = {
  DateTime: {
    serialize: (value: any) => value instanceof Date ? value.toISOString() : value,
    parseValue: (value: any) => new Date(value),
    parseLiteral: (ast: any) => ast.value ? new Date(ast.value) : null,
  },
  JSON: {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: (ast: any) => ast.value,
  },
}

// Helper to get total hits value safely
function getTotalHits(result: any): number {
  if (!result || !result.hits || typeof result.hits.total === 'undefined') return 0;
  if (typeof result.hits.total === 'number') return result.hits.total;
  if (typeof result.hits.total.value === 'number') return result.hits.total.value;
  return 0;
}

// Helper to get default settings
function getDefaultSettings() {
  return {
    general: {
      apiUrl: "",
      defaultPageSize: "20",
      theme: "system",
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: "30",
      ipWhitelist: "",
      enforceStrongPasswords: true,
    },
    notifications: {
      emailAlerts: true,
      dailySummary: false,
      securityAlerts: true,
      dataUpdates: false,
    },
    api: {
      rateLimit: "100",
      tokenExpiration: "7",
      logLevel: "info",
    },
    leakCheck: {
      enabled: false,
      quota: 0,
      lastSync: null,
    },
  }
}

// LeakCheck API helper functions
async function callLeakCheckAPI(query: string, type?: string) {
  // Use our internal API route to protect the API key
  const response = await fetch('/api/leakcheck', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      type,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || `LeakCheck API error: ${response.status}`)
  }

  return await response.json()
}

async function fetchLeakCheckDatabases() {
  try {
    const response = await fetch('https://leakcheck.io/databases-list?_=1751679364404')
    if (!response.ok) {
      throw new Error(`Failed to fetch databases: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching LeakCheck databases:', error)
    return { data: [] }
  }
}

// Root resolvers
export const resolvers = {
  Query: {
    // Settings queries
    settings: async () => {
      try {
        // Try to get settings from Elasticsearch
        if (!esClient) {
          return getDefaultSettings()
        }
        const result = await esClient.get({
          index: 'settings',
          id: 'default',
        })
        return result._source || getDefaultSettings()
      } catch (error) {
        // If settings don't exist, return default settings
        return getDefaultSettings()
      }
    },

    // LeakCheck queries
    leakCheckSearch: async (parent: any, { query, type }: { query: string; type?: string }) => {
      try {
        // Get current settings to check if LeakCheck is enabled
        const settings = await resolvers.Query.settings() as any
        
        if (!settings.leakCheck.enabled) {
          throw new Error('LeakCheck API is not enabled')
        }

        const result = await callLeakCheckAPI(query, type)
        
        // Update quota in settings if available
        if (result.quota !== undefined && esClient) {
          await esClient.update({
            index: 'settings',
            id: 'default',
            body: {
              doc: {
                leakCheck: {
                  ...settings.leakCheck,
                  quota: result.quota,
                }
              }
            }
          })
        }

        return result
      } catch (error) {
        console.error('LeakCheck search error:', error)
        return {
          success: false,
          found: 0,
          quota: 0,
          result: [],
        }
      }
    },

    // User queries
    me: async (parent: any, args: any, context: any) => {
      // Mock user for now - in real app, get from JWT token
      return {
        id: '1',
        name: 'Admin User',
        email: 'admin@obscura.com',
        role: 'ADMIN',
        lastActive: new Date(),
      }
    },

    user: async (parent: any, { id }: { id: string }) => {
      try {
        const result = await esClient.get({
          index: 'obscura_personal_info',
          id,
        })
        return result._source ? Object.assign({}, result._source) : null
      } catch (error) {
        console.error('Error fetching user:', error)
        return null
      }
    },

    users: async (parent: any, { first = 10, after }: { first?: number; after?: string }) => {
      try {
        const result = await esClient.search({
          index: 'obscura_personal_info',
          body: {
            size: first,
            from: after ? parseInt(after) : 0,
            sort: [{ createdAt: { order: 'desc' } }],
          } as any,
        })
        return result.hits.hits.map((hit: any) => Object.assign({ id: hit._id }, hit._source || {}))
      } catch (error) {
        console.error('Error fetching users:', error)
        return []
      }
    },

    // Data record queries
    dataRecord: async (parent: any, { id }: { id: string }) => {
      try {
        const result = await esClient.get({
          index: 'obscura_emails',
          id,
        })
        return result._source ? Object.assign({ id: result._id }, result._source) : null
      } catch (error) {
        console.error('Error fetching data record:', error)
        return null
      }
    },

    dataRecords: async (parent: any, { first = 10, after, source }: { first?: number; after?: string; source?: string }) => {
      try {
        const query: any = {
          bool: {
            must: [],
          },
        }

        if (source) {
          query.bool.must.push({ term: { source } })
        }

        const result = await esClient.search({
          index: 'obscura_emails',
          body: {
            size: first,
            from: after ? parseInt(after) : 0,
            query,
            sort: [{ timestamp: { order: 'desc' } }],
          } as any,
        })

        const edges = result.hits.hits.map((hit: any) => ({
          node: Object.assign({ id: hit._id }, hit._source || {}),
          cursor: hit._id,
        }))

        const total = getTotalHits(result)

        return {
          edges,
          pageInfo: {
            hasNextPage: total > (parseInt(after || '0') + first),
            hasPreviousPage: parseInt(after || '0') > 0,
            startCursor: edges[0]?.cursor,
            endCursor: edges[edges.length - 1]?.cursor,
          },
          totalCount: total,
        }
      } catch (error) {
        console.error('Error fetching data records:', error)
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        }
      }
    },

    // Search functionality
    search: async (parent: any, { term, type, page = 1, limit = 10, source, fromDate, toDate }: { 
      term: string; 
      type: string; 
      page?: number; 
      limit?: number;
      source?: string;
      fromDate?: string;
      toDate?: string;
    }) => {
      try {
        const query: any = {
          bool: {
            must: [],
            should: [],
          },
        }

        // Add search term
        if (term && term.trim()) {
          // Build search query based on type
          switch (type.toUpperCase()) {
            case 'ALL':
              query.bool.should = [
                { match: { name: term } },
                { match: { email: term } },
                { match: { domain: term } },
                { match: { source: term } },
              ]
              break
            case 'NAME':
              query.bool.must.push({ match: { name: term } })
              break
            case 'EMAIL':
              query.bool.must.push({ term: { email: term } })
              break
            case 'IP':
              query.bool.must.push({ term: { ip: term } })
              break
            case 'DOMAIN':
              query.bool.must.push({ term: { domain: term } })
              break
            case 'SOURCE':
              query.bool.must.push({ term: { source: term } })
              break
            default:
              query.bool.should = [
                { match: { name: term } },
                { match: { email: term } },
                { match: { domain: term } },
                { match: { source: term } },
              ]
          }
        }

        // Add source filter
        if (source) {
          query.bool.must.push({ term: { source } })
        }

        // Add date range filter
        if (fromDate || toDate) {
          const range: any = {}
          if (fromDate) range.gte = fromDate
          if (toDate) range.lte = toDate
          query.bool.must.push({ range: { timestamp: range } })
        }

        const from = (page - 1) * limit
        const result = await esClient.search({
          index: 'obscura_emails',
          body: {
            size: limit,
            from,
            query,
            sort: [{ timestamp: { order: 'desc' } }],
          } as any,
        })

        const total = getTotalHits(result)

        return {
          results: result.hits.hits.map((hit: any) => Object.assign({ id: hit._id }, hit._source || {})),
          pagination: {
            total: total,
            pages: Math.ceil(total / limit),
            current: page,
          },
        }
      } catch (error) {
        console.error('Error searching data:', error)
        return {
          results: [],
          pagination: {
            total: 0,
            pages: 0,
            current: page,
          },
        }
      }
    },

    // Data source queries
    dataSources: async () => {
      try {
        const result = await esClient.search({
          index: 'obscura_records',
          body: {
            size: 100,
            sort: [{ lastUpdated: { order: 'desc' } }],
          } as any,
        })
        return result.hits.hits.map((hit: any) => Object.assign({ id: hit._id }, hit._source || {}))
      } catch (error) {
        console.error('Error fetching data sources:', error)
        // Return empty array instead of null for non-nullable field
        return []
      }
    },

    dataSource: async (parent: any, { id }: { id: string }) => {
      try {
        const result = await esClient.get({
          index: 'obscura_records',
          id,
        })
        return result._source ? Object.assign({ id: result._id }, result._source) : null
      } catch (error) {
        console.error('Error fetching data source:', error)
        return null
      }
    },

    // Notification queries
    notifications: async (parent: any, { first = 10, after, isRead }: { 
      first?: number; 
      after?: string; 
      isRead?: boolean; 
    }) => {
      try {
        const query: any = {
          bool: {
            must: [],
          },
        }

        if (isRead !== undefined) {
          query.bool.must.push({ term: { isRead } })
        }

        const result = await esClient.search({
          index: 'notifications',
          body: {
            size: first,
            from: after ? parseInt(after) : 0,
            query,
            sort: [{ createdAt: { order: 'desc' } }],
          } as any,
        })

        const edges = result.hits.hits.map((hit: any) => ({
          node: Object.assign({ id: hit._id }, hit._source || {}),
          cursor: hit._id,
        }))

        const total = getTotalHits(result)

        return {
          edges,
          pageInfo: {
            hasNextPage: total > (parseInt(after || '0') + first),
            hasPreviousPage: parseInt(after || '0') > 0,
            startCursor: edges[0]?.cursor,
            endCursor: edges[edges.length - 1]?.cursor,
          },
          totalCount: total,
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        }
      }
    },

    unreadNotificationCount: async () => {
      try {
        const result = await esClient.search({
          index: 'notifications',
          body: {
            size: 0,
            query: {
              term: { isRead: false },
            },
          } as any,
        })
        return getTotalHits(result)
      } catch (error) {
        console.error('Error fetching unread notification count:', error)
        return 0
      }
    },

    // Audit logs
    auditLogs: async (parent: any, { userId, action, from, to, first = 10, after }: { userId?: string; action?: string; from?: Date; to?: Date; first?: number; after?: string }) => {
      try {
        const query: any = {
          bool: {
            must: [],
          },
        }

        if (userId) {
          query.bool.must.push({ term: { userId } })
        }
        if (action) {
          query.bool.must.push({ term: { action } })
        }
        if (from || to) {
          const range: any = {}
          if (from) range.gte = from.toISOString()
          if (to) range.lte = to.toISOString()
          query.bool.must.push({ range: { timestamp: range } })
        }

        const result = await esClient.search({
          index: 'audit_logs',
          body: {
            size: first,
            from: after ? parseInt(after) : 0,
            query,
            sort: [{ timestamp: { order: 'desc' } }],
          },
        })

        return result.hits.hits.map((hit: any) => ({
          ...hit._source,
          id: hit._id,
        }))
      } catch (error) {
        console.error('Error fetching audit logs:', error)
        return []
      }
    },
  },

  Mutation: {
    // Settings mutations
    updateSettings: async (parent: any, { settings }: { settings: any }) => {
      try {
        await ensureIndex('settings')
        await esClient.index({
          index: 'settings',
          id: 'default',
          body: settings,
        })
        return settings
      } catch (error) {
        console.error('Error updating settings:', error)
        throw new Error('Failed to update settings')
      }
    },

    // Auth mutations
    login: async (parent: any, { email, password }: { email: string; password: string }) => {
      // Mock authentication - in real app, verify against database
      if (email === 'admin@obscura.com' && password === 'password') {
        return {
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            name: 'Admin User',
            email: 'admin@obscura.com',
            role: 'ADMIN',
            lastActive: new Date(),
          },
        }
      }
      throw new Error('Invalid credentials')
    },

    refreshToken: async (parent: any, { token }: { token: string }) => {
      // Mock token refresh
      return {
        token: 'new-mock-jwt-token',
        refreshToken: 'new-mock-refresh-token',
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@obscura.com',
          role: 'ADMIN',
          lastActive: new Date(),
        },
      }
    },

    // User mutations
    createUser: async (parent: any, { name, email, password, role }: { name: string; email: string; password: string; role: string }) => {
      try {
        await ensureIndex('users')
        const result = await esClient.index({
          index: 'users',
          body: {
            name,
            email,
            password, // In real app, hash this
            role,
            createdAt: new Date(),
            lastActive: new Date(),
          },
        })
        return {
          id: result._id,
          name,
          email,
          role,
          lastActive: new Date(),
        }
      } catch (error) {
        console.error('Error creating user:', error)
        throw new Error('Failed to create user')
      }
    },

    updateUser: async (parent: any, { id, name, email, role }: { id: string; name?: string; email?: string; role?: string }) => {
      try {
        const updateBody: any = {}
        if (name) updateBody.name = name
        if (email) updateBody.email = email
        if (role) updateBody.role = role
        updateBody.lastActive = new Date()

        await esClient.update({
          index: 'users',
          id,
          body: { doc: updateBody },
        })

        const result = await esClient.get({
          index: 'users',
          id,
        })

        return {
          ...result._source,
          id: result._id,
        }
      } catch (error) {
        console.error('Error updating user:', error)
        throw new Error('Failed to update user')
      }
    },

    deleteUser: async (parent: any, { id }: { id: string }) => {
      try {
        await esClient.delete({
          index: 'users',
          id,
        })
        return true
      } catch (error) {
        console.error('Error deleting user:', error)
        return false
      }
    },

    // Data record mutations
    createDataRecord: async (parent: any, { input }: { input: any }) => {
      try {
        await ensureIndex('data_records')
        const result = await esClient.index({
          index: 'data_records',
          body: {
            ...input,
            timestamp: new Date(),
          },
        })
        return {
          ...input,
          id: result._id,
          timestamp: new Date(),
        }
      } catch (error) {
        console.error('Error creating data record:', error)
        throw new Error('Failed to create data record')
      }
    },

    updateDataRecord: async (parent: any, { id, input }: { id: string; input: any }) => {
      try {
        await esClient.update({
          index: 'data_records',
          id,
          body: { doc: input },
        })

        const result = await esClient.get({
          index: 'data_records',
          id,
        })

        return {
          ...result._source,
          id: result._id,
        }
      } catch (error) {
        console.error('Error updating data record:', error)
        throw new Error('Failed to update data record')
      }
    },

    deleteDataRecord: async (parent: any, { id }: { id: string }) => {
      try {
        await esClient.delete({
          index: 'data_records',
          id,
        })
        return true
      } catch (error) {
        console.error('Error deleting data record:', error)
        return false
      }
    },

    // Notification mutations
    createNotification: async (parent: any, { title, message, type, priority, targetUserId }: { 
      title: string; 
      message: string; 
      type: string; 
      priority: string; 
      targetUserId?: string; 
    }) => {
      try {
        await ensureIndex('notifications')
        const result = await esClient.index({
          index: 'notifications',
          body: {
            title,
            message,
            type,
            priority,
            isRead: false,
            createdAt: new Date(),
            targetUserId,
          },
        })
        return {
          id: result._id,
          title,
          message,
          type,
          priority,
          isRead: false,
          createdAt: new Date(),
          targetUserId,
        }
      } catch (error) {
        console.error('Error creating notification:', error)
        throw new Error('Failed to create notification')
      }
    },

    markNotificationAsRead: async (parent: any, { id }: { id: string }) => {
      try {
        await esClient.update({
          index: 'notifications',
          id,
          body: { doc: { isRead: true } },
        })

        const result = await esClient.get({
          index: 'notifications',
          id,
        })

        return {
          ...result._source,
          id: result._id,
        }
      } catch (error) {
        console.error('Error marking notification as read:', error)
        throw new Error('Failed to mark notification as read')
      }
    },

    markAllNotificationsAsRead: async () => {
      try {
        await esClient.updateByQuery({
          index: 'notifications',
          body: {
            query: { term: { isRead: false } },
            script: { source: 'ctx._source.isRead = true' },
          },
        })
        return true
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
        return false
      }
    },

    deleteNotification: async (parent: any, { id }: { id: string }) => {
      try {
        await esClient.delete({
          index: 'notifications',
          id,
        })
        return true
      } catch (error) {
        console.error('Error deleting notification:', error)
        return false
      }
    },

    // Data source mutations
    refreshDataSource: async (parent: any, { id }: { id: string }) => {
      try {
        await esClient.update({
          index: 'data_sources',
          id,
          body: {
            doc: {
              lastUpdated: new Date(),
              status: 'ACTIVE',
            },
          },
        })

        const result = await esClient.get({
          index: 'data_sources',
          id,
        })

        return {
          ...result._source,
          id: result._id,
        }
      } catch (error) {
        console.error('Error refreshing data source:', error)
        throw new Error('Failed to refresh data source')
      }
    },

    // LeakCheck mutations
    syncLeakCheckData: async () => {
      try {
        // Get current settings
        const settings = await resolvers.Query.settings() as any
        
        if (!settings.leakCheck.enabled) {
          throw new Error('LeakCheck API is not enabled')
        }

        // Fetch LeakCheck databases
        const databasesResponse = await fetchLeakCheckDatabases()
        
        if (!databasesResponse.data || !Array.isArray(databasesResponse.data)) {
          throw new Error('Failed to fetch LeakCheck databases')
        }

        // Calculate total records from LeakCheck databases
        const leakCheckRecords = databasesResponse.data.reduce((sum: number, db: any) => {
          return sum + (db.count || 0)
        }, 0)

        // Get total Elasticsearch records
        let elasticsearchRecords = 0
        try {
          const esResult = await esClient.search({
            index: 'obscura_emails',
            body: {
              size: 0,
              query: { match_all: {} }
            }
          })
          elasticsearchRecords = getTotalHits(esResult)
        } catch (error) {
          console.error('Error getting Elasticsearch record count:', error)
        }

        // Calculate total record count: (10,000,000,000+) + (sum of elasticsearch records)
        const baseCount = 10000000000 // 10 billion base
        const totalRecords = baseCount + elasticsearchRecords + leakCheckRecords

        // Create individual data sources for each LeakCheck database
        await ensureIndex('data_sources')
        
        // Create main LeakCheck data source with total count
        await esClient.index({
          index: 'data_sources',
          id: 'leakcheck',
          body: {
            name: 'LeakCheck Database',
            recordCount: totalRecords,
            lastUpdated: new Date(),
            status: 'ACTIVE',
            source: 'leakcheck',
            metadata: {
              databases: databasesResponse.data.length,
              leakCheckRecords: leakCheckRecords,
              elasticsearchRecords: elasticsearchRecords,
              baseCount: baseCount,
              description: 'Comprehensive data breach database from LeakCheck.io'
            }
          },
        })

        // Create individual data sources for each database
        for (const db of databasesResponse.data) {
          if (db.name && db.count > 0) {
            const dbId = `leakcheck_${db.id}`
            await esClient.index({
              index: 'data_sources',
              id: dbId,
              body: {
                name: db.name,
                recordCount: db.count,
                lastUpdated: new Date(),
                status: 'ACTIVE',
                source: 'leakcheck',
                metadata: {
                  breach_date: db.breach_date,
                  unverified: db.unverified,
                  passwordless: db.passwordless,
                  compilation: db.compilation,
                  database_id: db.id,
                  description: `Data breach from ${db.name}`
                }
              },
            })
          }
        }

        // Update settings with last sync time
        await esClient.update({
          index: 'settings',
          id: 'default',
          body: {
            doc: {
              leakCheck: {
                ...settings.leakCheck,
                lastSync: new Date(),
              }
            }
          }
        })

        return true
      } catch (error) {
        console.error('Error syncing LeakCheck data:', error)
        return false
      }
    },
  },
} 