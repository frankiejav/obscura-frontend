"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Database, Download, Filter, RefreshCw } from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

type DataSource = {
  id: string
  name: string
  recordCount: number
  lastUpdated: string
  status: "active" | "processing" | "error"
}

type MonthlyRecord = {
  name: string
  count: number
}

type BreachDatabase = {
  id: number
  name: string
  count: number
  breach_date: string | null
  unverified: number
  passwordless: number
  compilation: number
}

export function DataManagement() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedSource, setSelectedSource] = useState<string | null>("all")
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [breachData, setBreachData] = useState<{
    totalCount: number
    totalDatabases: number
    recentDatabases: BreachDatabase[]
    topDatabases: BreachDatabase[]
    allDatabases: BreachDatabase[]
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchDataSources()
    fetchMonthlyRecords()
    fetchBreachData()

    const interval = setInterval(() => {
      fetchDataSources()
      fetchMonthlyRecords()
      fetchBreachData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchBreachData = async () => {
    try {
      const response = await fetch('/api/leakcheck-databases')
      if (response.ok) {
        const data = await response.json()
        setBreachData(data)
      }
    } catch (error) {
      console.error('Error fetching breach data:', error)
    }
  }

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources')
      if (response.ok) {
        const data = await response.json()
        setDataSources(data)
      }
    } catch (error) {
      console.error('Error fetching data sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyRecords = async () => {
    try {
      // For now, generate mock monthly data
      // In a real implementation, you'd fetch this from a dedicated endpoint
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const currentMonth = new Date().getMonth()
      const monthlyData = months.slice(0, currentMonth + 1).map((month, index) => ({
        name: month,
        count: Math.floor(Math.random() * 1000) + 100
      }))
      setMonthlyRecords(monthlyData)
    } catch (error) {
      console.error('Error fetching monthly records:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchDataSources(), fetchMonthlyRecords(), fetchBreachData()])
    setRefreshing(false)
  }

  const sourceDistribution = breachData 
    ? breachData.topDatabases.slice(0, 5).map((db) => ({
        name: db.name,
        value: db.count,
      }))
    : dataSources.map((source) => ({
        name: source.name,
        value: source.recordCount,
      }))

  // Pagination logic
  const getPaginatedData = () => {
    if (breachData) {
      const filteredData = breachData.allDatabases.filter(
        (db) => selectedSource === "all" || db.id.toString() === selectedSource
      )
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return filteredData.slice(startIndex, endIndex)
    } else {
      const filteredData = dataSources.filter(
        (source) => selectedSource === "all" || source.id === selectedSource
      )
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return filteredData.slice(startIndex, endIndex)
    }
  }

  const getTotalPages = () => {
    if (breachData) {
      const filteredData = breachData.allDatabases.filter(
        (db) => selectedSource === "all" || db.id.toString() === selectedSource
      )
      return Math.ceil(filteredData.length / itemsPerPage)
    } else {
      const filteredData = dataSources.filter(
        (source) => selectedSource === "all" || source.id === selectedSource
      )
      return Math.ceil(filteredData.length / itemsPerPage)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading data sources...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Data Management</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedSource || "all"} onValueChange={(value) => setSelectedSource(value || "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={breachData ? "All Databases" : "All Sources"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{breachData ? "All Databases" : "All Sources"}</SelectItem>
              {breachData 
                ? breachData.allDatabases.map((db) => (
                    <SelectItem key={db.id} value={db.id.toString()}>
                      {db.name}
                    </SelectItem>
                  ))
                : dataSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))
              }
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {breachData ? `${(breachData.totalCount / 1000000000).toFixed(1)}B+` : dataSources.reduce((acc, source) => acc + source.recordCount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {breachData ? `Across ${breachData.totalDatabases} breach databases` : `Across ${dataSources.length} sources`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {breachData ? breachData.totalDatabases : dataSources.filter((source) => source.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {breachData ? 'Breach databases' : `Out of ${dataSources.length} total sources`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Breaches</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {breachData ? breachData.recentDatabases.length : dataSources.filter((source) => source.status === "processing").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {breachData ? 'Recent breach databases' : 'Sources currently updating'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Databases</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {breachData ? breachData.topDatabases.length : dataSources.filter((source) => source.status === "error").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {breachData ? 'Largest databases by records' : 'Sources with issues'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{breachData ? 'Records by Database' : 'Records by Source'}</CardTitle>
                <CardDescription>
                  {breachData ? 'Distribution of records across top breach databases' : 'Distribution of records across data sources'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {sourceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Records Growth</CardTitle>
                <CardDescription>Monthly record count growth</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRecords}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>{breachData ? 'Breach Databases' : 'Data Sources'}</CardTitle>
              <CardDescription>
                {breachData ? 'Monitor breach databases' : 'Manage and monitor your data sources'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Database Name</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Breach Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData().map((item) => {
                    if (breachData) {
                      const database = item as BreachDatabase
                      return (
                        <TableRow key={database.id}>
                          <TableCell className="font-medium">{database.name}</TableCell>
                          <TableCell>{database.count.toLocaleString()}</TableCell>
                          <TableCell>{database.breach_date || 'Unknown'}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              Breached
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    } else {
                      const source = item as DataSource
                      return (
                        <TableRow key={source.id}>
                          <TableCell className="font-medium">{source.name}</TableCell>
                          <TableCell>{source.recordCount.toLocaleString()}</TableCell>
                          <TableCell>{new Date(source.lastUpdated).toLocaleString()}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                source.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : source.status === "processing"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {source.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    }
                  })}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {getTotalPages() > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === getTotalPages()}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Data Analytics</CardTitle>
              <CardDescription>Advanced analytics and insights for your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[400px] items-center justify-center">
                <p className="text-muted-foreground">Advanced analytics features coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
