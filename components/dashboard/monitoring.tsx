"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getMonitoringScheduler } from "@/lib/monitoring-scheduler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { 
  Mail, 
  Globe, 
  Phone, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Plus,
  Trash2,
  Shield,
  Activity
} from "lucide-react"

type MonitoringTarget = {
  id: string
  type: "email" | "domain" | "phone"
  value: string
  lastScanned: string | null
  status: "clean" | "found" | "scanning" | "pending"
  breachCount: number
  addedAt: string
  autoScan: boolean
}

type ScanResult = {
  id: string
  targetId: string
  targetValue: string
  source: "leakcheck" | "database"
  breachName: string
  breachDate: string
  dataTypes: string[]
  severity: "low" | "medium" | "high" | "critical"
  foundAt: string
}

type ScanStats = {
  totalScans: number
  breachesFound: number
  lastScanTime: string | null
  nextScanTime: string | null
}

export function Monitoring() {
  const [activeTab, setActiveTab] = useState("overview")
  const [monitoringTargets, setMonitoringTargets] = useState<MonitoringTarget[]>([])
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [scanStats, setScanStats] = useState<ScanStats>({
    totalScans: 0,
    breachesFound: 0,
    lastScanTime: null,
    nextScanTime: null
  })
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [bulkInput, setBulkInput] = useState("")
  const [newTarget, setNewTarget] = useState({ type: "email", value: "" })
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])

  // Load monitoring data on mount and set up scheduler
  useEffect(() => {
    fetchMonitoringData()
    fetchScanStats()

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchMonitoringData()
      fetchScanStats()
    }, 30000)

    // Set up auto-scan scheduler (every 6 hours)
    const scheduler = getMonitoringScheduler()
    scheduler.start(async () => {
      // Perform auto-scan of all targets with autoScan enabled
      await handleScanNow()
    })

    // Calculate next scan time
    const updateNextScanTime = () => {
      const nextScan = scheduler.getNextScanTime()
      if (nextScan) {
        setScanStats(prev => ({ ...prev, nextScanTime: nextScan.toISOString() }))
      }
    }

    updateNextScanTime()

    return () => {
      clearInterval(refreshInterval)
      scheduler.stop()
    }
  }, [])

  const fetchMonitoringData = async () => {
    try {
      const response = await fetch('/api/monitoring/targets')
      if (response.ok) {
        const data = await response.json()
        setMonitoringTargets(data.targets || [])
        setScanResults(data.results || [])
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
    }
  }

  const fetchScanStats = async () => {
    try {
      const response = await fetch('/api/monitoring/stats')
      if (response.ok) {
        const data = await response.json()
        setScanStats(data)
      }
    } catch (error) {
      console.error('Error fetching scan stats:', error)
    }
  }

  const handleAddTarget = async () => {
    if (!newTarget.value.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/monitoring/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newTarget.type,
          value: newTarget.value.trim(),
          autoScan: true
        })
      })

      if (response.ok) {
        await fetchMonitoringData()
        setNewTarget({ type: "email", value: "" })
      }
    } catch (error) {
      console.error('Error adding target:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAdd = async () => {
    if (!bulkInput.trim()) return

    setLoading(true)
    const lines = bulkInput.split('\n').filter(line => line.trim())
    
    try {
      for (const line of lines) {
        const value = line.trim()
        let type: "email" | "domain" | "phone" = "email"
        
        // Auto-detect type
        if (value.includes('@')) {
          type = "email"
        } else if (value.match(/^\+?[\d\s\-\(\)]+$/)) {
          type = "phone"
        } else if (value.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/)) {
          type = "domain"
        }

        await fetch('/api/monitoring/targets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, value, autoScan: true })
        })
      }

      await fetchMonitoringData()
      setBulkInput("")
    } catch (error) {
      console.error('Error bulk adding targets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTarget = async (id: string) => {
    try {
      const response = await fetch(`/api/monitoring/targets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchMonitoringData()
      }
    } catch (error) {
      console.error('Error deleting target:', error)
    }
  }

  const handleScanNow = async (targetId?: string) => {
    setScanning(true)
    try {
      const response = await fetch('/api/monitoring/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetId: targetId || null,
          scanAll: !targetId 
        })
      })

      if (response.ok) {
        await fetchMonitoringData()
        await fetchScanStats()
      }
    } catch (error) {
      console.error('Error scanning:', error)
    } finally {
      setScanning(false)
    }
  }

  const handleScanSelected = async () => {
    if (selectedTargets.length === 0) return
    
    setScanning(true)
    try {
      for (const targetId of selectedTargets) {
        await fetch('/api/monitoring/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetId })
        })
      }
      
      await fetchMonitoringData()
      await fetchScanStats()
      setSelectedTargets([])
    } catch (error) {
      console.error('Error scanning selected targets:', error)
    } finally {
      setScanning(false)
    }
  }

  const getTargetsByType = (type: "email" | "domain" | "phone") => {
    return monitoringTargets.filter(target => target.type === type)
  }

  const getRecentBreaches = () => {
    return scanResults
      .sort((a, b) => new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime())
      .slice(0, 10)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-blue-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "clean": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "found": return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "scanning": return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Breach Monitoring</h2>
          <p className="text-muted-foreground">Monitor emails, domains, and phone numbers for data breaches</p>
        </div>
        <div className="flex items-center gap-2">
          {scanStats.nextScanTime && (
            <div className="text-sm text-muted-foreground">
              Next auto-scan: {new Date(scanStats.nextScanTime).toLocaleTimeString()}
            </div>
          )}
          <Button 
            onClick={() => handleScanNow()} 
            disabled={scanning}
            className="gap-2"
          >
            {scanning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Scan All Now
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitored Items</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringTargets.length}</div>
            <p className="text-xs text-muted-foreground">
              Active monitoring targets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Breaches Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanStats.breachesFound}</div>
            <p className="text-xs text-muted-foreground">
              Total breaches detected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanStats.totalScans}</div>
            <p className="text-xs text-muted-foreground">
              Scans performed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scanStats.lastScanTime 
                ? new Date(scanStats.lastScanTime).toLocaleTimeString() 
                : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">
              {scanStats.lastScanTime 
                ? new Date(scanStats.lastScanTime).toLocaleDateString()
                : "No scans yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            Emails ({getTargetsByType("email").length})
          </TabsTrigger>
          <TabsTrigger value="domains" className="gap-2">
            <Globe className="h-4 w-4" />
            Domains ({getTargetsByType("domain").length})
          </TabsTrigger>
          <TabsTrigger value="phones" className="gap-2">
            <Phone className="h-4 w-4" />
            Phones ({getTargetsByType("phone").length})
          </TabsTrigger>
          <TabsTrigger value="breaches">Breach History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Add</CardTitle>
              <CardDescription>Add a single item to monitor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <select 
                  className="px-3 py-2 border rounded-md"
                  value={newTarget.type}
                  onChange={(e) => setNewTarget({ ...newTarget, type: e.target.value as any })}
                >
                  <option value="email">Email</option>
                  <option value="domain">Domain</option>
                  <option value="phone">Phone</option>
                </select>
                <Input 
                  placeholder={
                    newTarget.type === "email" ? "user@example.com" :
                    newTarget.type === "domain" ? "example.com" :
                    "+1234567890"
                  }
                  value={newTarget.value}
                  onChange={(e) => setNewTarget({ ...newTarget, value: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTarget()}
                />
                <Button onClick={handleAddTarget} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bulk Import</CardTitle>
              <CardDescription>Add multiple items at once (one per line)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Enter emails, domains, or phone numbers (one per line)"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={5}
              />
              <Button onClick={handleBulkAdd} disabled={loading || !bulkInput.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Import All
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Breaches</CardTitle>
              <CardDescription>Latest breach detections across all monitored items</CardDescription>
            </CardHeader>
            <CardContent>
              {getRecentBreaches().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No breaches detected yet
                </div>
              ) : (
                <div className="space-y-2">
                  {getRecentBreaches().map((result) => (
                    <Alert key={result.id} className="py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{result.targetValue}</span> found in{" "}
                          <span className="font-medium">{result.breachName}</span>
                          <Badge variant="outline" className={`ml-2 ${getSeverityColor(result.severity)}`}>
                            {result.severity}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.foundAt).toLocaleString()}
                        </span>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Monitored Emails</CardTitle>
              <CardDescription>Email addresses being monitored for breaches</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTargets.length > 0 && (
                <div className="mb-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {selectedTargets.length} items selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleScanSelected}>
                      <Search className="h-4 w-4 mr-2" />
                      Scan Selected
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        selectedTargets.forEach(id => handleDeleteTarget(id))
                        setSelectedTargets([])
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]">
                      <input 
                        type="checkbox"
                        checked={selectedTargets.length === getTargetsByType("email").length && getTargetsByType("email").length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTargets(getTargetsByType("email").map(t => t.id))
                          } else {
                            setSelectedTargets([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Breaches</TableHead>
                    <TableHead>Last Scanned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTargetsByType("email").map((target) => (
                    <TableRow key={target.id}>
                      <TableCell>
                        <input 
                          type="checkbox"
                          checked={selectedTargets.includes(target.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTargets([...selectedTargets, target.id])
                            } else {
                              setSelectedTargets(selectedTargets.filter(id => id !== target.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{target.value}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(target.status)}
                          <span className="capitalize">{target.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {target.breachCount > 0 ? (
                          <Badge variant="destructive">{target.breachCount}</Badge>
                        ) : (
                          <Badge variant="outline">Clean</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {target.lastScanned 
                          ? new Date(target.lastScanned).toLocaleString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleScanNow(target.id)}
                            disabled={scanning}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteTarget(target.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {getTargetsByType("email").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No emails being monitored. Add some above to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <CardTitle>Monitored Domains</CardTitle>
              <CardDescription>Email domains being monitored for breaches</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Affected Emails</TableHead>
                    <TableHead>Last Scanned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTargetsByType("domain").map((target) => (
                    <TableRow key={target.id}>
                      <TableCell className="font-medium">{target.value}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(target.status)}
                          <span className="capitalize">{target.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {target.breachCount > 0 ? (
                          <Badge variant="destructive">{target.breachCount} emails</Badge>
                        ) : (
                          <Badge variant="outline">Clean</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {target.lastScanned 
                          ? new Date(target.lastScanned).toLocaleString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleScanNow(target.id)}
                            disabled={scanning}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteTarget(target.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {getTargetsByType("domain").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No domains being monitored. Add some above to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phones">
          <Card>
            <CardHeader>
              <CardTitle>Monitored Phone Numbers</CardTitle>
              <CardDescription>Phone numbers being monitored for breaches</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Breaches</TableHead>
                    <TableHead>Last Scanned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTargetsByType("phone").map((target) => (
                    <TableRow key={target.id}>
                      <TableCell className="font-medium">{target.value}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(target.status)}
                          <span className="capitalize">{target.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {target.breachCount > 0 ? (
                          <Badge variant="destructive">{target.breachCount}</Badge>
                        ) : (
                          <Badge variant="outline">Clean</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {target.lastScanned 
                          ? new Date(target.lastScanned).toLocaleString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleScanNow(target.id)}
                            disabled={scanning}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteTarget(target.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {getTargetsByType("phone").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No phone numbers being monitored. Add some above to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breaches">
          <Card>
            <CardHeader>
              <CardTitle>Breach History</CardTitle>
              <CardDescription>Complete history of all detected breaches</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Breach</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Data Types</TableHead>
                    <TableHead>Detected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.targetValue}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {monitoringTargets.find(t => t.id === result.targetId)?.type || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{result.breachName}</TableCell>
                      <TableCell>
                        <Badge variant={result.source === "leakcheck" ? "default" : "secondary"}>
                          {result.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(result.severity)}>
                          {result.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {result.dataTypes.map((type, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(result.foundAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {scanResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No breaches detected yet. Run a scan to check for breaches.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
