"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

const outputLines = [
  { text: '$ obscura ingest --source telegram --channels stealer-logs', type: 'command' },
  { text: '', type: 'empty' },
  { text: '[+] Connecting to data sources...', type: 'info' },
  { text: '[+] Authentication successful', type: 'success' },
  { text: '', type: 'empty' },
  { text: '--- Scanning Channel: REDLINE_CLOUD ---', type: 'header' },
  { text: 'Found 2,847 new log files', type: 'info' },
  { text: '', type: 'empty' },
  { text: 'Parsing: RDL_2026-01-28_batch_001.txt', type: 'dim' },
  { text: '  Extracting credentials...', type: 'dim' },
  { text: '', type: 'empty' },
  { text: '  URL: https://accounts.google.com/signin', type: 'muted' },
  { text: '  Email: marcus.chen@techcorp.io', type: 'credential' },
  { text: '  Pass: Tc#2024!SecurePass', type: 'credential' },
  { text: '  Cookie: SAPISID=7Kx9mN2pL...', type: 'muted' },
  { text: '', type: 'empty' },
  { text: '  URL: https://github.com/login', type: 'muted' },
  { text: '  User: elena.vasquez', type: 'credential' },
  { text: '  Pass: GitH@ck3r_2025!', type: 'credential' },
  { text: '  Token: ghp_x7K9mNpL2qR...', type: 'muted' },
  { text: '', type: 'empty' },
  { text: '  URL: https://login.microsoftonline.com', type: 'muted' },
  { text: '  Email: j.richardson@financegroup.com', type: 'credential' },
  { text: '  Pass: F1n@nce_Secure#91', type: 'credential' },
  { text: '', type: 'empty' },
  { text: '[+] Batch 001 complete: 156 credentials extracted', type: 'success' },
  { text: '', type: 'empty' },
  { text: 'Parsing: RDL_2026-01-28_batch_002.txt', type: 'dim' },
  { text: '  Processing 89 entries...', type: 'dim' },
  { text: '', type: 'empty' },
  { text: '--- Normalizing Data ---', type: 'header' },
  { text: 'Deduplicating against 6.5B existing records...', type: 'info' },
  { text: 'Unique entries found: 847', type: 'success' },
  { text: '', type: 'empty' },
  { text: '--- Uploading to Database ---', type: 'header' },
  { text: 'INSERT INTO credentials (domain, email, hash)', type: 'dim' },
  { text: '  accounts.google.com    | 156 rows', type: 'muted' },
  { text: '  github.com             | 89 rows', type: 'muted' },
  { text: '  microsoftonline.com    | 234 rows', type: 'muted' },
  { text: '  aws.amazon.com         | 67 rows', type: 'muted' },
  { text: '  okta.com               | 301 rows', type: 'muted' },
  { text: '', type: 'empty' },
  { text: '[+] Database sync complete', type: 'success' },
  { text: '[+] 847 new records indexed', type: 'success' },
  { text: '[+] Alerts triggered: 12 monitored domains', type: 'warning' },
  { text: '', type: 'empty' },
  { text: '$ _', type: 'cursor' },
]

export default function TerminalAnimation() {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let lineIndex = 0
    let timeoutId: NodeJS.Timeout

    const addNextLine = () => {
      if (lineIndex >= outputLines.length) {
        setTimeout(() => {
          setVisibleLines(0)
          lineIndex = 0
          addNextLine()
        }, 5000)
        return
      }

      setVisibleLines(lineIndex + 1)
      lineIndex++

      const currentLine = outputLines[lineIndex - 1]
      let delay = 60

      if (currentLine?.type === 'command') delay = 800
      else if (currentLine?.type === 'header') delay = 400
      else if (currentLine?.type === 'success') delay = 300
      else if (currentLine?.type === 'credential') delay = 120
      else if (currentLine?.type === 'empty') delay = 80

      timeoutId = setTimeout(addNextLine, delay)
    }

    addNextLine()

    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [visibleLines])

  const getLineClass = (type: string) => {
    switch (type) {
      case 'command':
        return 'text-[#212529] font-medium'
      case 'success':
        return 'text-[#22c55e]'
      case 'warning':
        return 'text-[#e85d2d]'
      case 'info':
        return 'text-[#495057]'
      case 'header':
        return 'text-[#e85d2d] font-medium'
      case 'credential':
        return 'text-[#3b82f6]'
      case 'muted':
        return 'text-[#868e96]'
      case 'dim':
        return 'text-[#adb5bd]'
      case 'cursor':
        return 'text-[#212529]'
      default:
        return 'text-[#868e96]'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="relative bg-[#f8f9fa] border border-[#e9ecef] rounded overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e9ecef] bg-white">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-[#868e96] ml-2 font-mono">obscura-cli</span>
      </div>
      
      <div 
        ref={containerRef}
        className="p-4 h-[320px] overflow-y-auto font-mono text-[11px] sm:text-xs leading-relaxed scrollbar-thin"
      >
        {outputLines.slice(0, visibleLines).map((line, index) => (
          <div 
            key={index} 
            className={`${getLineClass(line.type)} ${line.type === 'cursor' ? 'animate-pulse' : ''}`}
          >
            {line.text || '\u00A0'}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
