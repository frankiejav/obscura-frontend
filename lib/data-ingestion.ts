import { executeQuery, insertData } from './clickhouse'

interface DataRecord {
  id?: string
  victim_id?: string
  name?: string
  email?: string
  username?: string
  password?: string
  ip_address?: string
  domain?: string
  source_name?: string
  url?: string
  phone?: string
  address?: string
  country?: string
  origin?: string
  fields?: string[]
  hostname?: string
  language?: string
  timezone?: string
  os_version?: string
  hwid?: string
  cpu_name?: string
  gpu?: string
  ram_size?: string
  account_type?: string
  risk_score?: number
  risk_category?: string
  is_privileged?: boolean
  breach_impact?: string
}

interface CookieRecord {
  id?: string
  victim_id?: string
  domain?: string
  cookie_name?: string
  cookie_path?: string
  cookie_value?: string
  cookie_value_length?: number
  secure?: boolean
  cookie_type?: string
  risk_level?: string
  browser_source?: string
  hostname?: string
  ip_address?: string
  country?: string
}

/**
 * Transform raw data records into ClickHouse-compatible format for creds table
 */
function transformCredentialsRecord(record: DataRecord) {
  return {
    ts: new Date().toISOString(),
    victim_id: record.victim_id || `victim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    source_name: record.source_name || 'unknown',
    url: record.url || '',
    domain: record.domain || '',
    email: record.email || '',
    username: record.username || '',
    password: record.password || null,
    phone: record.phone || null,
    name: record.name || null,
    address: record.address || null,
    country: record.country || null,
    origin: record.origin || null,
    fields: record.fields || [],
    hostname: record.hostname || null,
    ip_address: record.ip_address || '',
    language: record.language || null,
    timezone: record.timezone || null,
    os_version: record.os_version || null,
    hwid: record.hwid || null,
    cpu_name: record.cpu_name || null,
    gpu: record.gpu || null,
    ram_size: record.ram_size || null,
    account_type: record.account_type || 'personal',
    risk_score: record.risk_score || 0,
    risk_category: record.risk_category || 'low',
    is_privileged: record.is_privileged || false,
    breach_impact: record.breach_impact || 'low',
  }
}

/**
 * Transform raw cookie records into ClickHouse-compatible format for cookies table
 */
function transformCookieRecord(record: CookieRecord) {
  return {
    ts: new Date().toISOString(),
    victim_id: record.victim_id || `victim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    domain: record.domain || '',
    cookie_name: record.cookie_name || '',
    cookie_path: record.cookie_path || '/',
    cookie_value: record.cookie_value || null,
    cookie_value_length: record.cookie_value_length || 0,
    secure: record.secure || false,
    cookie_type: record.cookie_type || 'general',
    risk_level: record.risk_level || 'low',
    browser_source: record.browser_source || 'unknown',
    hostname: record.hostname || null,
    ip_address: record.ip_address || null,
    country: record.country || null,
  }
}

/**
 * Insert credentials data into ClickHouse
 */
