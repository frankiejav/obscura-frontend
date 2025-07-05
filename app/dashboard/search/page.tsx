'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const [leakCheckQuery, setLeakCheckQuery] = useState('')
  const [leakCheckType, setLeakCheckType] = useState('auto')
  const [leakCheckResults, setLeakCheckResults] = useState<LeakCheckSearchResult | null>(null)
  const [leakCheckLoading, setLeakCheckLoading] = useState(false)
  const [leakCheckEnabled, setLeakCheckEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState('internal')

  // Fetch available sources and check LeakCheck status
  useEffect(() => {
    fetchSources()
    checkLeakCheckStatus()
  }, [])

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              dataSources {
                id
                name
                recordCount
                lastUpdated
                status
              }
            }
          `,
        }),
      })

      const data = await response.json()
      if (data.data?.dataSources) {
        const sourceNames = data.data.dataSources.map((ds: any) => ds.name)
        setSources(sourceNames)
      }
    } catch (error) {
      console.error('Error fetching sources:', error)
    }
  }

  const checkLeakCheckStatus = async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              settings {
                leakCheck {
                  enabled
                  quota
                }
              }
            }
          `,
        }),
      })

      const data = await response.json()
      if (data.data?.settings?.leakCheck) {
        setLeakCheckEnabled(data.data.settings.leakCheck.enabled)
      }
    } catch (error) {
      console.error('Error checking LeakCheck status:', error)
    }
  }

  const performSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query Search($term: String!, $type: String!, $page: Int!, $limit: Int!, $source: String, $fromDate: String, $toDate: String) {
              search(term: $term, type: $type, page: $page, limit: $limit, source: $source, fromDate: $fromDate, toDate: $toDate) {
                results {
                  id
                  name
                  email
                  ip
                  domain
                  source
                  timestamp
                  additionalData
                }
                pagination {
                  total
                  pages
                  current
                }
              }
            }
          `,
          variables: {
            term: searchTerm,
            type: searchType,
            page: currentPage,
            limit: 20,
            source: source === 'all' ? undefined : source || undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          },
        }),
      })

      const data = await response.json()
      if (data.data?.search) {
        setResults(data.data.search)
      }
    } catch (error) {
      console.error('Error performing search:', error)
    } finally {
      setLoading(false)
    }
  }

  const performLeakCheckSearch = async () => {
    setLeakCheckLoading(true)
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query LeakCheckSearch($query: String!, $type: String) {
              leakCheckSearch(query: $query, type: $type) {
                success
                found
                quota
                result {
                  email
                  source {
                    name
                    breach_date
                    unverified
                    passwordless
                    compilation
                  }
                  first_name
                  last_name
                  username
                  fields
                }
              }
            }
          `,
          variables: {
            query: leakCheckQuery,
            type: leakCheckType,
          },
        }),
      })

      const data = await response.json()
      if (data.data?.leakCheckSearch) {
        setLeakCheckResults(data.data.leakCheckSearch)
      }
    } catch (error) {
      console.error('Error performing LeakCheck search:', error)
      setLeakCheckResults({
        success: false,
        found: 0,
        quota: 0,
        result: [],
      })
    } finally {
      setLeakCheckLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    performSearch()
  }

  const handleLeakCheckSearch = () => {
    performLeakCheckSearch()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    performSearch()
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Data Search</h1>
        <Badge variant="secondary">
          {results?.pagination.total || 0} total records
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="internal">Internal Data</TabsTrigger>
          <TabsTrigger value="leakcheck" disabled={!leakCheckEnabled}>
            LeakCheck {!leakCheckEnabled && <Badge variant="outline" className="ml-2">Disabled</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal">
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      placeholder="From"
                      className="w-full"
                    />
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      placeholder="To"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </CardContent>
          </Card>

          {/* Search Results */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Results
                  <Badge variant="outline">
                    {results.pagination.total} results
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.results.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No results found
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leakcheck">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                LeakCheck Data Breach Search
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Search for email addresses, usernames, and other data in known data breaches.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Query</label>
                  <Input
                    placeholder="Enter email, username, or other data..."
                    value={leakCheckQuery}
                    onChange={(e) => setLeakCheckQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLeakCheckSearch()}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Type</label>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">&nbsp;</label>
                  <Button 
                    onClick={handleLeakCheckSearch} 
                    disabled={leakCheckLoading || !leakCheckQuery.trim()}
                    className="w-full"
                  >
                    {leakCheckLoading ? 'Searching...' : 'Search Breaches'}
                  </Button>
                </div>
              </div>

              {leakCheckResults && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">
                        {leakCheckResults.success ? `${leakCheckResults.found} breaches found` : 'Search failed'}
                      </span>
                    </div>
                    {leakCheckResults.quota > 0 && (
                      <Badge variant="outline">
                        {leakCheckResults.quota} queries remaining
                      </Badge>
                    )}
                  </div>

                  {leakCheckResults.result.length > 0 && (
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
                  )}

                  {leakCheckResults.result.length === 0 && leakCheckResults.success && (
                    <div className="text-center py-8 text-gray-500">
                      No breaches found for this query
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
