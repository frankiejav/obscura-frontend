"use client"

import { useState, useEffect } from "react"
import { useUser } from "@auth0/nextjs-auth0"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BlueprintIcon } from "@/components/ui/blueprint-icon"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import dynamic from 'next/dynamic'

const SubscriptionManager = dynamic(
  () => import('@/components/dashboard/SubscriptionManager'),
  { ssr: false }
)

const SecurityKeys = dynamic(
  () => import('@/components/dashboard/SecurityKeys'),
  { ssr: false }
)

interface Settings {
  profile: {
    displayName: string
    email: string
    theme: 'light' | 'dark' | 'system'
  }
  notifications: {
    emailAlerts: boolean
    securityAlerts: boolean
  }
  display: {
    defaultPageSize: string
    compactView: boolean
  }
}

export function SettingsPage() {
  const { user, isLoading: userLoading } = useUser()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingEmail, setChangingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [showEmailChange, setShowEmailChange] = useState(false)

  useEffect(() => {
    if (!userLoading && user) {
      fetchSettings()
    }
  }, [userLoading, user])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setNewEmail(data.profile.email)
      } else if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEmailChange = async () => {
    if (!newEmail || newEmail === settings?.profile.email) {
      toast({
        title: "Invalid Email",
        description: "Please enter a different email address",
        variant: "destructive",
      })
      return
    }

    setChangingEmail(true)
    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Email Update Initiated",
          description: data.message,
        })
        setShowEmailChange(false)
        if (settings) {
          setSettings({
            ...settings,
            profile: { ...settings.profile, email: newEmail }
          })
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error changing email:', error)
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive",
      })
    } finally {
      setChangingEmail(false)
    }
  }

  const handlePasswordReset = async () => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Password Reset Email Sent",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send password reset email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error initiating password reset:', error)
      toast({
        title: "Error",
        description: "Failed to initiate password reset",
        variant: "destructive",
      })
    }
  }

  if (loading || userLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#e9ecef] border-t-[#e07a4a] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#868e96] text-sm">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user || !settings) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <Alert className="bg-[#f7f6f3] border-[#e9ecef]">
          <BlueprintIcon icon="error" size={16} className="text-[#e07a4a]" />
          <AlertDescription className="text-[#5a5a5a]">
            Please log in to access settings
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-[#e07a4a] text-[11px] font-semibold tracking-[0.12em] uppercase mb-3">Settings</p>
        <h1 className="text-[28px] sm:text-[34px] font-light text-[#1c1c1c] leading-[1.1] tracking-[-0.02em]">Account Settings</h1>
        <p className="text-[#868e96] text-sm mt-2">Manage your account and application preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-5 bg-white border border-[#e9ecef] p-1 rounded-lg">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-white text-[#5a5a5a] hover:text-[#1c1c1c] transition-all duration-200 text-sm">
            <BlueprintIcon icon="user" size={14} className="mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-white text-[#5a5a5a] hover:text-[#1c1c1c] transition-all duration-200 text-sm">
            <BlueprintIcon icon="shield" size={14} className="mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-white text-[#5a5a5a] hover:text-[#1c1c1c] transition-all duration-200 text-sm">
            <BlueprintIcon icon="credit-card" size={14} className="mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-white text-[#5a5a5a] hover:text-[#1c1c1c] transition-all duration-200 text-sm">
            <BlueprintIcon icon="notifications" size={14} className="mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="display" className="data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-white text-[#5a5a5a] hover:text-[#1c1c1c] transition-all duration-200 text-sm">
            <BlueprintIcon icon="desktop" size={14} className="mr-2" />
            Display
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="bg-white border-[#e9ecef] hover:border-[#dee2e6] transition-all duration-300">
            <CardHeader className="border-b border-[#e9ecef]">
              <CardTitle className="text-lg text-[#1c1c1c]">Profile Settings</CardTitle>
              <CardDescription className="text-[#868e96]">
                Manage your account information and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={settings.profile.displayName}
                  onChange={(e) => setSettings({
                    ...settings,
                    profile: { ...settings.profile, displayName: e.target.value }
                  })}
                  className="border-gray-300 focus:border-gray-500"
                />
              </div>

              {/* Email Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      disabled
                      className="flex-1 bg-gray-50 border-gray-300"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowEmailChange(!showEmailChange)}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <BlueprintIcon icon="envelope" size={16} className="mr-2" />
                      Change
                    </Button>
                  </div>
                </div>

                {showEmailChange && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <Label htmlFor="newEmail">New Email Address</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                      className="border-gray-300"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleEmailChange}
                        disabled={changingEmail}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        {changingEmail ? (
                          <>
                            <BlueprintIcon icon="refresh" size={16} className="mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Email'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowEmailChange(false)
                          setNewEmail(settings.profile.email)
                        }}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-gray-200" />

              {/* Password Section */}
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BlueprintIcon icon="lock" size={16} />
                    <span>Password authentication via Auth0</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handlePasswordReset}
                    className="border-gray-300 hover:bg-white"
                  >
                    Reset Password
                  </Button>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              {/* Theme Selection */}
              <div className="space-y-2">
                <Label htmlFor="theme">Theme Preference</Label>
                <Select
                  value={settings.profile.theme}
                  onValueChange={(value: 'light' | 'dark' | 'system') => 
                    setSettings({
                      ...settings,
                      profile: { ...settings.profile, theme: value }
                    })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border border-gray-300 rounded" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-black rounded" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <BlueprintIcon icon="style" size={16} />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
            </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <SecurityKeys />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Receive important notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailAlerts: checked }
                      })
                    }
                    className="data-[state=checked]:bg-black"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Security Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Get notified about security-related events
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.securityAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, securityAlerts: checked }
                      })
                    }
                    className="data-[state=checked]:bg-black"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">Display Settings</CardTitle>
              <CardDescription>
                Customize how information is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pageSize">Default Page Size</Label>
                <Select
                  value={settings.display.defaultPageSize}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      display: { ...settings.display, defaultPageSize: value }
                    })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="25">25 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                    <SelectItem value="100">100 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Compact View</Label>
                  <p className="text-sm text-gray-500">
                    Display more information in less space
                  </p>
                </div>
                <Switch
                  checked={settings.display.compactView}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      display: { ...settings.display, compactView: checked }
                    })
                  }
                  className="data-[state=checked]:bg-black"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionManager />
        </TabsContent>
      </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {saving ? (
              <>
                <BlueprintIcon icon="refresh" size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <BlueprintIcon icon="floppy-disk" size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}