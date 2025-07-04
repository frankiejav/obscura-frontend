"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Activity, Database, Search, Users, Shield, Target, Globe, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useRealtimeData } from "@/hooks/useRealtimeData"
import { Button } from "@/components/ui/button"

export function DashboardOverview() {
  const { analytics, loading, error, isConnected, reconnect } = useRealtimeData()

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Format uptime
  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}:${remainingHours.toString().padStart(2, '0')}:00`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-wider font-mono">COMMAND CENTER</h1>
            <p className="text-muted-foreground font-mono text-sm">Loading real-time data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-wider font-mono">COMMAND CENTER</h1>
            <p className="text-muted-foreground font-mono text-sm">Error loading data</p>
          </div>
          <Button onClick={reconnect} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <div className="text-center text-red-400">{error}</div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-wider font-mono">COMMAND CENTER</h1>
          <p className="text-muted-foreground font-mono text-xs sm:text-sm">
            Real-time operational overview and intelligence metrics
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono">
          <div className={`status-indicator ${isConnected ? 'status-active' : 'status-error'}`}></div>
          <span className="text-primary hidden sm:inline">
            {isConnected ? 'LIVE DATA STREAM' : 'CONNECTION LOST'}
          </span>
          <span className="text-primary sm:hidden">
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
          {isConnected ? (
            <Wifi className="h-3 w-3 text-green-400" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-400" />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="tactical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider font-mono">
              ACTIVE QUERIES
            </CardTitle>
            <Search className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-primary font-mono">
              {analytics ? formatNumber(analytics.metrics.activeQueries) : '0'}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              <span className="text-green-400">+12.5%</span> from last period
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
            <div className="text-lg sm:text-2xl font-bold text-primary font-mono">
              {analytics ? formatNumber(analytics.metrics.intelRecords) : '0'}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              <span className="text-green-400">+5.2%</span> data growth
            </p>
          </CardContent>
        </Card>

        <Card className="tactical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider font-mono">
              ACTIVE USERS
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-primary font-mono">
              {analytics ? analytics.metrics.activeUsers : '0'}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              <span className="text-green-400">+23</span> new this week
            </p>
          </CardContent>
        </Card>

        <Card className="tactical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider font-mono">
              THREAT LEVEL
            </CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-yellow-500 font-mono">
              {analytics ? analytics.metrics.threatLevel : 'MEDIUM'}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              <span className="text-yellow-400">{analytics ? analytics.metrics.activeThreats : '3'}</span> active threats
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="tactical-card">
          <CardHeader>
            <CardTitle className="text-primary font-mono tracking-wider">INVESTIGATION SUCCESS RATE</CardTitle>
          </CardHeader>
                      <CardContent className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.charts.missionData || []}>
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
                      <CardContent className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.charts.activityData || []}>
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
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="tactical-card">
          <CardHeader>
            <CardTitle className="text-primary font-mono tracking-wider flex items-center gap-2">
              <Target className="h-4 w-4" />
              USER ALLOCATION
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">ADMIN USERS</span>
              <span className="text-lg sm:text-2xl font-bold text-primary font-mono">
                {analytics?.userAllocation?.admin?.total || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">CLIENT USERS</span>
              <span className="text-lg sm:text-2xl font-bold text-primary font-mono">
                {analytics?.userAllocation?.client?.total || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">ACTIVE (24H)</span>
              <span className="text-lg sm:text-2xl font-bold text-green-400 font-mono">
                {(analytics?.userAllocation?.admin?.active || 0) + (analytics?.userAllocation?.client?.active || 0)}
              </span>
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
                <div className={`status-indicator status-${analytics?.system.status.api === 'optimal' ? 'active' : 'processing'}`}></div>
                <span className="text-sm font-mono text-green-400">{analytics?.system.status.api?.toUpperCase() || 'OPTIMAL'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-muted-foreground">DATABASE</span>
              <div className="flex items-center gap-2">
                <div className={`status-indicator status-${analytics?.system.status.database === 'online' ? 'active' : 'processing'}`}></div>
                <span className="text-sm font-mono text-green-400">{analytics?.system.status.database?.toUpperCase() || 'ONLINE'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-muted-foreground">SECURITY</span>
              <div className="flex items-center gap-2">
                <div className={`status-indicator status-${analytics?.system.status.security === 'scanning' ? 'processing' : 'active'}`}></div>
                <span className="text-sm font-mono text-yellow-400">{analytics?.system.status.security?.toUpperCase() || 'SCANNING'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="tactical-card">
          <CardHeader>
            <CardTitle className="text-primary font-mono tracking-wider flex items-center gap-2">
              <Globe className="h-4 w-4" />
              USER CONNECTIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics?.system.userConnections && analytics.system.userConnections.length > 0 ? (
              analytics.system.userConnections.map((connection, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-mono text-muted-foreground">{connection.region}</span>
                  <div className="text-right">
                    <div className="text-sm font-mono text-primary">{connection.activeUsers} USERS</div>
                    <div className="text-xs font-mono text-muted-foreground">{connection.totalConnections} CONN</div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono text-muted-foreground">NO CONNECTIONS</span>
                  <span className="text-sm font-mono text-muted-foreground">0 USERS</span>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Waiting for user activity...
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
