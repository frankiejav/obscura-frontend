'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Calendar, Database, User, Mail, Globe, Hash, Shield, AlertTriangle, ChevronLeft, ChevronRight, Key } from 'lucide-react'

interface DataRecord {
  id: string
  name?: string
  email?: string
  username?: string
  password?: string
  ip?: string
  domain?: string
  source: string
  timestamp: string
  additionalData?: any
}

interface SearchResult {
  results: DataRecord[]
  profileResults?: DataRecord[]
  pagination: {
    total: number
    pages: number
    current: number
  }
  profilesEnabled?: boolean
}

interface BreachResult {
  email: string
  source: {
    name: string
    breach_date?: string
    unverified: number
    passwordless: number
    compilation: number
  }
  first_name?: string
  last_name?: string
  username?: string
  password?: string
  name?: string
  dob?: string
  address?: string
  zip?: string
  phone?: string
  ssn?: string
  city?: string
  state?: string
  country?: string
  gender?: string
  ip?: string
  domain?: string
  origin?: string
  fields: string[]
}

interface BreachSearchResult {
  success: boolean
  found: number
  quota: number
  result: BreachResult[]
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('auto')
  const [profilesEnabled, setProfilesEnabled] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Breach search state
  const [breachResults, setBreachResults] = useState<BreachSearchResult | null>(null)
  const [breachLoading, setBreachLoading] = useState(false)
  const [breachSearchEnabled, setBreachSearchEnabled] = useState(false)
  
  // Pagination state for breach results
  const [breachCurrentPage, setBreachCurrentPage] = useState(1)
  const [breachResultsPerPage] = useState(10)

  // Check breach search status
  useEffect(() => {
    checkBreachSearchStatus()
  }, [])

