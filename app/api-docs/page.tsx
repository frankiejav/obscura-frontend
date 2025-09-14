"use client"

import { useState } from "react"
import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Key, Shield, Database, Zap, ArrowRight, Copy, Check, Terminal } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            API Documentation
          </h1>
          <p className="text-lg sm:text-xl text-neutral-200 max-w-3xl mx-auto mb-8">
            Integrate Obscura Labs identity intelligence into your security infrastructure 
            with our comprehensive REST API.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-neutral-200"
              onClick={() => router.push('/login')}
            >
              Get API Key
              <Key className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => router.push('/contact')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-neutral-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Zap className="h-6 w-6" />
                Quick Start
              </CardTitle>
              <CardDescription className="text-neutral-300">
                Get started with the Obscura Labs API in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Get your API key</h3>
                <p className="text-neutral-300 mb-3">
                  Sign up for an account and generate your API key from the dashboard settings.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. Make your first request</h3>
                <div className="bg-neutral-800 rounded-lg p-4 relative">
                  <code className="text-sm text-green-400 block">
                    {`curl -X GET "https://api.obscuralabs.io/v1/search?query=test@example.com" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-white/60 hover:text-white"
                    onClick={() => copyToClipboard(
                      `curl -X GET "https://api.obscuralabs.io/v1/search?query=test@example.com" -H "Authorization: Bearer YOUR_API_KEY"`,
                      'quickstart'
                    )}
                  >
                    {copiedCode === 'quickstart' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">3. Handle the response</h3>
                <p className="text-neutral-300">
                  All responses are returned in JSON format with consistent structure for easy parsing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Authentication Section */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Authentication
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authMethods.map((method, index) => (
              <Card key={index} className="bg-neutral-900/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl text-white">{method.name}</CardTitle>
                  <CardDescription className="text-neutral-300">
                    {method.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-neutral-800 rounded-lg p-3">
                    <code className="text-sm text-blue-400">{method.example}</code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints Section */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Terminal className="h-8 w-8" />
            API Endpoints
          </h2>

          <div className="space-y-8">
            {endpoints.map((endpoint, index) => (
              <Card key={index} className="bg-neutral-900/60 border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-lg text-white font-mono">{endpoint.path}</code>
                      </div>
                      <CardDescription className="text-neutral-300">
                        {endpoint.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="parameters" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-neutral-800">
                      <TabsTrigger value="parameters" className="text-white data-[state=active]:bg-neutral-700">
                        Parameters
                      </TabsTrigger>
                      <TabsTrigger value="example" className="text-white data-[state=active]:bg-neutral-700">
                        Example
                      </TabsTrigger>
                      <TabsTrigger value="response" className="text-white data-[state=active]:bg-neutral-700">
                        Response
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="parameters" className="mt-4">
                      <div className="space-y-3">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <span className={`text-xs px-2 py-1 rounded ${
                                param.required ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {param.required ? 'Required' : 'Optional'}
                              </span>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-sm text-white font-mono">{param.name}</code>
                                <span className="text-xs text-neutral-400">({param.type})</span>
                              </div>
                              <p className="text-sm text-neutral-300">{param.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="example" className="mt-4">
                      <div className="bg-neutral-800 rounded-lg p-4 relative">
                        <pre className="text-sm text-green-400 overflow-x-auto">
                          <code>{endpoint.example}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 text-white/60 hover:text-white"
                          onClick={() => copyToClipboard(endpoint.example, `example-${index}`)}
                        >
                          {copiedCode === `example-${index}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="response" className="mt-4">
                      <div className="bg-neutral-800 rounded-lg p-4 relative">
                        <pre className="text-sm text-blue-400 overflow-x-auto">
                          <code>{endpoint.response}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 text-white/60 hover:text-white"
                          onClick={() => copyToClipboard(endpoint.response, `response-${index}`)}
                        >
                          {copiedCode === `response-${index}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rate Limits Section */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Database className="h-8 w-8" />
            Rate Limits
          </h2>
          
          <Card className="bg-neutral-900/60 border-white/10">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-white font-semibold">Plan</th>
                      <th className="text-left p-4 text-white font-semibold">Rate Limit</th>
                      <th className="text-left p-4 text-white font-semibold">Daily Limit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateLimits.map((limit, index) => (
                      <tr key={index} className="border-b border-white/5">
                        <td className="p-4 text-neutral-300">{limit.plan}</td>
                        <td className="p-4 text-neutral-300">{limit.limit}</td>
                        <td className="p-4 text-neutral-300">{limit.daily}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to integrate?
          </h2>
          <p className="text-lg text-neutral-200 mb-8">
            Get your API key and start building with Obscura Labs today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-neutral-200 px-8"
              onClick={() => router.push('/login')}
            >
              Access Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8"
              onClick={() => router.push('/contact')}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
