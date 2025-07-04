import { useState, useEffect, useRef } from 'react'

interface DashboardMetrics {
  activeQueries: number
  intelRecords: number
  activeUsers: number
  totalUsers: number
  threatLevel: string
  activeThreats: number
}

interface ChartData {
  name: string
  successful: number
  failed: number
}

interface ActivityData {
  time: string
  queries: number
  alerts: number
}

interface SystemStatus {
  api: string
  database: string
  security: string
}

interface UserConnection {
  region: string
  activeUsers: number
  totalConnections: number
}

interface UserAllocation {
  admin: { total: number; active: number }
  client: { total: number; active: number }
}

interface DashboardAnalytics {
  metrics: DashboardMetrics
  userAllocation: UserAllocation
  charts: {
    missionData: ChartData[]
    activityData: ActivityData[]
  }
  system: {
    status: SystemStatus
    uptime: number
    userConnections: UserConnection[]
  }
}

interface StreamEvent {
  type: string
  timestamp: string
  data: DashboardAnalytics
}

export function useRealtimeData() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const connectToStream = () => {
      try {
        // Close existing connection if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }

        // Create new EventSource connection
        const eventSource = new EventSource('/api/dashboard/stream')
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          console.log('SSE connection established')
          setIsConnected(true)
          setError(null)
        }

        eventSource.onmessage = (event) => {
          try {
            const data: StreamEvent = JSON.parse(event.data)
            
            if (data.type === 'analytics') {
              setAnalytics(data.data)
              setLoading(false)
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError)
          }
        }

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error)
          setIsConnected(false)
          setError('Connection lost. Reconnecting...')
          
          // Attempt to reconnect after 3 seconds
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectToStream()
          }, 3000)
        }

      } catch (error) {
        console.error('Failed to establish SSE connection:', error)
        setError('Failed to connect to real-time data stream')
        setLoading(false)
      }
    }

    // Initial connection
    connectToStream()

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    setLoading(true)
    setError(null)
    connectToStream()
  }

  return {
    analytics,
    loading,
    error,
    isConnected,
    reconnect
  }
} 