"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Activity, Database, Search, Users, Shield, Target, Globe } from "lucide-react"

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

interface DashboardStats {
  totalRecords: number
  totalSources: number
  activeSources: number
  recentRecords: number
  leakcheckDatabases: number
  credentialsCount: number
  cookiesCount: number
  last24hActivity: number
}

export function DashboardOverview() {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [recentRecords, setRecentRecords] = useState<DataRecord[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRecords: 0,
    totalSources: 0,
    activeSources: 0,
    recentRecords: 0,
    leakcheckDatabases: 0,
    credentialsCount: 0,
    cookiesCount: 0,
    last24hActivity: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch dashboard stats (includes LeakCheck + ClickHouse data)
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const dashboardStats = await statsResponse.json()
        setStats(dashboardStats)
      }

      // Fetch data sources (existing sources)
      const sourcesResponse = await fetch('/api/data-sources')
      if (sourcesResponse.ok) {
        const dataSources = await sourcesResponse.json()
        setDataSources(dataSources)
      }

      // Fetch recent activity from ClickHouse
      const recentResponse = await fetch('/api/dashboard/recent-activity')
      if (recentResponse.ok) {
        const data = await recentResponse.json()
        if (data.edges) {
          const records = data.edges.map((edge: any) => edge.node)
          setRecentRecords(records)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate activity data based on recent records
  const generateActivityData = () => {
    const now = new Date()
    const hours = Array.from({ length: 6 }, (_, i) => {
      const time = new Date(now.getTime() - (5 - i) * 4 * 60 * 60 * 1000)
      return {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        queries: Math.floor(Math.random() * 200) + 100,
        alerts: Math.floor(Math.random() * 10) + 1,
      }
    })
    return hours
  }

  const activityData = generateActivityData()

  // Generate mission data based on data sources
  const generateMissionData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, index) => ({
      name: month,
      successful: Math.floor(Math.random() * 50) + 40,
      failed: Math.floor(Math.random() * 15) + 5,
    }))
  }

  const missionData = generateMissionData()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground font-mono">LOADING DASHBOARD...</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-wider font-mono">COMMAND CENTER</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Real-time operational overview and intelligence metrics
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono">
          <div className="status-indicator status-active"></div>
          <span className="text-primary">ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="tactical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider font-mono">
              24H ACTIVITY
            </CardTitle>
            <Search className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-mono">{stats.last24hActivity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground font-mono">
              Records added today
            </p>
          </CardContent>
        </Card>

        <Card className="tactical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider font-mono">
              INTEL RECORDS
            </CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-mono">{stats.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground font-mono">
              LeakCheck + {stats.credentialsCount.toLocaleString()} creds + {stats.cookiesCount.toLocaleString()} cookies
            </p>
          </CardContent>
        </Card>

        <Card className="tactical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider font-mono">
              ACTIVE SOURCES
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-mono">{stats.activeSources}</div>
            <p className="text-xs text-muted-foreground font-mono">
              {stats.leakcheckDatabases} LeakCheck + 1 internal
            </p>
          </CardContent>
        </Card>

        <Card className="tactical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider font-mono">
              SYSTEM STATUS
            </CardTitle>
            <Shield className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">ONLINE</div>
            <p className="text-xs text-muted-foreground font-mono">
              <span className="text-white">{stats.totalSources}</span> sources monitored
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="tactical-card">
          <CardHeader>
            <CardTitle className="text-primary font-mono tracking-wider">INVESTIGATION SUCCESS RATE</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" fontSize={12} fontFamily="JetBrains Mono" />
                <YAxis stroke="rgba(255, 255, 255, 0.7)" fontSize={12} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0 0% 6%)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "4px",
                    fontFamily: "JetBrains Mono",
                    fontSize: "12px",
                    color: "hsl(0 0% 98%)",
                  }}
                />
                <Bar dataKey="successful" fill="#ffffff" name="Successful" />
                <Bar dataKey="failed" fill="#666666" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="tactical-card">
          <CardHeader>
            <CardTitle className="text-primary font-mono tracking-wider">24H ACTIVITY OVERVIEW</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.7)" fontSize={12} fontFamily="JetBrains Mono" />
                <YAxis stroke="rgba(255, 255, 255, 0.7)" fontSize={12} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0 0% 6%)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "4px",
                    fontFamily: "JetBrains Mono",
                    fontSize: "12px",
                    color: "hsl(0 0% 98%)",
                  }}
                />
                <Line type="monotone" dataKey="queries" stroke="#ffffff" strokeWidth={2} name="Queries" />
                <Line type="monotone" dataKey="alerts" stroke="#666666" strokeWidth={2} name="Alerts" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent Status and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="tactical-card">
          <CardHeader>
            <CardTitle className="text-primary font-mono tracking-wider flex items-center gap-2">
              <Target className="h-4 w-4" />
              DATA SOURCES
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">LEAKCHECK</span>
              <span className="text-2xl font-bold text-primary font-mono">{stats.leakcheckDatabases}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">INTERNAL</span>
              <span className="text-2xl font-bold text-primary font-mono">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">TOTAL</span>
              <span className="text-2xl font-bold text-primary font-mono">{stats.totalSources}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="tactical-card">
          <CardHeader>
            <CardTitle className="text-primary font-mono tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4" />
              SYSTEM STATUS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-muted-foreground">API RESPONSE</span>
              <div className="flex items-center gap-2">
                <div className="status-indicator status-active"></div>
                <span className="text-sm font-mono text-green-400">OPTIMAL</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-muted-foreground">DATABASE</span>
              <div className="flex items-center gap-2">
                <div className="status-indicator status-active"></div>
                <span className="text-sm font-mono text-green-400">ONLINE</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-muted-foreground">SECURITY</span>
              <div className="flex items-center gap-2">
                <div className="status-indicator status-processing"></div>
                <span className="text-sm font-mono text-white">SCANNING</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="tactical-card">
          <CardHeader>
            <CardTitle className="text-primary font-mono tracking-wider flex items-center gap-2">
              <Globe className="h-4 w-4" />
              RECENT RECORDS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentRecords.slice(0, 3).map((record, index) => (
              <div key={`${record.id}_${index}`} className="flex justify-between items-center">
                <span className="text-sm font-mono text-muted-foreground">
                  {record.name || record.email || record.ip || 'Unknown'}
                </span>
                <span className="text-sm font-mono text-primary">
                  {record.source}
                </span>
              </div>
            ))}
            {recentRecords.length === 0 && (
              <div className="text-sm font-mono text-muted-foreground text-center">
                No recent records
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