export async function insertCredentialsData(records: DataRecord[]) {
  try {
    if (!records || records.length === 0) {
      return { success: false, error: 'No records provided' }
    }

    const transformedRecords = records.map(transformCredentialsRecord)
    const result = await insertData('vault.creds', transformedRecords)
    
    return result
  } catch (error) {
    console.error('Error inserting credentials data:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Insert cookie data into ClickHouse
 */
export async function insertCookieData(records: CookieRecord[]) {
  try {
    if (!records || records.length === 0) {
      return { success: false, error: 'No records provided' }
    }

    const transformedRecords = records.map(transformCookieRecord)
    const result = await insertData('vault.cookies', transformedRecords)
    
    return result
  } catch (error) {
    console.error('Error inserting cookie data:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Search data records with advanced filtering
 */
export async function searchDataRecords(options: {
  term?: string
  type?: 'ALL' | 'NAME' | 'EMAIL' | 'IP' | 'DOMAIN' | 'SOURCE'
  source?: string
  from?: Date
  to?: Date
  page?: number
  limit?: number
}) {
  try {
    const {
      term,
      type = 'ALL',
      source,
      from,
      to,
      page = 1,
      limit = 10,
    } = options

    let whereConditions: string[] = []

    // Add search term conditions
    if (term && term.trim()) {
      const searchTerm = term.trim()
      
      switch (type) {
        case 'ALL':
          whereConditions.push(`(
            name ILIKE '%${searchTerm}%' OR 
            email ILIKE '%${searchTerm}%' OR 
            username ILIKE '%${searchTerm}%' OR 
            ip_address ILIKE '%${searchTerm}%' OR 
            domain ILIKE '%${searchTerm}%' OR 
            source_name ILIKE '%${searchTerm}%'
          )`)
          break
        case 'NAME':
          whereConditions.push(`name ILIKE '%${searchTerm}%'`)
          break
        case 'EMAIL':
          whereConditions.push(`email ILIKE '%${searchTerm}%'`)
          break
        case 'IP':
          whereConditions.push(`ip_address = '${searchTerm}'`)
          break
        case 'DOMAIN':
          whereConditions.push(`domain = '${searchTerm}'`)
          break
        case 'SOURCE':
          whereConditions.push(`source_name ILIKE '%${searchTerm}%'`)
          break
      }
    }

    // Add source filter
    if (source) {
      whereConditions.push(`source_name = '${source}'`)
    }

    // Add date range filter
    if (from) {
      whereConditions.push(`ts >= '${from.toISOString()}'`)
    }
    if (to) {
      whereConditions.push(`ts <= '${to.toISOString()}'`)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    const offset = (page - 1) * limit

    // Main search query
    const searchQuery = `
      SELECT 
        victim_id as id,
        name,
        email,
        ip_address as ip,
        domain,
        source_name as source,
        username,
        password,
        url,
        phone,
        address,
        country,
        account_type,
        risk_score,
        risk_category,
        is_privileged,
        breach_impact,
        ts as timestamp
      FROM vault.creds 
      ${whereClause}
      ORDER BY ts DESC 
      LIMIT ${limit} OFFSET ${offset}
    `

    // Count query for pagination
    const countQuery = `
      SELECT count() as total 
      FROM vault.creds 
      ${whereClause}
    `

    // Aggregation query for sources
    const aggregationQuery = `
      SELECT 
        source_name,
        count() as count 
      FROM vault.creds 
      ${whereClause}
      GROUP BY source_name 
      ORDER BY count DESC 
      LIMIT 10
    `

    // Execute queries in parallel
    const [searchResults, countResults, aggregationResults] = await Promise.all([
      executeQuery(searchQuery),
      executeQuery(countQuery),
      executeQuery(aggregationQuery)
    ]) as [any[], any[], any[]]

    const total = countResults[0]?.total || 0

    return {
      results: searchResults.map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        ip: row.ip,
        domain: row.domain,
        source: row.source,
        username: row.username,
        password: row.password,
        url: row.url,
        phone: row.phone,
        address: row.address,
        country: row.country,
        account_type: row.account_type,
        risk_score: row.risk_score,
        risk_category: row.risk_category,
        is_privileged: row.is_privileged,
        breach_impact: row.breach_impact,
        timestamp: row.timestamp,
      })),
      pagination: {
        total: parseInt(total),
        pages: Math.ceil(parseInt(total) / limit),
        current: page,
      },
      aggregations: {
        sources: aggregationResults.map((row: any) => ({
          name: row.source_name,
          count: parseInt(row.count),
        })),
        totalRecords: parseInt(total),
      },
    }
  } catch (error) {
    console.error('Error searching data records:', error)
    return {
      results: [],
      pagination: { total: 0, pages: 0, current: options.page || 1 },
      aggregations: { sources: [], totalRecords: 0 },
    }
  }
}

/**
 * Search for all credentials belonging to the same victim profiles with pagination
 */
export async function searchProfileCredentials(victimIds: string[], page: number = 1, limit: number = 10) {
  try {
    if (victimIds.length === 0) return { results: [], pagination: { total: 0, pages: 0, current: page } }

    const idsString = victimIds.map(id => `'${id}'`).join(',')
    const offset = (page - 1) * limit
    
    const profileQuery = `
      SELECT 
        victim_id as id,
        name,
        email,
        ip_address as ip,
        domain,
        source_name as source,
        username,
        password,
        url,
        phone,
        address,
        country,
        origin,
        fields,
        hostname,
        language,
        timezone,
        os_version,
        hwid,
        cpu_name,
        gpu,
        ram_size,
        account_type,
        risk_score,
        risk_category,
        is_privileged,
        breach_impact,
        ts as timestamp
      FROM vault.creds 
      WHERE victim_id IN (${idsString})
      ORDER BY victim_id, domain, ts DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countQuery = `
      SELECT count() as total 
      FROM vault.creds 
      WHERE victim_id IN (${idsString})
    `

    const [results, countResults] = await Promise.all([
      executeQuery(profileQuery),
      executeQuery(countQuery)
    ]) as [any[], any[]]

    const total = countResults[0]?.total || 0
    
    return {
      results: results.map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        ip: row.ip,
        domain: row.domain,
        source: row.source,
        username: row.username,
        password: row.password,
        url: row.url,
        phone: row.phone,
        address: row.address,
        country: row.country,
        origin: row.origin,
        fields: row.fields,
        hostname: row.hostname,
        language: row.language,
        timezone: row.timezone,
        os_version: row.os_version,
        hwid: row.hwid,
        cpu_name: row.cpu_name,
        gpu: row.gpu,
        ram_size: row.ram_size,
        account_type: row.account_type,
        risk_score: row.risk_score,
        risk_category: row.risk_category,
        is_privileged: row.is_privileged,
        breach_impact: row.breach_impact,
        timestamp: row.timestamp,
      })),
      pagination: {
        total: parseInt(total),
        pages: Math.ceil(parseInt(total) / limit),
        current: page,
      }
    }
  } catch (error) {
    console.error('Error searching profile credentials:', error)
    return { results: [], pagination: { total: 0, pages: 0, current: page } }
  }
}

/**
 * Search for all cookies belonging to the same victim profiles with pagination
 */
export async function searchProfileCookies(victimIds: string[], page: number = 1, limit: number = 10) {
  try {
    if (victimIds.length === 0) return { results: [], pagination: { total: 0, pages: 0, current: page } }

    const idsString = victimIds.map(id => `'${id}'`).join(',')
    const offset = (page - 1) * limit
    
    const profileQuery = `
      SELECT 
        victim_id as id,
        domain,
        cookie_name,
        cookie_path,
        cookie_value,
        cookie_value_length,
        secure,
        cookie_type,
        risk_level,
        browser_source,
        hostname,
        ip_address as ip,
        country,
        ts as timestamp
      FROM vault.cookies 
      WHERE victim_id IN (${idsString})
      ORDER BY victim_id, domain, ts DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countQuery = `
      SELECT count() as total 
      FROM vault.cookies 
      WHERE victim_id IN (${idsString})
    `

    const [results, countResults] = await Promise.all([
      executeQuery(profileQuery),
      executeQuery(countQuery)
    ]) as [any[], any[]]

    const total = countResults[0]?.total || 0
    
    return {
      results: results.map((row: any) => ({
        id: row.id,
        domain: row.domain,
        cookie_name: row.cookie_name,
        cookie_path: row.cookie_path,
        cookie_value: row.cookie_value,
        cookie_value_length: row.cookie_value_length,
        secure: row.secure,
        cookie_type: row.cookie_type,
        risk_level: row.risk_level,
        browser_source: row.browser_source,
        hostname: row.hostname,
        ip: row.ip,
        country: row.country,
        timestamp: row.timestamp,
      })),
      pagination: {
        total: parseInt(total),
        pages: Math.ceil(parseInt(total) / limit),
        current: page,
      }
    }
  } catch (error) {
    console.error('Error searching profile cookies:', error)
    return { results: [], pagination: { total: 0, pages: 0, current: page } }
  }
}

/**
 * Search cookie records with advanced filtering
 */
export async function searchCookieRecords(options: {
  term?: string
  type?: 'ALL' | 'DOMAIN' | 'COOKIE_NAME' | 'VICTIM_ID'
  domain?: string
  from?: Date
  to?: Date
  page?: number
  limit?: number
}) {
  try {
    const {
      term,
      type = 'ALL',
      domain,
      from,
      to,
      page = 1,
      limit = 10,
    } = options

    let whereConditions: string[] = []

    // Add search term conditions
    if (term && term.trim()) {
      const searchTerm = term.trim()
      
      switch (type) {
        case 'ALL':
          whereConditions.push(`(
            domain ILIKE '%${searchTerm}%' OR 
            cookie_name ILIKE '%${searchTerm}%' OR 
            victim_id ILIKE '%${searchTerm}%'
          )`)
          break
        case 'DOMAIN':
          whereConditions.push(`domain = '${searchTerm}'`)
          break
        case 'COOKIE_NAME':
          whereConditions.push(`cookie_name ILIKE '%${searchTerm}%'`)
          break
        case 'VICTIM_ID':
          whereConditions.push(`victim_id = '${searchTerm}'`)
          break
      }
    }

    // Add domain filter
    if (domain) {
      whereConditions.push(`domain = '${domain}'`)
    }

    // Add date range filter
    if (from) {
      whereConditions.push(`ts >= '${from.toISOString()}'`)
    }
    if (to) {
      whereConditions.push(`ts <= '${to.toISOString()}'`)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    const offset = (page - 1) * limit

    // Main search query
    const searchQuery = `
      SELECT 
        victim_id as id,
        domain,
        cookie_name,
        cookie_path,
        cookie_value,
        cookie_value_length,
        secure,
        cookie_type,
        risk_level,
        browser_source,
        hostname,
        ip_address,
        country,
        ts as timestamp
      FROM vault.cookies 
      ${whereClause}
      ORDER BY ts DESC 
      LIMIT ${limit} OFFSET ${offset}
    `

    // Count query for pagination
    const countQuery = `
      SELECT count() as total 
      FROM vault.cookies 
      ${whereClause}
    `

    // Execute queries in parallel
    const [searchResults, countResults] = await Promise.all([
      executeQuery(searchQuery),
      executeQuery(countQuery)
    ]) as [any[], any[]]

    const total = countResults[0]?.total || 0

    return {
      results: searchResults.map((row: any) => ({
        id: row.id,
        domain: row.domain,
        cookie_name: row.cookie_name,
        cookie_path: row.cookie_path,
        cookie_value: row.cookie_value,
        cookie_value_length: row.cookie_value_length,
        secure: row.secure,
        cookie_type: row.cookie_type,
        risk_level: row.risk_level,
        browser_source: row.browser_source,
        hostname: row.hostname,
        ip_address: row.ip_address,
        country: row.country,
        timestamp: row.timestamp,
      })),
      pagination: {
        total: parseInt(total),
        pages: Math.ceil(parseInt(total) / limit),
        current: page,
      },
    }
  } catch (error) {
    console.error('Error searching cookie records:', error)
    return {
      results: [],
      pagination: { total: 0, pages: 0, current: options.page || 1 },
    }
  }
}

/**
 * Delete old records (cleanup utility)
 */
export async function deleteOldRecords(olderThanDays: number) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    // Delete from both tables
    const deleteCredsQuery = `
      ALTER TABLE vault.creds 
      DELETE WHERE ts < '${cutoffDate.toISOString()}'
    `
    const deleteCookiesQuery = `
      ALTER TABLE vault.cookies 
      DELETE WHERE ts < '${cutoffDate.toISOString()}'
    `

    await Promise.all([
      executeQuery(deleteCredsQuery),
      executeQuery(deleteCookiesQuery)
    ])

    // Get remaining counts
    const [credsCountResult, cookiesCountResult] = await Promise.all([
      executeQuery('SELECT count() as remaining FROM vault.creds'),
      executeQuery('SELECT count() as remaining FROM vault.cookies')
    ]) as [any[], any[]]

    const credsRemaining = credsCountResult[0]?.remaining || 0
    const cookiesRemaining = cookiesCountResult[0]?.remaining || 0
    const totalRemaining = parseInt(credsRemaining) + parseInt(cookiesRemaining)

    console.log(`Deleted records older than ${olderThanDays} days. Remaining: ${credsRemaining} creds, ${cookiesRemaining} cookies (${totalRemaining} total)`)
    return { 
      success: true, 
      remaining: totalRemaining,
      credsRemaining: parseInt(credsRemaining),
      cookiesRemaining: parseInt(cookiesRemaining)
    }
  } catch (error) {
    console.error('Error deleting old records:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}