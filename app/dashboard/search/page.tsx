'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Calendar, Database, User, Mail, Globe, Hash, Shield, AlertTriangle, ChevronLeft, ChevronRight, Key, Download, Sparkles } from 'lucide-react'
import Header from '@/components/navigation/header'

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
  additionalData?: any
}

interface CookieRecord {
  id: string
  domain: string
  cookie_name: string
  cookie_path: string
  cookie_value?: string
  cookie_value_length: number
  secure: boolean
  cookie_type: string
  risk_level: string
  browser_source: string
  hostname?: string
  ip?: string
  country?: string
  timestamp: string
}

interface SearchResult {
  results: DataRecord[]
  profileResults?: DataRecord[]
  profileCookies?: CookieRecord[]
  breachResults?: BreachSearchResult
  pagination: {
    total: number
    pages: number
    current: number
  }
  profilePagination?: {
    total: number
    pages: number
    current: number
  }
  cookiePagination?: {
    total: number
    pages: number
    current: number
  }
  profilesEnabled?: boolean
  cookiesEnabled?: boolean
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
  const [cookiesEnabled, setCookiesEnabled] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [profileCurrentPage, setProfileCurrentPage] = useState(1)
  const [cookieCurrentPage, setCookieCurrentPage] = useState(1)
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
    setProfileCurrentPage(1)
    setCookieCurrentPage(1)
    setBreachCurrentPage(1)

