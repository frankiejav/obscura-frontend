import { useState, useEffect } from 'react'
import { Notification, CreateNotificationInput } from '@/lib/types/notifications'

// Mock REST client - replace with actual REST API calls
const mockRestClient = {
  get: async (endpoint: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Mock responses based on endpoint
    if (endpoint.includes('notifications')) {
      return {
        data: {
          notifications: [],
          totalCount: 0
        }
      }
    }
    
    if (endpoint.includes('unread-count')) {
      return {
        data: {
          count: 0
        }
      }
    }
    
    return { data: null }
  },
  
  post: async (endpoint: string, data?: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock responses based on endpoint
    if (endpoint.includes('mark-read')) {
      return {
        data: {
          id: data.id,
          isRead: true
        } as Partial<Notification>
      }
    }
    
    if (endpoint.includes('create')) {
      return {
        data: {
          id: Date.now().toString(),
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority,
          isRead: false,
          createdAt: new Date().toISOString(),
          createdBy: {
            id: 'current-user',
            name: 'Current User',
            email: 'user@obscura.com',
            role: 'ADMIN'
          }
        } as Notification
      }
    }
    
    return { data: null }
  }
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await mockRestClient.get('/api/notifications?limit=50')
      const notificationsList = response.data?.notifications || []
      
      setNotifications(notificationsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await mockRestClient.get('/api/notifications/unread-count')
      setUnreadCount(response.data?.count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
      
      // Refresh unread count
      await fetchUnreadCount()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await mockRestClient.post('/api/notifications/mark-all-read')
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      )
      
      setUnreadCount(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read')
    }
  }

  const createNotification = async (notificationData: CreateNotificationInput) => {
    try {
      const response = await mockRestClient.post('/api/notifications/create', notificationData)
      const newNotification = response.data
      
      // Add to local state
      setNotifications(prev => [newNotification, ...prev])
      
      // Update unread count
      setUnreadCount(prev => prev + 1)
      
      return newNotification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification')
      throw err
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await mockRestClient.post('/api/notifications/delete', { id: notificationId })
      
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      // Update unread count if notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId)
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification')
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [userId])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
  }
} 