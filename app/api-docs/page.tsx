"use client"

import { useState } from "react"
import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
      {icon === "key" && (
        <path d="M11 0a5 5 0 0 0-4.916 5.916L0 12v3a1 1 0 0 0 1 1h1v-2h2v-2h2v-2h2.084A5 5 0 1 0 11 0zm1 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fillRule="evenodd" />
      )}
      {icon === "shield" && (
        <path d="M8 0l7 3v4c0 3.53-2.61 6.74-7 8-4.39-1.26-7-4.47-7-8V3l7-3zm0 1.11L2 3.72V7c0 2.89 2.2 5.55 6 6.72 3.8-1.17 6-3.83 6-6.72V3.72L8 1.11z" fillRule="evenodd" />
      )}
      {icon === "database" && (
        <path d="M2 3.5C2 1.57 4.69 0 8 0s6 1.57 6 3.5V5c0 1.93-2.69 3.5-6 3.5S2 6.93 2 5V3.5zm0 4.35V11c0 1.93 2.69 3.5 6 3.5s6-1.57 6-3.5V7.85c-1.33 1.04-3.53 1.65-6 1.65s-4.67-.61-6-1.65zM8 1C5.24 1 3 2.12 3 3.5S5.24 6 8 6s5-1.12 5-2.5S10.76 1 8 1z" fillRule="evenodd" />
      )}
      {icon === "code" && (
        <path d="M5.41 4L.71 8.71l-.02-.02L0 9.4 5.41 14.8l.7-.7L1.42 9.4l4.69-4.69-.7-.7zm5.18 0-.7.71L14.58 9.4l-4.69 4.69.7.71L16 9.4l-.69-.71-.02.02L10.59 4zM7.07 14.31l2-12 .98.16-2 12-.98-.16z" fillRule="evenodd" />
      )}
      {icon === "flash" && (
        <path d="M5.56 16c-.11 0-.21-.01-.31-.03a1.5 1.5 0 0 1-.82-.58 1.49 1.49 0 0 1-.17-.99l.9-5.4H3c-.83 0-1.58-.67-1.58-1.5 0-.39.14-.75.37-1.03L8.5.41C8.96-.06 9.68-.13 10.22.14c.39.2.66.58.76 1.01.08.32.04.64-.1.9L9.22 6H13c.55 0 1.04.29 1.32.75.27.45.28 1 .02 1.46l-6.6 7.52c-.28.35-.71.52-1.18.27z" fillRule="evenodd" />
      )}
      {icon === "terminal" && (
        <path d="M15 15H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zM2 13h12V4H2v9zm2.71-5.29L7.41 10l-2.7 2.71-.71-.71L6 9.98l-2-2 .71-.7v.02zm2.79 3.29h3v1H7.5v-1z" fillRule="evenodd" />
      )}
      {icon === "copy" && (
        <path d="M15 0H5c-.55 0-1 .45-1 1v2h2V2h8v10h-1v2h2c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-4 4H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm-1 10H2V6h8v8z" fillRule="evenodd" />
      )}
      {icon === "tick" && (
        <path d="M14 3c-.28 0-.53.11-.71.29L6 10.59l-3.29-3.3a1.003 1.003 0 0 0-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l8-8A1.003 1.003 0 0 0 14 3z" fillRule="evenodd" />
      )}
      {icon === "arrow-right" && (
        <path d="M10.71 7.29l-4-4-.71.71L9.59 7.5H1v1h8.59L6 12l.71.71 4-4a.5.5 0 0 0 0-.71z" fillRule="evenodd" />
      )}
    </svg>
  )
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
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

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/search",
    description: "Search for exposed credentials by email, username, or domain",
    parameters: [
      { name: "query", type: "string", required: true, description: "Search term (email, username, or domain)" },
      { name: "type", type: "string", required: false, description: "Filter by type: 'email', 'username', 'domain'" },
      { name: "limit", type: "integer", required: false, description: "Maximum results to return (default: 100, max: 1000)" },
      { name: "offset", type: "integer", required: false, description: "Pagination offset (default: 0)" }
    ],
    example: `curl -X GET "https://api.obscuralabs.io/v1/search?query=example@domain.com" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "success": true,
  "data": {
    "total": 3,
    "results": [
      {
        "email": "example@domain.com",
        "source": "breach_2024_01",
        "exposed_date": "2024-01-15T08:30:00Z",
        "password": "p@ssw0rd123",
        "hash": "5f4dcc3b5aa765d61d8327deb882cf99"
      }
    ]
  }
}`
  },
  {
    method: "POST",
    path: "/api/v1/monitor",
    description: "Add an identity to continuous monitoring",
    parameters: [
      { name: "identifier", type: "string", required: true, description: "Email, phone, username, or domain to monitor" },
      { name: "type", type: "string", required: true, description: "Type: 'email', 'phone', 'username', 'domain'" },
      { name: "webhook_url", type: "string", required: false, description: "Webhook URL for notifications" }
    ],
    example: `curl -X POST "https://api.obscuralabs.io/v1/monitor" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "user@company.com",
    "type": "email",
    "webhook_url": "https://your-webhook.com/notify"
  }'`,
    response: `{
  "success": true,
  "data": {
    "monitor_id": "mon_1234567890",
    "identifier": "user@company.com",
    "type": "email",
    "status": "active",
    "created_at": "2024-01-20T10:00:00Z"
  }
}`
  },
  {
    method: "GET",
    path: "/api/v1/bulk/export",
    description: "Export breach data for a domain or organization",
    parameters: [
      { name: "domain", type: "string", required: true, description: "Domain to export data for" },
      { name: "format", type: "string", required: false, description: "Export format: 'json' or 'csv' (default: json)" },
      { name: "date_from", type: "string", required: false, description: "Start date for export (ISO 8601)" },
      { name: "date_to", type: "string", required: false, description: "End date for export (ISO 8601)" }
    ],
    example: `curl -X GET "https://api.obscuralabs.io/v1/bulk/export?domain=company.com&format=csv" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "success": true,
  "data": {
    "export_id": "exp_9876543210",
    "status": "processing",
    "download_url": null,
    "estimated_time": 300
  }
}`
  },
  {
    method: "GET",
    path: "/api/v1/stats",
    description: "Get statistics for your monitored identities",
    parameters: [
      { name: "period", type: "string", required: false, description: "Time period: 'day', 'week', 'month', 'year'" }
    ],
    example: `curl -X GET "https://api.obscuralabs.io/v1/stats?period=month" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "success": true,
  "data": {
    "total_monitored": 150,
    "new_exposures": 12,
    "resolved": 8,
    "by_type": {
      "email": 100,
      "username": 30,
      "domain": 20
    }
  }
}`
  }
]