    try {
      // Search internal data (includes leak check API call)
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
          cookiesEnabled: cookiesEnabled,
          profilePage: profileCurrentPage,
          profileLimit: 10,
          cookiePage: cookieCurrentPage,
          cookieLimit: 10,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Search API response:', data)
        setResults(data)
        
        // Set breach results from the integrated response
        if (data.breachResults) {
          console.log('Breach results found:', data.breachResults.found, 'records')
          setBreachResults(data.breachResults)
        } else {
          console.log('No breach results in response')
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

  const handleSaveToJson = () => {
    const exportData = {
      searchTerm,
      searchType,
      timestamp: new Date().toISOString(),
      internalResults: results?.results || [],
      profileResults: results?.profileResults || [],
      profileCookies: results?.profileCookies || [],
      breachResults: breachResults?.result || [],
      totalResults,
      systemInfo: (() => {
        if (results?.profileResults) {
          const firstRecordWithSystemInfo = results.profileResults.find(r => 
            r.hostname || r.os_version || r.cpu_name || r.gpu || r.ram_size || r.hwid || r.language || r.timezone || r.ip
          );
          if (firstRecordWithSystemInfo) {
            return {
              ip: firstRecordWithSystemInfo.ip,
              hostname: firstRecordWithSystemInfo.hostname,
              os_version: firstRecordWithSystemInfo.os_version,
              cpu_name: firstRecordWithSystemInfo.cpu_name,
              gpu: firstRecordWithSystemInfo.gpu,
              ram_size: firstRecordWithSystemInfo.ram_size,
              hwid: firstRecordWithSystemInfo.hwid,
              language: firstRecordWithSystemInfo.language,
              timezone: firstRecordWithSystemInfo.timezone,
            }
          }
        }
        return null;
      })()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `search_results_${searchTerm}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Data Search</h1>
            <p className="text-neutral-400 mt-1">Query exposed credentials and session data</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <span className="text-sm font-medium text-white">
                {totalResults.toLocaleString()} records found
              </span>
            </div>
          {(results || breachResults) && totalResults > 0 && (
            <Button onClick={handleSaveToJson} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Save to JSON
            </Button>
          )}
        </div>
      </div>

        {/* Search Filters with Glow */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Card className="relative bg-neutral-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Search Term</label>
                <Input
                  placeholder="Enter search term..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-neutral-800/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-white/30 focus:bg-neutral-800/70 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Search Type</label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="bg-neutral-800/50 border-white/10 text-white focus:border-white/30">
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
                <label className="text-sm font-medium text-neutral-300">Profiles</label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch
                    checked={profilesEnabled}
                    onCheckedChange={setProfilesEnabled}
                    id="profiles-toggle"
                  />
                  <label htmlFor="profiles-toggle" className="text-sm text-neutral-400">
                    {profilesEnabled ? 'ON' : 'OFF'}
                  </label>
              </div>
            </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Cookies</label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch
                    checked={cookiesEnabled}
                    onCheckedChange={setCookiesEnabled}
                    disabled={!profilesEnabled}
                    id="cookies-toggle"
                  />
                  <label htmlFor="cookies-toggle" className="text-sm text-neutral-400">
                    {!profilesEnabled ? 'Enable Profiles first' : cookiesEnabled ? 'ON' : 'OFF'}
                  </label>
              </div>
            </div>
          </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleSearch} 
                disabled={loading || breachLoading} 
                className="px-8 bg-white text-black hover:bg-neutral-200 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading || breachLoading ? 'Searching...' : 'Search All Sources'}
              </Button>
            </div>

          {breachResults && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {breachResults.quota !== undefined && (
                <Badge variant="outline">
                  {breachResults.quota} queries remaining
                </Badge>
              )}
              {(breachResults as any).error && (
                <Badge variant="destructive">
                  {(breachResults as any).error}
                </Badge>
              )}
            </div>
          )}
            </CardContent>
          </Card>
        </div>

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
                  {results.results.map((record, index) => (
                    <Card key={`${record.id}_${index}_${Date.now()}`} className="p-4 hover:shadow-md transition-shadow">
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
                            {record.url && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">URL</span>
                                <span className="break-words">{record.url}</span>
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
                  {/* System Information Summary - Display Once */}
                  {(() => {
                    const firstRecordWithSystemInfo = results.profileResults.find(r => 
                      r.hostname || r.os_version || r.cpu_name || r.gpu || r.ram_size || r.hwid || r.language || r.timezone || r.ip
                    );
                    
                    if (firstRecordWithSystemInfo) {
                      return (
                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-4 h-4" />
                            <h3 className="font-semibold">System Information</h3>
                            <Badge variant="secondary" className="flex-shrink-0">System</Badge>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 text-sm">
                            {firstRecordWithSystemInfo.ip && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">IP Address</span>
                                <span className="break-words">{firstRecordWithSystemInfo.ip}</span>
                              </div>
                            )}
                            {firstRecordWithSystemInfo.hostname && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Hostname</span>
                                <span className="break-words">{firstRecordWithSystemInfo.hostname}</span>
                              </div>
                            )}
                            {firstRecordWithSystemInfo.os_version && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">OS Version</span>
                                <span className="break-words">{firstRecordWithSystemInfo.os_version}</span>
                              </div>
                            )}
                            {firstRecordWithSystemInfo.cpu_name && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">CPU</span>
                                <span className="break-words">{firstRecordWithSystemInfo.cpu_name}</span>
                              </div>
                            )}
                            {firstRecordWithSystemInfo.gpu && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">GPU</span>
                                <span className="break-words">{firstRecordWithSystemInfo.gpu}</span>
                              </div>
                            )}
                            {firstRecordWithSystemInfo.ram_size && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">RAM</span>
                                <span className="break-words">{firstRecordWithSystemInfo.ram_size}</span>
                              </div>
                            )}
                            {firstRecordWithSystemInfo.hwid && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">HWID</span>
                                <span className="break-words font-mono text-xs">{firstRecordWithSystemInfo.hwid}</span>
                              </div>
                            )}
                            {firstRecordWithSystemInfo.language && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Language</span>
                                <span className="break-words">{firstRecordWithSystemInfo.language}</span>
                              </div>
                            )}
                            {firstRecordWithSystemInfo.timezone && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Timezone</span>
                                <span className="break-words">{firstRecordWithSystemInfo.timezone}</span>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Profile Credentials Cards */}
                  {results.profileResults.map((record, index) => (
                    <Card key={`${record.id}-${index}`} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            {getSearchTypeIcon(searchType)}
                            <h3 className="font-semibold break-words">
                              {record.name || record.email || record.ip || 'Unknown'}
                            </h3>
                            <Badge variant="secondary" className="flex-shrink-0">{record.source}</Badge>
                            <Badge variant="outline" className="text-xs">
                              Profile: {record.id}
                            </Badge>
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
                            {record.url && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">URL</span>
                                <span className="break-words">{record.url}</span>
                              </div>
                            )}
                            {record.country && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Country</span>
                                <span className="break-words">{record.country}</span>
                              </div>
                            )}
                            {record.phone && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Phone</span>
                                <span className="break-words">{record.phone}</span>
                              </div>
                            )}
                            {record.address && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Address</span>
                                <span className="break-words">{record.address}</span>
                              </div>
                            )}
                            {record.origin && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Origin</span>
                                <span className="break-words">{record.origin}</span>
                              </div>
                            )}
                            {record.account_type && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Account Type</span>
                                <Badge variant={record.account_type === 'business' ? 'default' : 'secondary'} className="text-xs">
                                  {record.account_type}
                                </Badge>
                              </div>
                            )}
                            {record.risk_category && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Risk Level</span>
                                <Badge variant={record.risk_category === 'high' ? 'destructive' : record.risk_category === 'medium' ? 'default' : 'secondary'} className="text-xs">
                                  {record.risk_category} ({record.risk_score || 0})
                                </Badge>
                              </div>
                            )}
                            {record.is_privileged && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Privileged</span>
                                <Badge variant="destructive" className="text-xs">Yes</Badge>
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

                  {/* Profile Pagination */}
                  {results.profilePagination && results.profilePagination.pages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProfileCurrentPage(Math.max(1, profileCurrentPage - 1))}
                          disabled={profileCurrentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, results.profilePagination.pages) }, (_, i) => {
                            const page = i + 1
                            return (
                              <Button
                                key={page}
                                variant={page === profileCurrentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => setProfileCurrentPage(page)}
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
                          onClick={() => setProfileCurrentPage(Math.min(results.profilePagination!.pages, profileCurrentPage + 1))}
                          disabled={profileCurrentPage === results.profilePagination.pages}
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

          {/* Profile Cookies */}
          {results?.profileCookies && results.profileCookies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Profile Cookies
                  <Badge variant="outline">
                    {results.profileCookies.length} cookies found
                  </Badge>
                  <Badge variant="secondary">
                    {[...new Set(results.profileCookies.map(r => r.id))].length} profiles
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.profileCookies.map((record, index) => (
                    <Card key={`${record.id}-${index}`} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-4 h-4" />
                            <h3 className="font-semibold break-words">
                              {record.domain}
                            </h3>
                            <Badge variant="secondary" className="flex-shrink-0">{record.cookie_type}</Badge>
                            <Badge variant={record.risk_level === 'high' ? 'destructive' : record.risk_level === 'medium' ? 'default' : 'secondary'} className="text-xs">
                              {record.risk_level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Profile: {record.id}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium text-xs text-muted-foreground">Cookie Name</span>
                              <span className="break-words">{record.cookie_name}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-xs text-muted-foreground">Path</span>
                              <span className="break-words">{record.cookie_path}</span>
                            </div>
                            {record.cookie_value && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Value</span>
                                <span className="break-words font-mono text-xs">
                                  {record.cookie_value.length > 50 ? `${record.cookie_value.substring(0, 50)}...` : record.cookie_value}
                                </span>
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium text-xs text-muted-foreground">Size</span>
                              <span className="break-words">{record.cookie_value_length} bytes</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-xs text-muted-foreground">Browser</span>
                              <span className="break-words">{record.browser_source}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-xs text-muted-foreground">Secure</span>
                              <span className="break-words">{record.secure ? 'Yes' : 'No'}</span>
                            </div>
                            {record.hostname && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Hostname</span>
                                <span className="break-words">{record.hostname}</span>
                              </div>
                            )}
                            {record.country && (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs text-muted-foreground">Country</span>
                                <span className="break-words">{record.country}</span>
                              </div>
                            )}
                          </div>
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

                  {/* Cookie Pagination */}
                  {results.cookiePagination && results.cookiePagination.pages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCookieCurrentPage(Math.max(1, cookieCurrentPage - 1))}
                          disabled={cookieCurrentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, results.cookiePagination.pages) }, (_, i) => {
                            const page = i + 1
                            return (
                              <Button
                                key={page}
                                variant={page === cookieCurrentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCookieCurrentPage(page)}
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
                          onClick={() => setCookieCurrentPage(Math.min(results.cookiePagination!.pages, cookieCurrentPage + 1))}
                          disabled={cookieCurrentPage === results.cookiePagination.pages}
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
    </div>
  )
}
