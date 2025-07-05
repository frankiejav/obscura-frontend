import { useState, useEffect } from 'react'
import { Notification, CreateNotificationInput } from '@/lib/types/notifications'

// Mock GraphQL client - replace with actual GraphQL client
const mockGraphQLClient = {
  query: async (query: string, variables?: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Mock responses based on query
    if (query.includes('notifications')) {
      return {
        data: {
          notifications: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false
            },
            totalCount: 0
          }
        }
      }
    }
    
    if (query.includes('unreadNotificationCount')) {
      return {
        data: {
          unreadNotificationCount: 0
        }
      }
    }
    
    return { data: null }
  },
  
  mutate: async (mutation: string, variables?: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock responses based on mutation
    if (mutation.includes('markNotificationAsRead')) {
      return {
        data: {
          markNotificationAsRead: {
            id: variables.id,
            isRead: true
          }
        }
      }
    }
    
    if (mutation.includes('createNotification')) {
      return {
        data: {
          createNotification: {
            id: Date.now().toString(),
            title: variables.title,
            message: variables.message,
            type: variables.type,
            priority: variables.priority,
            isRead: false,
            createdAt: new Date().toISOString(),
            createdBy: {
              id: 'current-user',
              name: 'Current User',
              email: 'user@obscura.com',
              role: 'ADMIN'
            }
          }
        }
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
      const query = `
        query GetNotifications($first: Int, $isRead: Boolean) {
          notifications(first: $first, isRead: $isRead) {
            edges {
              node {
                id
                title
                message
                type
                priority
                isRead
                createdAt
                createdBy {
                  id
                  name
                  email
                  role
                }
                targetUserId
                metadata
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            totalCount
          }
        }
      `
      
      const response = await mockGraphQLClient.query(query, { first: 50 })
      const notificationEdges = response.data?.notifications?.edges || []
      const notificationsList = notificationEdges.map((edge: any) => edge.node)
      
      setNotifications(notificationsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const query = `
        query GetUnreadCount {
          unreadNotificationCount
        }
      `
      
      const response = await mockGraphQLClient.query(query)
      setUnreadCount(response.data?.unreadNotificationCount || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const mutation = `
        mutation MarkNotificationAsRead($id: ID!) {
          markNotificationAsRead(id: $id) {
            id
            isRead
          }
        }
      `
      
      await mockGraphQLClient.mutate(mutation, { id: notificationId })
      
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
      const mutation = `
        mutation MarkAllNotificationsAsRead {
          markAllNotificationsAsRead
        }
      `
      
      await mockGraphQLClient.mutate(mutation)
      
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
      const mutation = `
        mutation CreateNotification($title: String!, $message: String!, $type: NotificationType!, $priority: NotificationPriority!, $targetUserId: ID) {
          createNotification(
            title: $title
            message: $message
            type: $type
            priority: $priority
            targetUserId: $targetUserId
          ) {
            id
            title
            message
            type
            priority
            isRead
            createdAt
            createdBy {
              id
              name
              email
              role
            }
          }
        }
      `
      
      const response = await mockGraphQLClient.mutate(mutation, notificationData)
      const newNotification = response.data?.createNotification
      
      if (newNotification) {
        setNotifications(prev => [newNotification, ...prev])
        await fetchUnreadCount()
      }
      
      return newNotification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification')
      throw err
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const mutation = `
        mutation DeleteNotification($id: ID!) {
          deleteNotification(id: $id)
        }
      `
      
      await mockGraphQLClient.mutate(mutation, { id: notificationId })
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      await fetchUnreadCount()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification')
    }
  }

  // Fetch notifications on mount
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
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    fetchUnreadCount
  }
} 