  // Check breach search status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkBreachSearchStatus()
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const checkBreachSearchStatus = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
              if (data.databaseSearch) {
        setBreachSearchEnabled(data.databaseSearch.enabled)
      }
      }
    } catch (error) {
      console.error('Error checking breach search status:', error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setBreachLoading(true)
    setResults(null)
    setBreachResults(null)
    setCurrentPage(1)
    setBreachCurrentPage(1)

    try {
      // Search internal data
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
                                     body: JSON.stringify({
             term: searchTerm,
             type: searchType === 'auto' ? 'ALL' : searchType,
             page: currentPage,
             limit: 10,
             profilesEnabled: profilesEnabled,
           }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }

      // Search breach data if enabled
      if (breachSearchEnabled) {
        const breachResponse = await fetch('/api/database-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchTerm,
            type: searchType,
          }),
        })

        if (breachResponse.ok) {
          const data = await breachResponse.json()
          setBreachResults(data)
        }
      }
    } catch (error) {
      console.error('Search failed:', error)
      setBreachResults({
        success: false,
        found: 0,
        quota: 0,
        result: [],
      })
    } finally {
      setLoading(false)
      setBreachLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Trigger search with current parameters
    if (searchTerm.trim()) {
      // Re-run search with new page
      setLoading(true)
      fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: searchTerm,
          type: searchType === 'auto' ? 'ALL' : searchType,
          page: page,
          limit: 10,
          profilesEnabled: profilesEnabled,
        }),
      })
      .then(response => response.json())
      .then(data => setResults(data))
      .catch(error => console.error('Search failed:', error))
      .finally(() => setLoading(false))
    }
  }

  const handleBreachPageChange = (page: number) => {
    setBreachCurrentPage(page)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(e as any)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getSearchTypeIcon = (type: string) => {
    switch (type) {
      case 'NAME':
        return <User className="w-4 h-4" />
      case 'EMAIL':
        return <Mail className="w-4 h-4" />
      case 'IP':
        return <Hash className="w-4 h-4" />
      case 'DOMAIN':
        return <Globe className="w-4 h-4" />
      case 'SOURCE':
        return <Database className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  // Calculate paginated breach results
  const getPaginatedBreachResults = () => {
    if (!breachResults?.result) return []
    const startIndex = (breachCurrentPage - 1) * breachResultsPerPage
    const endIndex = startIndex + breachResultsPerPage
    return breachResults.result.slice(startIndex, endIndex)
  }

  const totalBreachPages = breachResults ? Math.ceil(breachResults.result.length / breachResultsPerPage) : 0
  const totalResults = (results?.pagination.total || 0) + (breachResults?.found || 0) + (results?.profileResults?.length || 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Data Search</h1>
        <Badge variant="secondary">
          {totalResults} total records found
        </Badge>
      </div>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Term</label>
              <Input
                placeholder="Enter search term..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Type</label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="username">Username</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Profiles</label>
              <div className="flex items-center space-x-2 h-10">
                <Switch
                  checked={profilesEnabled}
                  onCheckedChange={setProfilesEnabled}
                  id="profiles-toggle"
                />
                <label htmlFor="profiles-toggle" className="text-sm">
                  {profilesEnabled ? 'ON' : 'OFF'}
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleSearch} disabled={loading || breachLoading} className="px-8">
              {loading || breachLoading ? 'Searching...' : 'Search All Sources'}
            </Button>
          </div>

          {breachSearchEnabled && breachResults?.quota && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {breachResults.quota} queries remaining
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {(results || breachResults) && (
        <div className="space-y-6">
          {/* Internal Data Results */}
          {results && results.results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Internal Data Results
                  <Badge variant="outline">
                    {results.pagination.total} results
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.results.map((record) => (
                    <Card key={record.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            {getSearchTypeIcon(searchType)}
                            <h3 className="font-semibold break-words">
                              {record.name || record.email || record.ip || 'Unknown'}
                            </h3>
                            <Badge variant="secondary" className="flex-shrink-0">{record.source}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm">
                            {record.name && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Name</span>
                                <span className="break-words">{record.name}</span>
                              </div>
                            )}
                            {record.email && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Email</span>
                                <span className="break-words">{record.email}</span>
                              </div>
                            )}
                            {record.username && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Username</span>
                                <span className="break-words">{record.username}</span>
                              </div>
                            )}
                            {record.password && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground flex items-center gap-1">
                                  <Key className="w-3 h-3" />
                                  Password
                                </span>
                                <span className="break-words font-mono text-red-600">{record.password}</span>
                              </div>
                            )}
                            {record.ip && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">IP Address</span>
                                <span className="break-words">{record.ip}</span>
                              </div>
                            )}
                            {record.domain && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Domain</span>
                                <span className="break-words">{record.domain}</span>
                              </div>
                            )}
                          </div>

                          {record.additionalData && (
                            <div className="mt-3">
                              <span className="font-medium text-sm">Additional Data:</span>
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto max-w-full">
                                {JSON.stringify(record.additionalData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right text-sm text-gray-500 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(record.timestamp)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Pagination */}
                  {results.pagination.pages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(Math.max(1, results.pagination.current - 1))}
                          disabled={results.pagination.current === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, results.pagination.pages) }, (_, i) => {
                            const page = i + 1
                            return (
                              <Button
                                key={page}
                                variant={page === results.pagination.current ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            )
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(Math.min(results.pagination.pages, results.pagination.current + 1))}
                          disabled={results.pagination.current === results.pagination.pages}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Results */}
          {results?.profileResults && results.profileResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Credentials
                  <Badge variant="outline">
                    {results.profileResults.length} credentials found
                  </Badge>
                  <Badge variant="secondary">
                    {[...new Set(results.profileResults.map(r => r.id))].length} profiles
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Group by victim ID */}
                  {Object.entries(
                    results.profileResults.reduce((groups: Record<string, DataRecord[]>, record) => {
                      if (!groups[record.id]) groups[record.id] = []
                      groups[record.id].push(record)
                      return groups
                    }, {})
                  ).map(([victimId, profileRecords]) => (
                    <Card key={victimId} className="p-4 border-l-4 border-l-blue-500">
                      <div className="mb-3">
                        <h4 className="font-semibold text-sm text-blue-600">Profile: {victimId}</h4>
                        <Badge variant="outline" className="text-xs">
                          {profileRecords.length} credentials
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {profileRecords.map((record, index) => (
                          <div key={`${record.id}-${index}`} className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <Globe className="w-4 h-4" />
                              <span className="font-medium">{record.domain}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                              {record.email && (
                                <div className="flex flex-col">
                                  <span className="font-medium text-xs text-muted-foreground">Email</span>
                                  <span className="break-words">{record.email}</span>
                                </div>
                              )}
                              {record.username && (
                                <div className="flex flex-col">
                                  <span className="font-medium text-xs text-muted-foreground">Username</span>
                                  <span className="break-words">{record.username}</span>
                                </div>
                              )}
                              {record.password && (
                                <div className="flex flex-col">
                                  <span className="font-medium text-xs text-muted-foreground flex items-center gap-1">
                                    <Key className="w-3 h-3" />
                                    Password
                                  </span>
                                  <span className="break-words font-mono text-red-600">{record.password}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Breach Results */}
          {breachResults && breachResults.result.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Data Breach Results
                  <Badge variant="destructive">
                    {breachResults.found} breaches found
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getPaginatedBreachResults().map((breach, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            {getSearchTypeIcon(searchType)}
                            <h3 className="font-semibold break-words">{breach.email}</h3>
                            <Badge variant="secondary" className="flex-shrink-0">{breach.source.name}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm">
                            {breach.first_name && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">First Name</span>
                                <span className="break-words">{breach.first_name}</span>
                              </div>
                            )}
                            {breach.last_name && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Last Name</span>
                                <span className="break-words">{breach.last_name}</span>
                              </div>
                            )}
                            {breach.username && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Username</span>
                                <span className="break-words">{breach.username}</span>
                              </div>
                            )}
                            {breach.password && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Password</span>
                                <span className="break-words">{breach.password}</span>
                              </div>
                            )}
                            {breach.name && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Name</span>
                                <span className="break-words">{breach.name}</span>
                              </div>
                            )}
                            {breach.dob && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Date of Birth</span>
                                <span className="break-words">{breach.dob}</span>
                              </div>
                            )}
                            {breach.address && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Address</span>
                                <span className="break-words">{breach.address}</span>
                              </div>
                            )}
                            {breach.city && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">City</span>
                                <span className="break-words">{breach.city}</span>
                              </div>
                            )}
                            {breach.state && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">State</span>
                                <span className="break-words">{breach.state}</span>
                              </div>
                            )}
                            {breach.zip && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">ZIP</span>
                                <span className="break-words">{breach.zip}</span>
                              </div>
                            )}
                            {breach.country && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Country</span>
                                <span className="break-words">{breach.country}</span>
                              </div>
                            )}
                            {breach.phone && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Phone</span>
                                <span className="break-words">{breach.phone}</span>
                              </div>
                            )}
                            {breach.ssn && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">SSN</span>
                                <span className="break-words">{breach.ssn}</span>
                              </div>
                            )}
                            {breach.gender && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Gender</span>
                                <span className="break-words">{breach.gender}</span>
                              </div>
                            )}
                            {breach.ip && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">IP</span>
                                <span className="break-words">{breach.ip}</span>
                              </div>
                            )}
                            {breach.domain && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Domain</span>
                                <span className="break-words">{breach.domain}</span>
                              </div>
                            )}
                            {breach.origin && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Origin</span>
                                <span className="break-words">{breach.origin}</span>
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium text-xs text-muted-foreground">Available Fields</span>
                              <span className="break-words">{breach.fields.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right text-sm text-gray-500 flex-shrink-0">
                          {breach.source.breach_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {breach.source.breach_date}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Breach Results Pagination */}
                  {totalBreachPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBreachPageChange(Math.max(1, breachCurrentPage - 1))}
                          disabled={breachCurrentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, totalBreachPages) }, (_, i) => {
                            const page = i + 1
                            return (
                              <Button
                                key={page}
                                variant={page === breachCurrentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleBreachPageChange(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            )
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBreachPageChange(Math.min(totalBreachPages, breachCurrentPage + 1))}
                          disabled={breachCurrentPage === totalBreachPages}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results Message */}
          {((results && results.results.length === 0) || (breachResults && breachResults.result.length === 0)) && 
           (!results || results.results.length === 0) && (!breachResults || breachResults.result.length === 0) && (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                No results found in any data source
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
