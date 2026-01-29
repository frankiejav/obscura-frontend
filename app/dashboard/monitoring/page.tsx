'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BlueprintIcon } from '@/components/ui/blueprint-icon'

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

export default function MonitoringPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTargets: 0,
    activeMonitors: 0,
    alertsTriggered: 0,
    lastScanTime: null as string | null,
  })

  useEffect(() => {
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#e9ecef] border-t-[#e07a4a] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#868e96] text-sm">Loading monitoring data...</p>
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
          Monitoring
        </motion.p>
        <motion.div 
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-[28px] sm:text-[34px] font-light text-[#1c1c1c] leading-[1.1] tracking-[-0.02em]">
              Identity Monitoring
            </h1>
            <p className="text-[#868e96] text-sm mt-2">
              Real-time threat monitoring and alerts for your domains and identities
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-[#1c1c1c] text-white text-sm font-medium rounded-md hover:bg-[#2a2a2a] transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <BlueprintIcon icon="plus" size={14} />
            Add Monitor
          </motion.button>
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
            label: "Total Targets", 
            value: stats.totalTargets.toString(), 
            subtext: "Monitored entities",
            icon: "desktop"
          },
          { 
            label: "Active Monitors", 
            value: stats.activeMonitors.toString(), 
            subtext: "Currently scanning",
            icon: "pulse",
            hasStatus: true
          },
          { 
            label: "Alerts Triggered", 
            value: stats.alertsTriggered.toString(), 
            subtext: "In the last 24 hours",
            icon: "warning-sign"
          },
          { 
            label: "Last Scan", 
            value: "Just now", 
            subtext: "All systems operational",
            icon: "time",
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

      {/* Monitoring Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white border border-[#e9ecef] rounded-lg overflow-hidden mb-10"
      >
        <div className="px-6 py-4 border-b border-[#e9ecef] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BlueprintIcon icon="shield" size={18} className="text-[#5a5a5a]" />
            <h2 className="text-lg font-medium text-[#1c1c1c]">Monitoring Status</h2>
          </div>
          <Badge className="bg-green-50 text-green-600 border-green-200 font-medium">
            Active
          </Badge>
        </div>
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-xl mb-4">
            <BlueprintIcon icon="tick-circle" size={32} className="text-green-500" />
          </div>
          <p className="text-[#1c1c1c] text-lg font-medium mb-2">All Systems Operational</p>
          <p className="text-[#868e96] text-sm">Monitoring is active and scanning for threats</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3 className="text-[#e07a4a] text-[11px] font-semibold tracking-[0.12em] uppercase mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Add Email Monitor", desc: "Monitor an email address", icon: "envelope" },
            { title: "Add Domain Monitor", desc: "Monitor a domain", icon: "globe" },
            { title: "View Alert History", desc: "See past alerts", icon: "history" },
          ].map((action, index) => (
            <motion.div
              key={action.title}
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
          ))}
        </div>
      </motion.div>

      {/* Feature Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-10 p-6 bg-[#1c1c1c] rounded-lg"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#e07a4a]/20 rounded-lg">
            <BlueprintIcon icon="lightning" size={24} className="text-[#e07a4a]" />
          </div>
          <div>
            <h3 className="text-white font-medium mb-1">Real-time Alerts</h3>
            <p className="text-[#868e96] text-sm leading-relaxed">
              Get instant notifications when your monitored identities appear in new data breaches or stealer logs. 
              Configure email, webhook, or Slack alerts for immediate response.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
