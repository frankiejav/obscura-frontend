"use client"

import { useState } from "react"
import { Bell, X, AlertTriangle, Shield, User, Database, Settings, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Notification, NotificationType, NotificationPriority } from "@/lib/types/notifications"
import { useNotifications } from "@/hooks/use-notifications"

interface NotificationsPanelProps {
  user: {
    id: string
    email: string
    role: string
    clearance_level: number
  }
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'ACCOUNT_CHANGE':
    case 'PASSWORD_CHANGE':
    case 'EMAIL_CHANGE':
      return <User className="w-4 h-4" />
    case 'NEW_RECORD':
      return <Database className="w-4 h-4" />
    case 'ADMIN_ALERT':
    case 'SYSTEM_ALERT':
      return <Settings className="w-4 h-4" />
    case 'SECURITY_ALERT':
      return <Shield className="w-4 h-4" />
    default:
      return <Bell className="w-4 h-4" />
  }
}

const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'LOW':
      return 'bg-blue-500'
    case 'MEDIUM':
      return 'bg-yellow-500'
    case 'HIGH':
      return 'bg-orange-500'
    case 'CRITICAL':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getTypeColor = (type: NotificationType) => {
  switch (type) {
    case 'ACCOUNT_CHANGE':
    case 'PASSWORD_CHANGE':
    case 'EMAIL_CHANGE':
      return 'text-blue-400'
    case 'NEW_RECORD':
      return 'text-green-400'
    case 'ADMIN_ALERT':
    case 'SYSTEM_ALERT':
      return 'text-yellow-400'
    case 'SECURITY_ALERT':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else {
    return date.toLocaleDateString()
  }
}

export function NotificationsPanel({ user }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications(user.id)



  const unreadNotifications = notifications.filter(n => !n.isRead)
  const readNotifications = notifications.filter(n => n.isRead)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-96 p-0 bg-black/95 border-white/20 text-white max-h-[600px]"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <h3 className="font-mono text-sm font-bold">NOTIFICATIONS</h3>
            {unreadCount > 0 && (
              <Badge variant="outline" className="border-red-500 text-red-500 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-gray-400 hover:text-white hover:bg-white/10"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[500px]">
          <div className="p-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="font-mono text-sm mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Bell className="w-8 h-8 mb-2" />
                <p className="font-mono text-sm">No notifications</p>
              </div>
            ) : (
              <>
                {unreadNotifications.length > 0 && (
                  <>
                    <div className="mb-2">
                      <h4 className="font-mono text-xs text-gray-400 px-2 py-1">UNREAD</h4>
                    </div>
                    {unreadNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        user={user}
                      />
                    ))}
                    {readNotifications.length > 0 && <Separator className="my-2 bg-white/20" />}
                  </>
                )}

                {readNotifications.length > 0 && (
                  <>
                    <div className="mb-2">
                      <h4 className="font-mono text-xs text-gray-400 px-2 py-1">READ</h4>
                    </div>
                    {readNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        user={user}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  user: {
    id: string
    email: string
    role: string
    clearance_level: number
  }
}

function NotificationItem({ notification, onMarkAsRead, onDelete, user }: NotificationItemProps) {
  const isAdmin = user.role === 'ADMIN'

  return (
    <div className={`p-3 rounded-lg border transition-colors ${
      notification.isRead 
        ? 'border-white/10 bg-white/5' 
        : 'border-white/20 bg-white/10'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1 ${getTypeColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-mono text-sm font-bold text-white">
                  {notification.title}
                </h4>
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
              </div>
              <p className="font-mono text-xs text-gray-300 mb-2">
                {notification.message}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400">
                    {formatDate(notification.createdAt)}
                  </span>
                  {notification.createdBy && (
                    <span className="font-mono text-xs text-gray-400">
                      by {notification.createdBy.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-xs text-gray-400 hover:text-white hover:bg-white/10 p-1 h-6"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                  {(isAdmin || notification.createdBy?.id === user.id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(notification.id)}
                      className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-6"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 