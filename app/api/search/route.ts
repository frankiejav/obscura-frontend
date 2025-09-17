import { NextRequest, NextResponse } from 'next/server'
import { searchDataRecords, searchProfileCredentials, searchProfileCookies } from '@/lib/data-ingestion'
import { protectedRoute } from '@/lib/feature-guards'
import { Feature } from '@/lib/account-types'
import { getUserSubscription } from '@/lib/user-subscription'
import { 
  redactCredentialRecord, 
  redactLeakCheckResult, 
  redactCookieRecords,
  addRedactionNotice 
} from '@/lib/data-redaction'

async function handleSearch(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      term, 
      type, 
      page = 1, 
      limit = 10, 
      source, 
      fromDate, 
      toDate, 
      profilesEnabled = false,
      cookiesEnabled = false,
      profilePage = 1,
      profileLimit = 10,
      cookiePage = 1,
      cookieLimit = 10
    } = body

    // Get user subscription to determine if redaction is needed
    const subscription = await getUserSubscription(request)
    const accountType = subscription?.accountType || 'free'

    // Convert date strings to Date objects if provided
    const from = fromDate ? new Date(fromDate) : undefined
    const to = toDate ? new Date(toDate) : undefined

    // Use ClickHouse search function
    const result = await searchDataRecords({
      term: term?.trim(),
      type: type?.toUpperCase() || 'ALL',
      source,
      from,
      to,
      page,
      limit,
    })

    // Apply redaction to ClickHouse results
    const redactedResults = result.results.map((record: any) => 
      redactCredentialRecord(record, accountType)
    )

    let profileResults: any[] = []
    let profileCookies: any[] = []
    let profilePagination = { total: 0, pages: 0, current: profilePage }
    let cookiePagination = { total: 0, pages: 0, current: cookiePage }
    
    // If profiles are enabled, get all credentials for the same victim_ids
    if (profilesEnabled && result.results.length > 0) {
      const victimIds = [...new Set(result.results.map(r => r.id))] // Get unique victim IDs
      
      // Search credentials with pagination
      const credentialsResult = await searchProfileCredentials(victimIds, profilePage, profileLimit)
      // Apply redaction to profile credentials
      profileResults = credentialsResult.results.map((record: any) => 
        redactCredentialRecord(record, accountType)
      )
      profilePagination = credentialsResult.pagination
      
      // Search cookies only if enabled
      if (cookiesEnabled) {
        const cookiesResult = await searchProfileCookies(victimIds, cookiePage, cookieLimit)
        // Apply redaction to cookies
        profileCookies = redactCookieRecords(cookiesResult.results, accountType)
        cookiePagination = cookiesResult.pagination
      }
    }

    // Always call leak check API
    let breachResults = null
    try {
      // Directly check if we have the API key
      const apiKey = process.env.LEAKCHECK_API_KEY
      
      if (apiKey && term?.trim()) {
        console.log('Calling LeakCheck API for term:', term.trim(), 'type:', type)
        
        // Detect email type if auto
        let searchType = type
        if (type === 'ALL' || type === 'auto' || !type) {
          // Auto-detect if it's an email
          if (term.includes('@')) {
            searchType = 'email'
          }
        }
        
        // Call LeakCheck API directly - format: /api/v2/query/{query}
        let leakCheckUrl = `https://leakcheck.io/api/v2/query/${encodeURIComponent(term.trim())}`
        
        // Add type parameter if needed
        if (searchType && searchType !== 'auto' && searchType !== 'ALL') {
          // Map our types to LeakCheck types
          const typeMap: Record<string, string> = {
            'EMAIL': 'email',
            'email': 'email',
            'USERNAME': 'username',
            'username': 'username',
            'NAME': 'keyword',  // LeakCheck uses 'keyword' for name searches
            'name': 'keyword',
            'IP': 'ip',
            'ip': 'ip',
            'DOMAIN': 'domain',
            'domain': 'domain',
            'phone': 'phone',
            'PHONE': 'phone'
          }
          const leakCheckType = typeMap[searchType] || 'auto'
          leakCheckUrl += `?type=${leakCheckType}`
          console.log('Using LeakCheck type:', leakCheckType)
        } else if (term.includes('@')) {
          // Explicitly set email type for email addresses
          leakCheckUrl += '?type=email'
          console.log('Auto-detected email type')
        }

        console.log('LeakCheck API URL:', leakCheckUrl)
        
        const leakCheckResponse = await fetch(leakCheckUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-API-Key': apiKey,
          },
        })

        if (leakCheckResponse.ok) {
          const rawBreachResults = await leakCheckResponse.json()
          // Apply redaction to LeakCheck results
          breachResults = redactLeakCheckResult(rawBreachResults, accountType)
          console.log('LeakCheck API returned:', breachResults?.found || 0, 'results')
        } else {
          const errorText = await leakCheckResponse.text()
          console.error('LeakCheck API error:', leakCheckResponse.status, errorText)
          // Return error information
          breachResults = {
            success: false,
            found: 0,
            quota: 0,
            result: [],
            error: `LeakCheck API error: ${leakCheckResponse.status}`
          }
        }
      } else if (!apiKey) {
        console.log('LeakCheck API key not configured')
        // Return a message about missing API key
        breachResults = {
          success: false,
          found: 0,
          quota: 0,
          result: [],
          error: 'LeakCheck API key not configured'
        }
      }
    } catch (error) {
      console.error('Error calling LeakCheck API:', error)
      // Continue without breach results if API fails
    }

    // Build response with redacted data
    const response = {
      results: redactedResults,
      profileResults: profileResults,
      profileCookies: profileCookies,
      breachResults: breachResults,
      pagination: result.pagination,
      profilePagination: profilePagination,
      cookiePagination: cookiePagination,
      aggregations: result.aggregations,
      profilesEnabled,
      cookiesEnabled,
    }

    // Add redaction notice to response if applicable
    const finalResponse = addRedactionNotice(response, accountType)

    return NextResponse.json(finalResponse)
  } catch (error) {
    console.error('Error searching data:', error)
    return NextResponse.json({
      results: [],
      profileResults: [],
      profileCookies: [],
      breachResults: null,
      pagination: {
        total: 0,
        pages: 0,
        current: 1,
      },
      profilePagination: {
        total: 0,
        pages: 0,
        current: 1,
      },
      cookiePagination: {
        total: 0,
        pages: 0,
        current: 1,
      },
      aggregations: {
        sources: [],
        totalRecords: 0,
      },
      profilesEnabled: false,
      cookiesEnabled: false,
    }, { status: 500 })
  }
}

// Export the protected route with feature checks
export const POST = protectedRoute(handleSearch, {
  feature: Feature.SEARCH,
  checkLimit: 'lookups',
  incrementUsage: 'lookups',
})