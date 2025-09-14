'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Activity, TrendingUp, Globe, Search, Zap, Shield } from 'lucide-react'

interface DataSource {
  id: string
  name: string
  recordCount: number
  lastUpdated: string
  status: string
}

interface DataRecord {
  id: string
  name?: string
  email?: string
  username?: string
  ip?: string
  domain?: string
  source: string
  timestamp: string
}

interface BreachDatabase {
  id: number
  name: string
  count: number
  breach_date: string | null
  unverified: number
  passwordless: number
  compilation: number
}

export default function DashboardPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [recentRecords, setRecentRecords] = useState<DataRecord[]>([])
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalSources: 0,
    activeSources: 0,
    last24hActivity: 0,
  })
  const [loading, setLoading] = useState(true)
  const [breachSearchEnabled, setBreachSearchEnabled] = useState(false)
  const [breachData, setBreachData] = useState<{
    totalCount: number
    totalDatabases: number
    recentDatabases: BreachDatabase[]
    topDatabases: BreachDatabase[]
  } | null>(null)

  useEffect(() => {
    fetchDashboardData()
    
    // Set up auto-refresh for recent records every 30 seconds
    const interval = setInterval(() => {
      fetchRecentRecords()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchRecentRecords = async () => {
    try {
      // Fetch the latest 10 records
      const recentResponse = await fetch('/api/data-records?first=10')
      if (recentResponse.ok) {
        const data = await recentResponse.json()
        if (data.edges) {
          setRecentRecords(
            data.edges.map((edge: any) => edge.node)
          )
        }
      }
    } catch (error) {
      console.error('Error fetching recent records:', error)
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      let dashboardStats: any = null
      
      // Fetch dashboard stats (includes LeakCheck + ClickHouse data)
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        dashboardStats = await statsResponse.json()
        
        // Set breach data from LeakCheck stats
        setBreachData({
          totalCount: dashboardStats.totalRecords,
          totalDatabases: dashboardStats.totalSources,
          recentDatabases: [],
          topDatabases: []
        })
      }

      // Fetch data sources
      const sourcesResponse = await fetch('/api/data-sources')
      if (sourcesResponse.ok) {
        const dataSources = await sourcesResponse.json()
        setDataSources(dataSources)
        const totalRecords = dataSources.reduce(
          (sum: number, ds: DataSource) => sum + ds.recordCount,
          0
        )
        const activeSources = dataSources.filter(
          (ds: DataSource) => ds.status === 'ACTIVE'
        ).length

        setStats({
          totalRecords: dashboardStats?.totalRecords || totalRecords,
          totalSources: dashboardStats?.totalSources || dataSources.length,
          activeSources,
          last24hActivity: dashboardStats?.last24hActivity || 0,
        })
      }

      // Fetch recent records
      await fetchRecentRecords()
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      // Handle the specific format "YYYY-MM-DD HH:mm:ss" by adding UTC timezone
      let date: Date
      if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        // Assume UTC timezone for this format
        date = new Date(dateString + ' UTC')
      } else {
        date = new Date(dateString)
      }
      
      const now = new Date()
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString // Return original string if invalid
      }
      
      const diffInMs = now.getTime() - date.getTime()
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      
      // Handle future dates or very recent dates
      if (diffInMinutes < 0) {
        return 'just now'
      } else if (diffInMinutes < 1) {
        return 'just now'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`
      } else {
        return date.toLocaleDateString()
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString // Return original string on error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-white/30 rounded-full animate-spin animation-delay-150 mx-auto"></div>
              </div>
              <p className="mt-4 text-white/60 text-sm tracking-wide">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-neutral-400 mt-1">Real-time threat intelligence overview</p>
          </div>
          <Link href="/dashboard/search">
            <Button 
              size="lg"
              className="group bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-500"
            >
              <Search className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Search Database
            </Button>
          </Link>
        </div>

        {/* Statistics Cards with Glow Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative bg-neutral-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-300">Total Records</CardTitle>
                <div className="p-2 bg-white/10 rounded-lg">
                  <Database className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.totalRecords.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <p className="text-xs text-neutral-400">
                    Leaked Databases + Stealer Logs
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative bg-neutral-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-300">Data Sources</CardTitle>
                <div className="p-2 bg-white/10 rounded-lg">
                  <Globe className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.totalSources}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-neutral-400">
                    {stats.activeSources} Active Sources
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative bg-neutral-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-300">Recent Activity</CardTitle>
                <div className="p-2 bg-white/10 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.last24hActivity.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  <p className="text-xs text-neutral-400">
                    Records in last 7 days
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative bg-neutral-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-300">API Status</CardTitle>
                <div className="p-2 bg-white/10 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  Active
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-neutral-400">
                    All systems operational
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Breach Search Status - Enhanced */}
        {breachSearchEnabled && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl"></div>
            <Card className="relative bg-neutral-900/60 backdrop-blur-sm border-green-500/30 hover:border-green-500/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  Breach Search API Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-300">
                  Data breach search functionality is enabled and available to users.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Records - Enhanced with Apple-like design */}
        <Card className="bg-neutral-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl text-white">Recent Records</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Live</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentRecords.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl mb-4">
                  <Database className="w-8 h-8 text-white/40" />
                </div>
                <p className="text-neutral-400">No recent records found</p>
                <p className="text-sm text-neutral-500 mt-1">Data will appear here as it's processed</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentRecords.map((record, index) => (
                  <div
                    key={`${record.id}_${index}_${record.timestamp}`}
                    className="group px-6 py-4 hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Victim ID</span>
                        <span className="font-mono text-sm text-white font-medium truncate block">
                          {record.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Identity</span>
                        <span className="font-mono text-sm text-white truncate block" title={record.email || record.username || 'N/A'}>
                          {record.email || record.username || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Domain</span>
                        <span className="font-mono text-sm text-white truncate block" title={record.domain || 'N/A'}>
                          {record.domain || 'N/A'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Timestamp</span>
                        <span className="font-mono text-sm text-neutral-300">
                          {formatDate(record.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}