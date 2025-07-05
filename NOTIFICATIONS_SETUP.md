# Notifications System

This document describes the notifications system implementation for the Obscura Labs dashboard.

## Overview

The notifications system provides real-time alerts and updates to users, including:
- Account changes (password, email updates)
- New data records
- Admin alerts and system notifications
- Security alerts

## Features

### Notification Types
- **ACCOUNT_CHANGE**: General account modifications
- **PASSWORD_CHANGE**: Password updates
- **EMAIL_CHANGE**: Email address changes
- **NEW_RECORD**: New data records added
- **ADMIN_ALERT**: Admin-created alerts
- **SYSTEM_ALERT**: System-wide notifications
- **SECURITY_ALERT**: Security-related alerts

### Priority Levels
- **LOW**: Informational notifications
- **MEDIUM**: Standard updates
- **HIGH**: Important alerts
- **CRITICAL**: Urgent security alerts

## Components

### NotificationsPanel
Located at `components/dashboard/notifications-panel.tsx`

Features:
- Displays notifications in a popover
- Shows unread count badge
- Mark individual notifications as read
- Mark all notifications as read
- Delete notifications (admin only)
- Color-coded by priority and type
- Responsive design

### AdminNotificationForm
Located at `components/dashboard/admin-notification-form.tsx`

Features:
- Admin-only form to create notifications
- Target specific users or system-wide
- Select notification type and priority
- Rich text input for messages

### useNotifications Hook
Located at `hooks/use-notifications.ts`

Features:
- GraphQL integration
- Real-time updates
- Error handling
- Loading states
- CRUD operations

## GraphQL Schema

The notifications system extends the GraphQL schema with:

```graphql
type Notification {
  id: ID!
  title: String!
  message: String!
  type: NotificationType!
  priority: NotificationPriority!
  isRead: Boolean!
  createdAt: DateTime!
  createdBy: User
  targetUserId: ID
  metadata: JSON
}

enum NotificationType {
  ACCOUNT_CHANGE
  PASSWORD_CHANGE
  EMAIL_CHANGE
  NEW_RECORD
  ADMIN_ALERT
  SYSTEM_ALERT
  SECURITY_ALERT
}

enum NotificationPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

## Usage

### For Users
1. Click the bell icon in the header
2. View unread notifications at the top
3. Click the checkmark to mark as read
4. View read notifications below

### For Admins
1. Click "Send Alert" button in header
2. Fill out notification form
3. Select target users (optional)
4. Choose type and priority
5. Submit to create notification

## Implementation Notes

### Current State
- Uses mock GraphQL client for demonstration
- Ready for real GraphQL integration
- Fully typed with TypeScript
- Responsive and accessible

### To Complete Implementation
1. Replace mock GraphQL client with real client
2. Add real-time updates (WebSocket/SSE)
3. Implement server-side notification creation
4. Add notification sound/desktop notifications
5. Add notification preferences

### Styling
- Follows the dark theme design
- Uses monospace fonts for technical feel
- Color-coded by priority and type
- Consistent with existing UI components

## File Structure

```
components/dashboard/
├── notifications-panel.tsx      # Main notifications UI
├── admin-notification-form.tsx  # Admin creation form
└── header.tsx                   # Updated with notifications

hooks/
└── use-notifications.ts         # GraphQL integration

lib/types/
└── notifications.ts             # TypeScript types

schema.graphql                   # GraphQL schema extension
```

## Security Considerations

- Only admins can create notifications
- Users can only delete their own notifications
- Notifications are scoped to user permissions
- Audit trail for all notification actions 