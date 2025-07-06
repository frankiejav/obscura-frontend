'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database, Users, Search, Activity, TrendingUp, Clock, Shield } from 'lucide-react'
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
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch breach databases data
      const breachResponse = await fetch('/api/leaked-databases')
      if (breachResponse.ok) {
        const breachData = await breachResponse.json()
        setBreachData(breachData)
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
          totalRecords: breachData?.totalCount || totalRecords,
          totalSources: breachData?.totalDatabases || dataSources.length,
          activeSources,
        })
      }

      // Fetch recent records
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
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ERROR':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
              {breachData ? `${(breachData.totalCount / 1000000000).toFixed(1)}B+` : stats.totalRecords.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {breachData ? 'Across all databases' : 'Across all data sources'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{breachData?.totalDatabases || stats.totalSources}</div>
            <p className="text-xs text-muted-foreground">
              {breachData ? 'Active sources' : `${stats.activeSources} active sources`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{breachData?.recentDatabases.length || recentRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              {breachData ? 'Recent breach databases' : 'Records added recently'}
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

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            {breachData ? 'Top Breach Databases' : 'Data Sources'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {breachData ? (
            breachData.topDatabases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No databases found
              </div>
            ) : (
              <div className="space-y-4">
                {breachData.topDatabases.map((database) => (
                  <div
                    key={database.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{database.name}</h3>
                        <Badge variant="destructive">
                          {database.breach_date ? `Breached ${database.breach_date}` : 'Unknown Date'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {database.count.toLocaleString()} records
                        </span>
                        {database.breach_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {database.breach_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            dataSources.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No data sources found
              </div>
            ) : (
              <div className="space-y-4">
                {dataSources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{source.name}</h3>
                        <Badge className={getStatusColor(source.status)}>
                          {source.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {source.recordCount.toLocaleString()} records
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(source.lastUpdated)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {breachData ? 'Recent Breach Databases' : 'Recent Records'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {breachData ? (
            breachData.recentDatabases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent breach databases found
              </div>
            ) : (
              <div className="space-y-4">
                {breachData.recentDatabases.map((database) => (
                  <div
                    key={database.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{database.name}</h3>
                        <Badge variant="destructive">
                          {database.breach_date ? `Breached ${database.breach_date}` : 'Unknown Date'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {database.count.toLocaleString()} records
                        </span>
                        {database.breach_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {database.breach_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            recentRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent records found
              </div>
            ) : (
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {record.name || record.email || record.ip || 'Unknown'}
                        </h3>
                        <Badge variant="secondary">{record.source}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-1">
                        {record.name && (
                          <span>Name: {record.name}</span>
                        )}
                        {record.email && (
                          <span>Email: {record.email}</span>
                        )}
                        {record.ip && (
                          <span>IP: {record.ip}</span>
                        )}
                        {record.domain && (
                          <span>Domain: {record.domain}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {formatDate(record.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}