const authMethods = [
  {
    name: "API Key Authentication",
    description: "Use your API key in the Authorization header",
    example: `Authorization: Bearer YOUR_API_KEY`
  },
  {
    name: "OAuth 2.0",
    description: "For enterprise integrations (contact sales)",
    example: `Authorization: Bearer ACCESS_TOKEN`
  }
]

const rateLimits = [
  { plan: "Monthly", limit: "60 requests/minute", daily: "200 searches/day" },
  { plan: "Professional", limit: "300 requests/minute", daily: "10,000 API credits/quarter" },
  { plan: "Enterprise", limit: "Custom", daily: "Unlimited" }
]

export default function APIDocsPage() {
  const router = useRouter()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<{ [key: number]: string }>({})

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getActiveTab = (index: number) => activeTab[index] || 'parameters'

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <Header />

      <section className="relative pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="pltr-label mb-5"
            >
              DOCUMENTATION
            </motion.p>
            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] mb-5"
            >
              API Documentation
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[#5a5a5a] text-base sm:text-lg max-w-2xl mb-8"
            >
              Integrate Obscura Labs identity intelligence into your security infrastructure with our comprehensive REST API.
            </motion.p>
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/login')}
                className="pltr-btn-primary px-6 py-3 flex items-center justify-center gap-2"
              >
                Get API Key
                <BlueprintIcon icon="key" size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/contact')}
                className="pltr-btn-secondary px-6 py-3"
              >
                Contact Sales
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="pltr-section py-16 px-6 lg:px-8 bg-[#ffffff] pltr-grain">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="border border-[#e9ecef] rounded-lg p-8 lg:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <BlueprintIcon icon="flash" size={20} className="text-[#e07a4a]" />
              <h2 className="text-[24px] sm:text-[28px] font-light text-[#1c1c1c]">Quick Start</h2>
            </div>
            <p className="text-[#868e96] text-sm mb-8">Get started with the Obscura Labs API in minutes</p>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-medium text-[#1c1c1c] mb-3">1. Get your API key</h3>
                <p className="text-[#5a5a5a] text-sm">
                  Sign up for an account and generate your API key from the dashboard settings.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-[#1c1c1c] mb-3">2. Make your first request</h3>
                <div className="bg-[#1c1c1c] rounded-lg p-4 relative">
                  <pre className="text-sm text-[#a8e6cf] overflow-x-auto font-mono">
                    <code>{`curl -X GET "https://api.obscuralabs.io/v1/search?query=test@example.com" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
                  </pre>
                  <button
                    className="absolute top-3 right-3 p-2 text-[#868e96] hover:text-white transition-colors"
                    onClick={() => copyToClipboard(
                      `curl -X GET "https://api.obscuralabs.io/v1/search?query=test@example.com" -H "Authorization: Bearer YOUR_API_KEY"`,
                      'quickstart'
                    )}
                  >
                    {copiedCode === 'quickstart' ? (
                      <BlueprintIcon icon="tick" size={14} className="text-[#a8e6cf]" />
                    ) : (
                      <BlueprintIcon icon="copy" size={14} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-[#1c1c1c] mb-3">3. Handle the response</h3>
                <p className="text-[#5a5a5a] text-sm">
                  All responses are returned in JSON format with consistent structure for easy parsing.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pltr-section py-16 lg:py-20 px-6 lg:px-8 bg-[#f7f6f3]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <BlueprintIcon icon="shield" size={20} className="text-[#e07a4a]" />
              <h2 className="text-[24px] sm:text-[28px] font-light text-[#1c1c1c]">Authentication</h2>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#dee2e6] rounded-lg overflow-hidden">
            {authMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                className="bg-[#ffffff] p-6 lg:p-8"
              >
                <h3 className="text-base font-medium text-[#1c1c1c] mb-2">{method.name}</h3>
                <p className="text-[#868e96] text-sm mb-4">{method.description}</p>
                <div className="bg-[#f7f6f3] rounded p-3">
                  <code className="text-sm text-[#e07a4a] font-mono">{method.example}</code>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pltr-section py-16 lg:py-20 px-6 lg:px-8 bg-[#ffffff] pltr-grain">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <BlueprintIcon icon="terminal" size={20} className="text-[#e07a4a]" />
              <h2 className="text-[24px] sm:text-[28px] font-light text-[#1c1c1c]">API Endpoints</h2>
            </div>
          </motion.div>

          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
                className="border border-[#e9ecef] rounded-lg overflow-hidden"
              >
                <div className="p-6 lg:p-8 bg-[#fafafa]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded text-xs font-medium font-mono ${
                      endpoint.method === 'GET' 
                        ? 'bg-[#e0f7fa] text-[#00838f]' 
                        : 'bg-[#e8f5e9] text-[#2e7d32]'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-base text-[#1c1c1c] font-mono">{endpoint.path}</code>
                  </div>
                  <p className="text-[#5a5a5a] text-sm">{endpoint.description}</p>
                </div>
                
                <div className="border-t border-[#e9ecef]">
                  <div className="flex border-b border-[#e9ecef]">
                    {['parameters', 'example', 'response'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab({ ...activeTab, [index]: tab })}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                          getActiveTab(index) === tab
                            ? 'text-[#e07a4a] border-b-2 border-[#e07a4a] -mb-px bg-white'
                            : 'text-[#868e96] hover:text-[#1c1c1c]'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-6 lg:p-8 bg-white">
                    {getActiveTab(index) === 'parameters' && (
                      <div className="space-y-4">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-start gap-4">
                            <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                              param.required 
                                ? 'bg-[#ffebee] text-[#c62828]' 
                                : 'bg-[#f5f5f5] text-[#757575]'
                            }`}>
                              {param.required ? 'Required' : 'Optional'}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-sm text-[#1c1c1c] font-mono">{param.name}</code>
                                <span className="text-xs text-[#adb5bd]">({param.type})</span>
                              </div>
                              <p className="text-sm text-[#5a5a5a]">{param.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {getActiveTab(index) === 'example' && (
                      <div className="bg-[#1c1c1c] rounded-lg p-4 relative">
                        <pre className="text-sm text-[#a8e6cf] overflow-x-auto font-mono">
                          <code>{endpoint.example}</code>
                        </pre>
                        <button
                          className="absolute top-3 right-3 p-2 text-[#868e96] hover:text-white transition-colors"
                          onClick={() => copyToClipboard(endpoint.example, `example-${index}`)}
                        >
                          {copiedCode === `example-${index}` ? (
                            <BlueprintIcon icon="tick" size={14} className="text-[#a8e6cf]" />
                          ) : (
                            <BlueprintIcon icon="copy" size={14} />
                          )}
                        </button>
                      </div>
                    )}
                    
                    {getActiveTab(index) === 'response' && (
                      <div className="bg-[#1c1c1c] rounded-lg p-4 relative">
                        <pre className="text-sm text-[#90caf9] overflow-x-auto font-mono">
                          <code>{endpoint.response}</code>
                        </pre>
                        <button
                          className="absolute top-3 right-3 p-2 text-[#868e96] hover:text-white transition-colors"
                          onClick={() => copyToClipboard(endpoint.response, `response-${index}`)}
                        >
                          {copiedCode === `response-${index}` ? (
                            <BlueprintIcon icon="tick" size={14} className="text-[#90caf9]" />
                          ) : (
                            <BlueprintIcon icon="copy" size={14} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pltr-section py-16 lg:py-20 px-6 lg:px-8 bg-[#f7f6f3]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <BlueprintIcon icon="database" size={20} className="text-[#e07a4a]" />
              <h2 className="text-[24px] sm:text-[28px] font-light text-[#1c1c1c]">Rate Limits</h2>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            className="border border-[#e9ecef] rounded-lg overflow-hidden bg-white"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e9ecef] bg-[#fafafa]">
                    <th className="text-left p-4 text-[#1c1c1c] font-medium text-sm">Plan</th>
                    <th className="text-left p-4 text-[#1c1c1c] font-medium text-sm">Rate Limit</th>
                    <th className="text-left p-4 text-[#1c1c1c] font-medium text-sm">Daily Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {rateLimits.map((limit, index) => (
                    <tr key={index} className="border-b border-[#f1f3f5] last:border-b-0">
                      <td className="p-4 text-[#5a5a5a] text-sm">{limit.plan}</td>
                      <td className="p-4 text-[#5a5a5a] text-sm font-mono">{limit.limit}</td>
                      <td className="p-4 text-[#5a5a5a] text-sm font-mono">{limit.daily}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pltr-section py-24 sm:py-32 lg:py-40 bg-[#ffffff] pltr-grain relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] bg-[#e07a4a]/[0.04] rounded-full blur-3xl" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <p className="pltr-label mb-5">GET STARTED</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[44px] font-light text-[#1c1c1c] leading-[1.1] tracking-[-0.02em] mb-8 max-w-2xl mx-auto">
              Ready to integrate?
            </h2>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-primary px-8 py-3 w-full sm:w-auto inline-flex items-center justify-center gap-2"
                >
                  Access Dashboard
                  <BlueprintIcon icon="arrow-right" size={14} />
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-secondary px-8 py-3 w-full sm:w-auto"
                >
                  Contact Support
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
