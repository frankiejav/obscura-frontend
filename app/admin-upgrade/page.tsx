"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminUpgradePage() {
  const [accountType, setAccountType] = useState("professional")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/account-status')
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const upgradeAccount = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/account-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountType }),
      })
      const data = await res.json()
      setResult(data)
      
      if (data.success) {
        alert(`Success! ${data.message}. Please log out and log back in.`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    window.location.href = '/api/auth/login'
  }

  const logout = () => {
    window.location.href = '/api/auth/logout'
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-neutral-900 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Admin Account Upgrade</CardTitle>
            <CardDescription className="text-neutral-400">
              Check your account status and upgrade your account type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkStatus} disabled={loading} className="bg-white text-black hover:bg-neutral-200">
                Check Current Status
              </Button>
              <Button onClick={login} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Login
              </Button>
              <Button onClick={logout} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Logout
              </Button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-neutral-800 rounded-lg">
                <pre className="text-white text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="border-t border-white/20 pt-4">
              <h3 className="text-white font-semibold mb-4">Upgrade Account</h3>
              <div className="flex gap-4">
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger className="w-48 bg-neutral-800 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-white/20">
                    <SelectItem value="free" className="text-white hover:bg-white/10">Free</SelectItem>
                    <SelectItem value="starter" className="text-white hover:bg-white/10">Starter</SelectItem>
                    <SelectItem value="professional" className="text-white hover:bg-white/10">Professional</SelectItem>
                    <SelectItem value="enterprise" className="text-white hover:bg-white/10">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={upgradeAccount} 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Upgrade to {accountType}
                </Button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400">Error: {error}</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-neutral-800/50 rounded-lg">
              <p className="text-yellow-400 text-sm mb-2">⚠️ Important Notes:</p>
              <ul className="text-neutral-400 text-sm space-y-1 list-disc list-inside">
                <li>You must set ADMIN_EMAIL in Vercel environment variables to your email</li>
                <li>After upgrading, log out and log back in for changes to take effect</li>
                <li>Enterprise includes all features: unlimited lookups, API access, real-time feeds, etc.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
