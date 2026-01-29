"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"

const chatMessages = [
  { user: "xedeo", msg: "100k fresh logs available", avatar: "/placeholder-user.jpg", color: "#7c3aed" },
  { user: "ghost_seller", msg: "US banks combo list", avatar: "/placeholder-user.jpg", color: "#0891b2" },
  { user: "d4rk_cl0ud", msg: "New stealer build ready", avatar: "/placeholder-user.jpg", color: "#be185d" },
  { user: "nullbyte", msg: "Corporate VPN creds", avatar: "/placeholder-user.jpg", color: "#059669" },
]

const forumItems = [
  "LinkedIn Spain — 461K",
  "DAISY CLOUD — Fresh",
  "Banking Fullz 2026",
]

const outputData = [
  { domain: "accounts.google.com", count: "12,847" },
  { domain: "github.com", count: "8,234" },
  { domain: "azure.microsoft.com", count: "5,691" },
  { domain: "okta.com", count: "3,456" },
]

function PlaceholderAvatar({ name, color, size = 28 }: { name: string; color: string; size?: number }) {
  const initials = name.slice(0, 2).toUpperCase()
  return (
    <div 
      className="rounded-full flex items-center justify-center relative overflow-hidden"
      style={{ 
        width: size, 
        height: size,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}30 100%)`,
        border: `1px solid ${color}25`
      }}
    >
      <span 
        className="text-[9px] font-medium tracking-tight"
        style={{ color: `${color}cc` }}
      >
        {initials}
      </span>
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}40, transparent 60%)`
        }}
      />
    </div>
  )
}

