'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Calendar, Database, User, Mail, Globe, Hash, Shield, AlertTriangle } from 'lucide-react'

interface DataRecord {
  id: string
  name?: string
  email?: string
  ip?: string
  domain?: string
  source: string
  timestamp: string
  additionalData?: any
}

interface SearchResult {
  results: DataRecord[]
  pagination: {
    total: number
    pages: number
    current: number
  }
}

interface LeakCheckResult {
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
  fields: string[]
}

interface LeakCheckSearchResult {
  success: boolean
  found: number
  quota: number
  result: LeakCheckResult[]
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('ALL')
  const [source, setSource] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [sources, setSources] = useState<string[]>([])

  // LeakCheck state
  const [leakCheckType, setLeakCheckType] = useState('auto')
  const [leakCheckResults, setLeakCheckResults] = useState<LeakCheckSearchResult | null>(null)
  const [leakCheckLoading, setLeakCheckLoading] = useState(false)
  const [leakCheckEnabled, setLeakCheckEnabled] = useState(false)

  // Fetch available sources and check LeakCheck status
  useEffect(() => {
    fetchSources()
    checkLeakCheckStatus()
  }, [])

  // Check LeakCheck status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkLeakCheckStatus()
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/data-sources')
      if (response.ok) {
        const data = await response.json()
        const sourceNames = data.map((ds: any) => ds.name)
        setSources(sourceNames)
      }
    } catch (error) {
      console.error('Error fetching sources:', error)
    }
  }

  const checkLeakCheckStatus = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.leakCheck) {
          setLeakCheckEnabled(data.leakCheck.enabled)
        }
      }
    } catch (error) {
      console.error('Error checking LeakCheck status:', error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setLeakCheckLoading(true)
    setResults(null)
    setLeakCheckResults(null)

    try {
      // Search internal data
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          term: searchTerm,
          type: searchType,
          page: currentPage,
          limit: 10,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }

      // Search LeakCheck if enabled
      if (leakCheckEnabled) {
        const leakCheckResponse = await fetch('/api/leakcheck', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchTerm,
          }),
        })

        if (leakCheckResponse.ok) {
          const data = await leakCheckResponse.json()
          setLeakCheckResults(data)
        }
      }
    } catch (error) {
      console.error('Search failed:', error)
      setLeakCheckResults({
        success: false,
        found: 0,
        quota: 0,
        result: [],
      })
    } finally {
      setLoading(false)
      setLeakCheckLoading(false)
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
          type: searchType,
          page: page,
          limit: 10,
        }),
      })
      .then(response => response.json())
      .then(data => setResults(data))
      .catch(error => console.error('Search failed:', error))
      .finally(() => setLoading(false))
    }
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

  const totalResults = (results?.pagination.total || 0) + (leakCheckResults?.found || 0)

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <SelectItem value="ALL">All Fields</SelectItem>
                  <SelectItem value="NAME">Name</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="IP">IP Address</SelectItem>
                  <SelectItem value="DOMAIN">Domain</SelectItem>
                  <SelectItem value="SOURCE">Source</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Source</label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {sources.map((sourceName) => (
                    <SelectItem key={sourceName} value={sourceName}>
                      {sourceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {leakCheckEnabled && (
              <div className="space-y-2">
                <label className="text-sm font-medium">LeakCheck Type</label>
                <Select value={leakCheckType} onValueChange={setLeakCheckType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Detect</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="hash">Hash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="To"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button onClick={handleSearch} disabled={loading || leakCheckLoading} className="w-full">
                {loading || leakCheckLoading ? 'Searching...' : 'Search All Sources'}
              </Button>
            </div>
          </div>

          {leakCheckEnabled && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>LeakCheck API is enabled and will be searched automatically</span>
              {leakCheckResults?.quota && (
                <Badge variant="outline">
                  {leakCheckResults.quota} queries remaining
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {(results || leakCheckResults) && (
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
                    <Card key={record.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {getSearchTypeIcon(searchType)}
                            <h3 className="font-semibold">
                              {record.name || record.email || record.ip || 'Unknown'}
                            </h3>
                            <Badge variant="secondary">{record.source}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            {record.name && (
                              <div>
                                <span className="font-medium">Name:</span> {record.name}
                              </div>
                            )}
                            {record.email && (
                              <div>
                                <span className="font-medium">Email:</span> {record.email}
                              </div>
                            )}
                            {record.ip && (
                              <div>
                                <span className="font-medium">IP:</span> {record.ip}
                              </div>
                            )}
                            {record.domain && (
                              <div>
                                <span className="font-medium">Domain:</span> {record.domain}
                              </div>
                            )}
                          </div>

                          {record.additionalData && (
                            <div className="mt-2">
                              <span className="font-medium text-sm">Additional Data:</span>
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(record.additionalData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right text-sm text-gray-500">
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
                      <div className="flex gap-2">
                        {Array.from({ length: results.pagination.pages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={page === results.pagination.current ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* LeakCheck Results */}
          {leakCheckResults && leakCheckResults.result.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Data Breach Results
                  <Badge variant="destructive">
                    {leakCheckResults.found} breaches found
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leakCheckResults.result.map((breach, index) => (
                    <Card key={index} className="p-4 border-orange-200 bg-orange-50">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-orange-600" />
                            <h3 className="font-semibold">{breach.email}</h3>
                            <Badge variant="destructive">{breach.source.name}</Badge>
                          </div>
                          {breach.source.breach_date && (
                            <span className="text-sm text-gray-500">
                              {breach.source.breach_date}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {breach.first_name && (
                            <div>
                              <span className="font-medium">First Name:</span> {breach.first_name}
                            </div>
                          )}
                          {breach.last_name && (
                            <div>
                              <span className="font-medium">Last Name:</span> {breach.last_name}
                            </div>
                          )}
                          {breach.username && (
                            <div>
                              <span className="font-medium">Username:</span> {breach.username}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Fields:</span> {breach.fields.join(', ')}
                          </div>
                        </div>

                        <div className="flex gap-2 text-xs">
                          {breach.source.unverified > 0 && (
                            <Badge variant="secondary">Unverified: {breach.source.unverified}</Badge>
                          )}
                          {breach.source.passwordless > 0 && (
                            <Badge variant="secondary">Passwordless: {breach.source.passwordless}</Badge>
                          )}
                          {breach.source.compilation > 0 && (
                            <Badge variant="secondary">Compilation: {breach.source.compilation}</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results Message */}
          {((results && results.results.length === 0) || (leakCheckResults && leakCheckResults.result.length === 0)) && 
           (!results || results.results.length === 0) && (!leakCheckResults || leakCheckResults.result.length === 0) && (
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
