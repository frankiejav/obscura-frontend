// Monitoring Scheduler for auto-scanning every 6 hours
// This would typically be implemented as a server-side cron job or background worker
// For client-side demo, we'll use a simplified version

export class MonitoringScheduler {
  private intervalId: NodeJS.Timeout | null = null
  private lastScanTime: Date | null = null
  private scanInterval = 6 * 60 * 60 * 1000 // 6 hours in milliseconds

  constructor() {
    // Load last scan time from localStorage if available
    if (typeof window !== 'undefined') {
      const savedTime = localStorage.getItem('lastMonitoringScan')
      if (savedTime) {
        this.lastScanTime = new Date(savedTime)
      }
    }
  }

  start(onScan: () => Promise<void>) {
    // Clear any existing interval
    this.stop()

    // Calculate time until next scan
    const now = new Date()
    let timeUntilNextScan = this.scanInterval

    if (this.lastScanTime) {
      const timeSinceLastScan = now.getTime() - this.lastScanTime.getTime()
      if (timeSinceLastScan < this.scanInterval) {
        timeUntilNextScan = this.scanInterval - timeSinceLastScan
      } else {
        // Overdue for a scan, do it immediately
        timeUntilNextScan = 0
      }
    }

    // Schedule the first scan
    if (timeUntilNextScan === 0) {
      this.performScan(onScan)
    } else {
      setTimeout(() => {
        this.performScan(onScan)
        // Then set up regular interval
        this.intervalId = setInterval(() => {
          this.performScan(onScan)
        }, this.scanInterval)
      }, timeUntilNextScan)
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async performScan(onScan: () => Promise<void>) {
    try {
      await onScan()
      this.lastScanTime = new Date()
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastMonitoringScan', this.lastScanTime.toISOString())
      }
    } catch (error) {
      console.error('Error performing scheduled scan:', error)
    }
  }

  getNextScanTime(): Date | null {
    if (!this.lastScanTime) {
      return null
    }
    return new Date(this.lastScanTime.getTime() + this.scanInterval)
  }

  getLastScanTime(): Date | null {
    return this.lastScanTime
  }
}

// Singleton instance
let schedulerInstance: MonitoringScheduler | null = null

export function getMonitoringScheduler(): MonitoringScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new MonitoringScheduler()
  }
  return schedulerInstance
}
