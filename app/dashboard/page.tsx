'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database, Users, Search, Activity, Shield } from 'lucide-react'
import Link from 'next/link'

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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/dashboard/search">
          <Button>
            <Search className="w-4 h-4 mr-2" />
            Search Data
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRecords.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Leaked Databases + Infostealer Data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSources}</div>
            <p className="text-xs text-muted-foreground">
              Across all Databases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.last24hActivity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Records added in last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breach Search Status */}
      {breachSearchEnabled && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Shield className="w-5 h-5" />
              Breach Search API Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">
              Data breach search functionality is enabled and available to users.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Records
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              LIVE
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent records found
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record, index) => (
                <div
                  key={`${record.id}_${index}_${record.timestamp}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <div className="font-mono text-sm">
                      <span className="text-xs text-gray-500 block">VICTIM ID</span>
                      <span className="font-semibold text-primary truncate block">{record.id}</span>
                    </div>
                    <div className="font-mono text-sm">
                      <span className="text-xs text-gray-500 block">EMAIL/USERNAME</span>
                      <span className="font-semibold truncate block max-w-[200px]" title={record.email || record.username || 'N/A'}>
                        {record.email || record.username || 'N/A'}
                      </span>
                    </div>
                    <div className="font-mono text-sm">
                      <span className="text-xs text-gray-500 block">DOMAIN</span>
                      <span className="font-semibold truncate block max-w-[200px]" title={record.domain || 'N/A'}>
                        {record.domain || 'N/A'}
                      </span>
                    </div>
                    <div className="font-mono text-sm text-right">
                      <span className="text-xs text-gray-500 block">DATE</span>
                      <span className="font-semibold text-gray-700">
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
  )
}
