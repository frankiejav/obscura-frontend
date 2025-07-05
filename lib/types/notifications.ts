export type NotificationType = 
  | 'ACCOUNT_CHANGE'
  | 'PASSWORD_CHANGE'
  | 'EMAIL_CHANGE'
  | 'NEW_RECORD'
  | 'ADMIN_ALERT'
  | 'SYSTEM_ALERT'
  | 'SECURITY_ALERT'

export type NotificationPriority = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  isRead: boolean
  createdAt: string
  createdBy?: {
    id: string
    name: string
    email: string
    role: string
  }
  targetUserId?: string
  metadata?: Record<string, any>
}

export interface NotificationConnection {
  edges: NotificationEdge[]
  pageInfo: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor?: string
    endCursor?: string
  }
  totalCount: number
}

export interface NotificationEdge {
  node: Notification
  cursor: string
}

export interface CreateNotificationInput {
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  targetUserId?: string
} 