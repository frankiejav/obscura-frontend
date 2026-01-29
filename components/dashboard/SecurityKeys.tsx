"use client"

import { useState, useEffect } from 'react'
import { BlueprintIcon } from '@/components/ui/blueprint-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  startRegistration, 
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable 
} from '@simplewebauthn/browser'

interface Credential {
  id: string
  credentialId: string
  name: string
  deviceType: 'platform' | 'cross-platform'
  transports: string[]
  createdAt: string
  lastUsedAt?: string
}

export default function SecurityKeys() {
  const { toast } = useToast()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [webAuthnSupported, setWebAuthnSupported] = useState(false)
  const [platformAvailable, setPlatformAvailable] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [authenticatorType, setAuthenticatorType] = useState<'any' | 'platform' | 'cross-platform'>('any')

  useEffect(() => {
    checkWebAuthnSupport()
    fetchCredentials()
  }, [])

  const checkWebAuthnSupport = async () => {
    const supported = browserSupportsWebAuthn()
    setWebAuthnSupported(supported)
    
    if (supported) {
      const platformAuth = await platformAuthenticatorIsAvailable()
      setPlatformAvailable(platformAuth)
    }
  }

  const fetchCredentials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/webauthn/credentials')
      if (response.ok) {
        const data = await response.json()
        setCredentials(data.credentials || [])
      }
    } catch (error) {
      console.error('Failed to fetch credentials:', error)
      toast({
        title: 'Error',
        description: 'Failed to load security keys',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!webAuthnSupported) {
      toast({
        title: 'Not Supported',
        description: 'Your browser does not support security keys',
        variant: 'destructive',
      })
      return
    }

    setRegistering(true)
    try {
      const optionsResponse = await fetch('/api/auth/webauthn/register')
      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options')
      }
      
      const options = await optionsResponse.json()
      
      if (authenticatorType !== 'any') {
        options.authenticatorSelection = {
          ...options.authenticatorSelection,
          authenticatorAttachment: authenticatorType === 'platform' ? 'platform' : 'cross-platform',
        }
      }

      const credential = await startRegistration({ optionsJSON: options })

      const verifyResponse = await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...credential,
          name: newKeyName || getDefaultKeyName(
            credential.response.transports,
            authenticatorType
          ),
        }),
      })

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json()
        throw new Error(error.error || 'Failed to register security key')
      }
      
      toast({
        title: 'Success',
        description: 'Security key registered successfully',
      })

      setRegisterDialogOpen(false)
      setNewKeyName('')
      setAuthenticatorType('any')
      fetchCredentials()
    } catch (error: any) {
      console.error('Registration error:', error)
      
      if (error.name === 'NotAllowedError') {
        toast({
          title: 'Cancelled',
          description: 'Security key registration was cancelled',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to register security key',
          variant: 'destructive',
        })
      }
    } finally {
      setRegistering(false)
    }
  }

  const getDefaultKeyName = (transports?: string[], authType?: string): string => {
    if (authType === 'platform') {
      return 'Built-in Authenticator'
    }
    if (transports?.includes('usb')) {
      return 'Security Key (USB)'
    }
    if (transports?.includes('nfc')) {
      return 'Security Key (NFC)'
    }
    if (transports?.includes('ble')) {
      return 'Security Key (Bluetooth)'
    }
    if (transports?.includes('hybrid')) {
      return 'Phone/Tablet'
    }
    return 'Security Key'
  }

  const handleRename = async (credentialId: string) => {
    if (!editName.trim()) return

    try {
      const response = await fetch('/api/auth/webauthn/credentials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId, name: editName }),
      })

      if (response.ok) {
        setCredentials(prev =>
          prev.map(c =>
            c.credentialId === credentialId ? { ...c, name: editName } : c
          )
        )
        toast({
          title: 'Success',
          description: 'Security key renamed',
        })
      } else {
        throw new Error('Failed to rename')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to rename security key',
        variant: 'destructive',
      })
    } finally {
      setEditingId(null)
      setEditName('')
    }
  }

  const handleDelete = async (credentialId: string) => {
    try {
      const response = await fetch(
        `/api/auth/webauthn/credentials?credentialId=${encodeURIComponent(credentialId)}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setCredentials(prev => prev.filter(c => c.credentialId !== credentialId))
        toast({
          title: 'Success',
          description: 'Security key removed',
        })
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove security key',
        variant: 'destructive',
      })
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const getDeviceIcon = (deviceType: string, transports: string[]) => {
    if (deviceType === 'platform') {
      return <BlueprintIcon icon="hand" size={20} />
    }
    if (transports?.includes('usb')) {
      return <BlueprintIcon icon="usb" size={20} />
    }
    if (transports?.includes('hybrid') || transports?.includes('ble')) {
      return <BlueprintIcon icon="mobile-phone" size={20} />
    }
    return <BlueprintIcon icon="key" size={20} />
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <Card className="bg-neutral-900/60 backdrop-blur-sm border-white/10">
        <CardContent className="flex items-center justify-center py-12">
          <BlueprintIcon icon="refresh" size={32} className="animate-spin text-white/60" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-neutral-900/60 backdrop-blur-sm border-white/10">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <BlueprintIcon icon="shield" size={20} />
              Security Keys
            </CardTitle>
            <CardDescription className="text-neutral-400 mt-1">
              Add hardware security keys like YubiKey for stronger authentication
            </CardDescription>
          </div>
          
          <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-white text-black hover:bg-neutral-200"
                disabled={!webAuthnSupported}
              >
                <BlueprintIcon icon="plus" size={16} className="mr-2" />
                Add Security Key
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Register Security Key</DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Add a hardware security key like YubiKey, or use your device's built-in authenticator
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName" className="text-white">
                    Key Name (optional)
                  </Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., My YubiKey"
                    className="bg-neutral-800 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Authenticator Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={authenticatorType === 'any' ? 'default' : 'outline'}
                      onClick={() => setAuthenticatorType('any')}
                      className={authenticatorType === 'any' 
                        ? 'bg-white text-black' 
                        : 'border-white/20 text-white hover:bg-white/10'
                      }
                    >
                      Any
                    </Button>
                    <Button
                      type="button"
                      variant={authenticatorType === 'cross-platform' ? 'default' : 'outline'}
                      onClick={() => setAuthenticatorType('cross-platform')}
                      className={authenticatorType === 'cross-platform' 
                        ? 'bg-white text-black' 
                        : 'border-white/20 text-white hover:bg-white/10'
                      }
                    >
                      <BlueprintIcon icon="usb" size={16} className="mr-1" />
                      USB Key
                    </Button>
                    <Button
                      type="button"
                      variant={authenticatorType === 'platform' ? 'default' : 'outline'}
                      onClick={() => setAuthenticatorType('platform')}
                      disabled={!platformAvailable}
                      className={authenticatorType === 'platform' 
                        ? 'bg-white text-black' 
                        : 'border-white/20 text-white hover:bg-white/10 disabled:opacity-50'
                      }
                    >
                      <BlueprintIcon icon="hand" size={16} className="mr-1" />
                      Built-in
                    </Button>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {authenticatorType === 'cross-platform' 
                      ? 'YubiKey, Titan Key, or other USB/NFC security keys'
                      : authenticatorType === 'platform'
                      ? 'Touch ID, Face ID, Windows Hello, or Android biometrics'
                      : 'Let your browser choose the best option'
                    }
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRegisterDialogOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRegister}
                  disabled={registering}
                  className="bg-white text-black hover:bg-neutral-200"
                >
                  {registering ? (
                    <>
                      <BlueprintIcon icon="refresh" size={16} className="mr-2 animate-spin" />
                      Waiting for key...
                    </>
                  ) : (
                    <>
                      <BlueprintIcon icon="key" size={16} className="mr-2" />
                      Register Key
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {!webAuthnSupported && (
          <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/30">
            <BlueprintIcon icon="error" size={16} className="text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              Your browser does not support security keys. Please use a modern browser like Chrome, Firefox, Safari, or Edge.
            </AlertDescription>
          </Alert>
        )}

        {credentials.length === 0 ? (
          <div className="text-center py-8">
            <BlueprintIcon icon="key" size={48} className="text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 mb-2">No security keys registered</p>
            <p className="text-neutral-500 text-sm">
              Add a hardware security key for stronger account protection
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/10 rounded-lg text-white">
                    {getDeviceIcon(credential.deviceType, credential.transports)}
                  </div>
                  <div>
                    {editingId === credential.credentialId ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 w-48 bg-neutral-700 border-white/20 text-white"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRename(credential.credentialId)}
                          className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        >
                          <BlueprintIcon icon="tick" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null)
                            setEditName('')
                          }}
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-white/10"
                        >
                          <BlueprintIcon icon="cross" size={16} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-white">{credential.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className="text-xs border-white/20 text-neutral-400"
                          >
                            {credential.deviceType === 'platform' ? 'Built-in' : 'External'}
                          </Badge>
                          <span className="text-xs text-neutral-500">
                            Added {formatDate(credential.createdAt)}
                          </span>
                          {credential.lastUsedAt && (
                            <span className="text-xs text-neutral-500">
                              Last used {formatDate(credential.lastUsedAt)}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {editingId !== credential.credentialId && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(credential.credentialId)
                        setEditName(credential.name)
                      }}
                      className="text-neutral-400 hover:text-white hover:bg-white/10"
                    >
                      <BlueprintIcon icon="edit" size={16} />
                    </Button>
                    
                    {deleteConfirmId === credential.credentialId ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(credential.credentialId)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <BlueprintIcon icon="tick" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-neutral-400 hover:text-white hover:bg-white/10"
                        >
                          <BlueprintIcon icon="cross" size={16} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirmId(credential.credentialId)}
                        className="text-neutral-400 hover:text-red-500 hover:bg-red-500/10"
                        disabled={credentials.length <= 1}
                      >
                        <BlueprintIcon icon="trash" size={16} />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-neutral-800/30 rounded-lg border border-white/5">
          <h4 className="text-sm font-medium text-white mb-2">Supported Authenticators</h4>
          <ul className="text-xs text-neutral-400 space-y-1">
            <li className="flex items-center gap-2">
              <BlueprintIcon icon="usb" size={12} /> YubiKey, Google Titan, Feitian, and other FIDO2 keys
            </li>
            <li className="flex items-center gap-2">
              <BlueprintIcon icon="hand" size={12} /> Touch ID, Face ID, Windows Hello
            </li>
            <li className="flex items-center gap-2">
              <BlueprintIcon icon="mobile-phone" size={12} /> Phone passkeys via QR code
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
