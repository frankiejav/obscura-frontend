"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Activity, Database, Search, Users, Shield, Target, Globe } from "lucide-react"

const missionData = [
  { name: "Jan", successful: 45, failed: 12 },
  { name: "Feb", successful: 52, failed: 8 },
  { name: "Mar", successful: 61, failed: 15 },
  { name: "Apr", successful: 58, failed: 11 },
  { name: "May", successful: 67, failed: 9 },
  { name: "Jun", successful: 73, failed: 14 },
]

const activityData = [
  { time: "00:00", queries: 120, alerts: 5 },
  { time: "04:00", queries: 89, alerts: 2 },
  { time: "08:00", queries: 245, alerts: 8 },
  { time: "12:00", queries: 312, alerts: 12 },
  { time: "16:00", queries: 289, alerts: 6 },
  { time: "20:00", queries: 198, alerts: 4 },
]

export function DashboardOverview() {
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
              ACTIVE QUERIES
            </CardTitle>
            <Search className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-mono">1,247</div>
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
            <div className="text-2xl font-bold text-primary font-mono">2.7M</div>
            <p className="text-xs text-muted-foreground font-mono">
              <span className="text-green-400">+5.2%</span> data growth
            </p>
          </CardContent>
        </Card>

        <Card className="tactical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider font-mono">
              ACTIVE AGENTS
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-mono">847</div>
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
            <div className="text-2xl font-bold text-yellow-500 font-mono">MEDIUM</div>
            <p className="text-xs text-muted-foreground font-mono">
              <span className="text-yellow-400">3</span> active threats
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="tactical-card">
          <CardHeader>
            <CardTitle className="text-primary font-mono tracking-wider">MISSION SUCCESS RATE</CardTitle>
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
              AGENT ALLOCATION
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">ACTIVE FIELD</span>
              <span className="text-2xl font-bold text-primary font-mono">190</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">UNDERCOVER</span>
              <span className="text-2xl font-bold text-primary font-mono">990</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">TRAINING</span>
              <span className="text-2xl font-bold text-primary font-mono">290</span>
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
                <span className="text-sm font-mono text-yellow-400">SCANNING</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="tactical-card">
          <CardHeader>
            <CardTitle className="text-primary font-mono tracking-wider flex items-center gap-2">
              <Globe className="h-4 w-4" />
              GLOBAL OPERATIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">NORTH AMERICA</span>
              <span className="text-sm font-mono text-primary">342 ACTIVE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">EUROPE</span>
              <span className="text-sm font-mono text-primary">289 ACTIVE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">ASIA-PACIFIC</span>
              <span className="text-sm font-mono text-primary">216 ACTIVE</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