function DesktopAnimation() {
  const [phase, setPhase] = useState(0)
  const [visibleMessages, setVisibleMessages] = useState(0)
  const [processProgress, setProcessProgress] = useState(0)

  const phaseLabels = useMemo(() => ["Collect", "Discover", "Process", "Protect"], [])

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4)
      setVisibleMessages(0)
      setProcessProgress(0)
    }, 5000)
    return () => clearInterval(phaseTimer)
  }, [])

  useEffect(() => {
    if (phase === 0) {
      const msgTimer = setInterval(() => {
        setVisibleMessages((prev) => Math.min(prev + 1, chatMessages.length))
      }, 600)
      return () => clearInterval(msgTimer)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 2) {
      const progressTimer = setInterval(() => {
        setProcessProgress((prev) => Math.min(prev + 1.5, 100))
      }, 60)
      return () => clearInterval(progressTimer)
    }
  }, [phase])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-[380px] pointer-events-none"
    >
      <div className="relative">
        <motion.div 
          className="absolute -inset-20 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(224,122,74,0.04) 0%, rgba(224,122,74,0.02) 40%, transparent 70%)"
          }}
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div 
          className="absolute -inset-12 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(206,212,218,0.1) 0%, transparent 60%)"
          }}
          animate={{ scale: [1.05, 1, 1.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <svg className="absolute -inset-12 w-[calc(100%+96px)] h-[calc(100%+96px)] pointer-events-none opacity-15">
          <defs>
            <filter id="softBlur">
              <feGaussianBlur stdDeviation="0.8" />
            </filter>
          </defs>
          <motion.circle
            cx="50%"
            cy="50%"
            r="46%"
            fill="none"
            stroke="#ced4da"
            strokeWidth="0.4"
            strokeDasharray="1 12"
            filter="url(#softBlur)"
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50% 50%" }}
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="38%"
            fill="none"
            stroke="#dee2e6"
            strokeWidth="0.3"
            strokeDasharray="2 16"
            filter="url(#softBlur)"
            animate={{ rotate: -360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50% 50%" }}
          />
        </svg>

        <div className="relative z-10 py-4">
          <div className="flex items-center gap-4 mb-8">
            {phaseLabels.map((label, i) => (
              <motion.div
                key={label}
                className="flex items-center gap-2"
                animate={{ opacity: phase === i ? 1 : 0.25 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.div
                  className="rounded-full"
                  animate={{
                    backgroundColor: phase === i ? "rgba(224,122,74,0.8)" : "rgba(206,212,218,0.4)",
                    width: phase === i ? 6 : 4,
                    height: phase === i ? 6 : 4,
                    boxShadow: phase === i ? "0 0 8px rgba(224,122,74,0.3)" : "none"
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
                <motion.span 
                  className="text-[9px] tracking-wider uppercase"
                  animate={{
                    color: phase === i ? "#e07a4a" : "#ced4da"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {label}
                </motion.span>
              </motion.div>
            ))}
          </div>

          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {phase === 0 && (
                <motion.div
                  key="collect"
                  initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(8px)", y: -10 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="space-y-4"
                >
                  <p className="text-[10px] text-[#adb5bd]/70 uppercase tracking-wider mb-5">Threat Actor Channels</p>
                  
                  {chatMessages.slice(0, visibleMessages).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 16, filter: "blur(6px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      className="flex items-start gap-3 group"
                    >
                      <div className="relative flex-shrink-0">
                        <PlaceholderAvatar name={msg.user} color={msg.color} size={30} />
                        <motion.div
                          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                          style={{ backgroundColor: msg.color, opacity: 0.8 }}
                          animate={{ 
                            scale: [1, 1.2, 1], 
                            opacity: [0.5, 0.8, 0.5] 
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        />
                      </div>
                      <div className="pt-0.5 min-w-0">
                        <p 
                          className="text-[11px] font-medium mb-0.5 opacity-70"
                          style={{ color: msg.color }}
                        >
                          {msg.user}
                        </p>
                        <p className="text-[13px] text-[#5a5a5a]/90 leading-snug">{msg.msg}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {visibleMessages < chatMessages.length && (
                    <motion.div
                      className="flex items-center gap-1.5 pl-11"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 rounded-full bg-[#ced4da]"
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {phase === 1 && (
                <motion.div
                  key="discover"
                  initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(8px)", y: -10 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="space-y-4"
                >
                  <p className="text-[10px] text-[#adb5bd]/70 uppercase tracking-wider mb-5">Database Marketplace</p>
                  
                  {forumItems.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.5, delay: i * 0.12, ease: [0.4, 0, 0.2, 1] }}
                      className="flex items-center gap-4"
                    >
                      <motion.div 
                        className="w-10 h-px"
                        style={{ background: "linear-gradient(90deg, rgba(222,226,230,0.6) 0%, rgba(222,226,230,0.2) 100%)" }}
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.12 + 0.1 }}
                        style={{ transformOrigin: "left" }}
                      />
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full"
                        animate={{ 
                          backgroundColor: ["rgba(206,212,218,0.5)", "rgba(224,122,74,0.7)", "rgba(206,212,218,0.5)"],
                          boxShadow: ["0 0 0px rgba(224,122,74,0)", "0 0 6px rgba(224,122,74,0.3)", "0 0 0px rgba(224,122,74,0)"]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                      />
                      <p className="text-[13px] text-[#5a5a5a]/90">{item}</p>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-3 pt-6"
                  >
                    <div 
                      className="flex-1 h-px" 
                      style={{ background: "linear-gradient(90deg, rgba(222,226,230,0.4) 0%, transparent 100%)" }}
                    />
                    <motion.span 
                      className="text-[9px] text-[#adb5bd]/60 tracking-wide"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      indexing...
                    </motion.span>
                  </motion.div>
                </motion.div>
              )}

              {phase === 2 && (
                <motion.div
                  key="process"
                  initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(8px)", y: -10 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="flex flex-col items-center justify-center py-4"
                >
                  <div className="relative w-28 h-28 mb-6">
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: "radial-gradient(circle, rgba(224,122,74,0.06) 0%, transparent 70%)" }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="rgba(241,243,245,0.6)"
                        strokeWidth="1.5"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray={264}
                        initial={{ strokeDashoffset: 264 }}
                        animate={{ strokeDashoffset: 264 - (264 * processProgress) / 100 }}
                        transition={{ duration: 0.1, ease: "linear" }}
                        style={{ filter: "drop-shadow(0 0 4px rgba(224,122,74,0.3))" }}
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgba(224,122,74,0.9)" />
                          <stop offset="100%" stopColor="rgba(235,143,101,0.7)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span 
                        className="text-[22px] font-light text-[#5a5a5a]/80 tabular-nums"
                        key={processProgress}
                      >
                        {Math.round(processProgress)}%
                      </motion.span>
                    </div>
                  </div>
                  
                  <motion.p 
                    className="text-[12px] text-[#868e96]/80 text-center"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Normalizing 847,293 records
                  </motion.p>
                  <p className="text-[10px] text-[#adb5bd]/50 mt-1.5">Deduplicating against 6.5B indexed</p>
                </motion.div>
              )}

              {phase === 3 && (
                <motion.div
                  key="protect"
                  initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(8px)", y: -10 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-[10px] text-[#adb5bd]/70 uppercase tracking-wider">Threat Intelligence</p>
                    <motion.div
                      className="flex items-center gap-1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "rgba(16,185,129,0.7)" }}
                        animate={{ 
                          opacity: [0.4, 0.9, 0.4],
                          boxShadow: ["0 0 0px rgba(16,185,129,0)", "0 0 6px rgba(16,185,129,0.4)", "0 0 0px rgba(16,185,129,0)"]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <span className="text-[9px] text-emerald-600/70 tracking-wide">live</span>
                    </motion.div>
                  </div>
                  
                  {outputData.map((item, i) => (
                    <motion.div
                      key={item.domain}
                      initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.4, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                      className="flex items-center justify-between py-2 border-b border-dashed border-[#e9ecef]/50 last:border-0"
                    >
                      <span className="text-[12px] text-[#5a5a5a]/80">{item.domain}</span>
                      <span className="text-[11px] text-[#e07a4a]/80 font-medium tabular-nums">{item.count}</span>
                    </motion.div>
                  ))}
                  
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="flex items-center justify-center gap-2 pt-5"
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "rgba(224,122,74,0.7)" }}
                      animate={{ 
                        scale: [1, 1.15, 1], 
                        opacity: [0.5, 0.9, 0.5],
                        boxShadow: ["0 0 0px rgba(224,122,74,0)", "0 0 8px rgba(224,122,74,0.4)", "0 0 0px rgba(224,122,74,0)"]
                      }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="text-[11px] text-[#e07a4a]/70">4 alerts triggered</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function DataPipelineAnimation() {
  return (
    <div className="hidden md:block">
      <DesktopAnimation />
    </div>
  )
}
