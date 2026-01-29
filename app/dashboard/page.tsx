'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { BlueprintIcon } from '@/components/ui/blueprint-icon'

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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
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
    
    const interval = setInterval(() => {
      fetchRecentRecords()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchRecentRecords = async () => {
    try {
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
      
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        dashboardStats = await statsResponse.json()
        
        setBreachData({
          totalCount: dashboardStats.totalRecords,
          totalDatabases: dashboardStats.totalSources,
          recentDatabases: [],
          topDatabases: []
        })
      }

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

      await fetchRecentRecords()
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      let date: Date
      if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        date = new Date(dateString + ' UTC')
      } else {
        date = new Date(dateString)
      }
      
      const now = new Date()
      
      if (isNaN(date.getTime())) {
        return dateString
      }
      
      const diffInMs = now.getTime() - date.getTime()
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      
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
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#e9ecef] border-t-[#e07a4a] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#868e96] text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mb-10"
      >
        <motion.p 
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="text-[#e07a4a] text-[11px] font-semibold tracking-[0.12em] uppercase mb-3"
        >
          Overview
        </motion.p>
        <motion.div 
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-[28px] sm:text-[34px] font-light text-[#1c1c1c] leading-[1.1] tracking-[-0.02em]">
              Threat Intelligence Dashboard
            </h1>
            <p className="text-[#868e96] text-sm mt-2">
              Real-time monitoring and analysis of exposed credentials
            </p>
          </div>
          <Link href="/dashboard/search">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 bg-[#1c1c1c] text-white text-sm font-medium rounded-md hover:bg-[#2a2a2a] transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <BlueprintIcon icon="search" size={14} />
              Search Database
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
      >
        {[
          { 
            label: "Total Records", 
            value: stats.totalRecords.toLocaleString(), 
            subtext: "Leaked Databases + Stealer Logs",
            icon: "database"
          },
          { 
            label: "Data Sources", 
            value: stats.totalSources.toString(), 
            subtext: `${stats.activeSources} Active Sources`,
            icon: "globe",
            hasStatus: true
          },
          { 
            label: "Recent Activity", 
            value: stats.last24hActivity.toLocaleString(), 
            subtext: "Records in last 7 days",
            icon: "pulse"
          },
          { 
            label: "API Status", 
            value: "Active", 
            subtext: "All systems operational",
            icon: "shield",
            hasStatus: true
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="bg-white border border-[#e9ecef] rounded-lg p-5 hover:border-[#dee2e6] hover:shadow-sm transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#868e96] uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="p-2 bg-[#f7f6f3] rounded-md group-hover:bg-[#e9ecef] transition-colors">
                <BlueprintIcon icon={stat.icon} size={16} className="text-[#5a5a5a]" />
              </div>
            </div>
            <div className="text-[28px] font-light text-[#1c1c1c] mb-1 tracking-tight">
              {stat.value}
            </div>
            <div className="flex items-center gap-2">
              {stat.hasStatus && (
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              )}
              <span className="text-xs text-[#adb5bd]">{stat.subtext}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Platform Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-3 gap-6 p-6 bg-[#1c1c1c] rounded-lg mb-10"
      >
        {[
          { value: "6.5B+", label: "Total Records" },
          { value: "<1min", label: "Alert Latency" },
          { value: "500K+", label: "Daily Updates" }
        ].map((stat, index) => (
          <div key={stat.label} className="text-center">
            <div className="text-[24px] sm:text-[32px] font-light text-white mb-1 font-mono tracking-tight">
              {stat.value}
            </div>
            <div className="text-[10px] sm:text-xs text-[#868e96] uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Recent Records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white border border-[#e9ecef] rounded-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[#e9ecef] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BlueprintIcon icon="pulse" size={18} className="text-[#5a5a5a]" />
            <h2 className="text-lg font-medium text-[#1c1c1c]">Recent Records</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">Live</span>
          </div>
        </div>
        
        {recentRecords.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#f7f6f3] rounded-xl mb-4">
              <BlueprintIcon icon="database" size={24} className="text-[#adb5bd]" />
            </div>
            <p className="text-[#5a5a5a] font-medium">No recent records found</p>
            <p className="text-sm text-[#adb5bd] mt-1">Data will appear here as it's processed</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f3f5]">
            {recentRecords.map((record, index) => (
              <motion.div
                key={`${record.id}_${index}_${record.timestamp}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="px-6 py-4 hover:bg-[#fafafa] transition-colors duration-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <span className="text-[10px] text-[#adb5bd] uppercase tracking-wider block mb-1">ID</span>
                    <span className="font-mono text-sm text-[#1c1c1c] truncate block">
                      {record.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#adb5bd] uppercase tracking-wider block mb-1">Identity</span>
                    <span className="text-sm text-[#1c1c1c] truncate block" title={record.email || record.username || 'N/A'}>
                      {record.email || record.username || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#adb5bd] uppercase tracking-wider block mb-1">Domain</span>
                    <span className="text-sm text-[#5a5a5a] truncate block" title={record.domain || 'N/A'}>
                      {record.domain || 'N/A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#adb5bd] uppercase tracking-wider block mb-1">Timestamp</span>
                    <span className="text-sm text-[#868e96]">
                      {formatDate(record.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { title: "Search Database", desc: "Query exposed credentials", href: "/dashboard/search", icon: "search" },
          { title: "Monitoring", desc: "Set up identity alerts", href: "/dashboard/monitoring", icon: "shield" },
          { title: "Settings", desc: "Manage your account", href: "/dashboard/settings", icon: "cog" },
        ].map((action, index) => (
          <Link key={action.title} href={action.href}>
            <motion.div
              whileHover={{ y: -2 }}
              className="p-5 bg-white border border-[#e9ecef] rounded-lg hover:border-[#e07a4a] hover:shadow-sm transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-[#f7f6f3] rounded-md group-hover:bg-[#e07a4a]/10 transition-colors">
                  <BlueprintIcon icon={action.icon} size={18} className="text-[#5a5a5a] group-hover:text-[#e07a4a] transition-colors" />
                </div>
                <div>
                  <h3 className="font-medium text-[#1c1c1c] group-hover:text-[#e07a4a] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-[#868e96] mt-0.5">{action.desc}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}
