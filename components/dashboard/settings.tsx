"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

interface Settings {
  general: {
    apiUrl: string
    defaultPageSize: string
    theme: string
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: string
    ipWhitelist: string
    enforceStrongPasswords: boolean
  }
  notifications: {
    emailAlerts: boolean
    dailySummary: boolean
    securityAlerts: boolean
    dataUpdates: boolean
  }
  api: {
    rateLimit: string
    tokenExpiration: string
    logLevel: string
  }
  leakCheck: {
    enabled: boolean
    quota: number
    lastSync: string | null
  }
}

const defaultSettings: Settings = {
  general: {
    apiUrl: "https://api.obscuralabs.io",
    defaultPageSize: "10",
    theme: "dark",
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: "30",
    ipWhitelist: "",
    enforceStrongPasswords: true,
  },
  notifications: {
    emailAlerts: true,
    dailySummary: false,
    securityAlerts: true,
    dataUpdates: false,
  },
  api: {
    rateLimit: "1000",
    tokenExpiration: "24",
    logLevel: "info",
  },
  leakCheck: {
    enabled: !!process.env.LEAKCHECK_API_KEY,
    quota: 400,
    lastSync: null,
  },
}

export function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // For now, use default settings
    // In a real implementation, you'd fetch from a REST API
    setSettings(defaultSettings)
  }, [])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, you'd save to a REST API
      // For now, just show success message
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = user?.role === "admin"
  const availableTabs = isAdmin ? ["general", "security", "notifications", "api", "leakcheck"] : ["general", "security", "notifications"]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your application settings and preferences.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-3'}`}>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isAdmin && <TabsTrigger value="api">API</TabsTrigger>}
          {isAdmin && <TabsTrigger value="leakcheck">LeakCheck</TabsTrigger>}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general application settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-url">API URL</Label>
                <Input
                  id="api-url"
                  value={settings.general.apiUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        apiUrl: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-size">Default Page Size</Label>
                <Select
                  value={settings.general.defaultPageSize}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        defaultPageSize: value,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.general.theme}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        theme: value,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable two-factor authentication for enhanced security.
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        twoFactorAuth: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        sessionTimeout: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                <Input
                  id="ip-whitelist"
                  placeholder="192.168.1.1, 10.0.0.0/8"
                  value={settings.security.ipWhitelist}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        ipWhitelist: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enforce Strong Passwords</Label>
                  <p className="text-sm text-muted-foreground">
                    Require strong passwords for all users.
                  </p>
                </div>
                <Switch
                  checked={settings.security.enforceStrongPasswords}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        enforceStrongPasswords: checked,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email and system notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important events.
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        emailAlerts: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily summary emails.
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.dailySummary}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        dailySummary: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive immediate security alerts.
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.securityAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        securityAlerts: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when data is updated.
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.dataUpdates}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        dataUpdates: checked,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>Configure API rate limits and token settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Rate Limit (requests per hour)</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={settings.api.rateLimit}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        api: {
                          ...settings.api,
                          rateLimit: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-expiration">Token Expiration (hours)</Label>
                  <Input
                    id="token-expiration"
                    type="number"
                    value={settings.api.tokenExpiration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        api: {
                          ...settings.api,
                          tokenExpiration: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-level">Log Level</Label>
                  <Select
                    value={settings.api.logLevel}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        api: {
                          ...settings.api,
                          logLevel: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="leakcheck">
            <Card>
              <CardHeader>
                <CardTitle>LeakCheck Settings</CardTitle>
                <CardDescription>Configure LeakCheck API integration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable LeakCheck</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable LeakCheck API integration for breach data.
                    </p>
                  </div>
                  <Switch
                    checked={settings.leakCheck.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        leakCheck: {
                          ...settings.leakCheck,
                          enabled: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quota">API Quota</Label>
                  <Input
                    id="quota"
                    type="number"
                    value={settings.leakCheck.quota}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        leakCheck: {
                          ...settings.leakCheck,
                          quota: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                {settings.leakCheck.lastSync && (
                  <div className="space-y-2">
                    <Label>Last Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(settings.leakCheck.lastSync).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
