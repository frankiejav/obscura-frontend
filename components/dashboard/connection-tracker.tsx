"use client"

import { useEffect } from "react"

export function ConnectionTracker() {
  useEffect(() => {
    const trackConnection = async () => {
      try {
        await fetch('/api/track-connection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        console.error('Failed to track connection:', error)
      }
    }

    // Track connection on mount
    trackConnection()

    // Track connection every 5 minutes
    const interval = setInterval(trackConnection, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null // This component doesn't render anything
} 