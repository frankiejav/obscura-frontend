import { useState, useEffect } from 'react'
import { Notification, CreateNotificationInput } from '@/lib/types/notifications'

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Mock API call - replace with actual REST API
      await new Promise(resolve => setTimeout(resolve, 100))
      setNotifications([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      // Mock API call - replace with actual REST API
      await new Promise(resolve => setTimeout(resolve, 100))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // Mock API call - replace with actual REST API
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
      // Mock API call - replace with actual REST API
      await new Promise(resolve => setTimeout(resolve, 200))
      
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
      // Mock API call - replace with actual REST API
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        priority: notificationData.priority,
        isRead: false,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@obscura.com',
          role: 'ADMIN'
        },
        targetUserId: notificationData.targetUserId
      }
      
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
      // Mock API call - replace with actual REST API
      await new Promise(resolve => setTimeout(resolve, 200))
      
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