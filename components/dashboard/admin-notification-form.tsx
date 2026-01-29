"use client"

import { useState } from "react"
import { BlueprintIcon } from "@/components/ui/blueprint-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NotificationType, NotificationPriority, CreateNotificationInput } from "@/lib/types/notifications"

interface AdminNotificationFormProps {
  user: {
    id: string
    email: string
    role: string
    clearance_level: number
  }
  onSubmit: (notification: CreateNotificationInput) => void
}

export function AdminNotificationForm({ user, onSubmit }: AdminNotificationFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'ADMIN_ALERT' as NotificationType,
    priority: 'MEDIUM' as NotificationPriority,
    targetUserId: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const notificationData: CreateNotificationInput = {
      title: formData.title,
      message: formData.message,
      type: formData.type,
      priority: formData.priority,
      targetUserId: formData.targetUserId || undefined
    }

    onSubmit(notificationData)
    setFormData({
      title: '',
      message: '',
      type: 'ADMIN_ALERT',
      priority: 'MEDIUM',
      targetUserId: ''
    })
    setIsOpen(false)
  }

  const handleReset = () => {
    setFormData({
      title: '',
      message: '',
      type: 'ADMIN_ALERT',
      priority: 'MEDIUM',
      targetUserId: ''
    })
  }

  if (user.role !== 'ADMIN') {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-white/30 text-white hover:bg-white/10"
        >
          <BlueprintIcon icon="notifications" size={16} className="mr-2" />
          Send Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/95 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">SEND ADMIN ALERT</DialogTitle>
          <DialogDescription className="font-mono text-sm text-gray-400">
            Create a notification for users or system-wide alert
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-mono text-sm text-white">
              Alert Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter alert title..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="font-mono text-sm text-white">
              Alert Message
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter alert message..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 font-mono min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="font-mono text-sm text-white">
                Alert Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: NotificationType) => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/20 text-white">
                  <SelectItem value="ADMIN_ALERT">Admin Alert</SelectItem>
                  <SelectItem value="SYSTEM_ALERT">System Alert</SelectItem>
                  <SelectItem value="SECURITY_ALERT">Security Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="font-mono text-sm text-white">
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: NotificationPriority) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/20 text-white">
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetUser" className="font-mono text-sm text-white">
              Target User (Optional)
            </Label>
            <Input
              id="targetUser"
              value={formData.targetUserId}
              onChange={(e) => setFormData(prev => ({ ...prev, targetUserId: e.target.value }))}
              placeholder="User ID (leave empty for system-wide)"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 font-mono"
            />
            <p className="font-mono text-xs text-gray-400">
              Leave empty to send to all users
            </p>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-mono"
            >
              <BlueprintIcon icon="send-message" size={16} className="mr-2" />
              Send Alert
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="border-white/30 text-white hover:bg-white/10 font-mono"
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-white/10 font-mono"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 