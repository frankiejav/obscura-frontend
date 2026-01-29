'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BlueprintIcon } from '@/components/ui/blueprint-icon'

export default function MonitoringPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTargets: 0,
    activeMonitors: 0,
    alertsTriggered: 0,
    lastScanTime: null as string | null,
  })

  useEffect(() => {
    // Simulate loading monitoring data
    setTimeout(() => {
      setStats({
        totalTargets: 12,
        activeMonitors: 8,
        alertsTriggered: 3,
        lastScanTime: new Date().toISOString(),
      })
      setLoading(false)
    }, 1000)
  }, [])

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
              <p className="mt-4 text-white/60 text-sm tracking-wide">Loading monitoring data...</p>
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
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Monitoring</h1>
            <p className="text-neutral-400 mt-1">Real-time threat monitoring and alerts</p>
          </div>
          <Button 
            size="lg"
            className="group bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-500"
          >
            <BlueprintIcon icon="shield" size={16} className="mr-2 group-hover:scale-110 transition-transform" />
            Configure Alerts
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative bg-neutral-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-300">Total Targets</CardTitle>
                <div className="p-2 bg-white/10 rounded-lg">
                  <BlueprintIcon icon="desktop" size={20} className="text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.totalTargets}
                </div>
                <p className="text-xs text-neutral-400">
                  Monitored entities
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative bg-neutral-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-300">Active Monitors</CardTitle>
                <div className="p-2 bg-white/10 rounded-lg">
                  <BlueprintIcon icon="pulse" size={20} className="text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.activeMonitors}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-neutral-400">
                    Currently scanning
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative bg-neutral-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-300">Alerts Triggered</CardTitle>
                <div className="p-2 bg-white/10 rounded-lg">
                  <BlueprintIcon icon="warning-sign" size={20} className="text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.alertsTriggered}
                </div>
                <p className="text-xs text-neutral-400">
                  In the last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative bg-neutral-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-300">Last Scan</CardTitle>
                <div className="p-2 bg-white/10 rounded-lg">
                  <BlueprintIcon icon="time" size={20} className="text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white mb-1">
                  Just now
                </div>
                <div className="flex items-center gap-2">
                  <BlueprintIcon icon="tick-circle" size={12} className="text-green-400" />
                  <p className="text-xs text-neutral-400">
                    All systems operational
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Monitoring Status */}
        <Card className="bg-neutral-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <BlueprintIcon icon="shield" size={20} className="text-white" />
                </div>
                <span className="text-xl text-white">Monitoring Status</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-4">
                <BlueprintIcon icon="lightning" size={32} className="text-green-400" />
              </div>
              <p className="text-white text-lg font-semibold mb-2">All Systems Operational</p>
              <p className="text-neutral-400">Monitoring is active and scanning for threats</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
