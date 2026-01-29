/**
 * WebAuthn/FIDO Types and Utilities
 * Used alongside @simplewebauthn/browser and @simplewebauthn/server
 */

export interface WebAuthnCredential {
  id: string
  credentialId: string
  publicKey: string
  counter: number
  deviceType: 'platform' | 'cross-platform'
  transports?: string[]
  name: string
  createdAt: Date
  lastUsedAt?: Date
  backedUp?: boolean
}

export interface StoredCredential {
  userId: string
  credentialId: string
  publicKey: Uint8Array
  counter: number
  transports?: AuthenticatorTransport[]
}

export function getDeviceTypeFromTransports(transports?: string[]): 'platform' | 'cross-platform' {
  if (!transports || transports.length === 0) {
    return 'cross-platform'
  }
  
  const platformIndicators = ['internal']
  
  if (transports.some(t => platformIndicators.includes(t))) {
    return 'platform'
  }
  
  return 'cross-platform'
}

export function getAuthenticatorDisplayName(deviceType: string, transports?: string[]): string {
  if (deviceType === 'platform') {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase()
      if (ua.includes('mac')) return 'Touch ID'
      if (ua.includes('iphone') || ua.includes('ipad')) return 'Face ID / Touch ID'
      if (ua.includes('windows')) return 'Windows Hello'
      if (ua.includes('android')) return 'Android Biometric'
    }
    return 'Built-in Authenticator'
  }
  
  if (transports?.includes('usb')) {
    return 'USB Security Key'
  }
  if (transports?.includes('nfc')) {
    return 'NFC Security Key'
  }
  if (transports?.includes('ble')) {
    return 'Bluetooth Security Key'
  }
  if (transports?.includes('hybrid')) {
    return 'Phone/Tablet Passkey'
  }
  
  return 'Security Key'
}

export function formatCredentialDate(dateString?: string | Date): string {
  if (!dateString) return 'Never'
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function base64UrlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(paddedBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
