'use client'

import { AlertCircle, Lock, Eye, EyeOff, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface RedactionNoticeProps {
  type?: 'inline' | 'banner' | 'tooltip'
  compact?: boolean
}

/**
 * Shows a notice when data has been redacted for free accounts
 */
export function RedactionNotice({ type = 'banner', compact = false }: RedactionNoticeProps) {
  const router = useRouter()
  
  if (type === 'inline') {
    return (
      <div className="inline-flex items-center gap-1 text-xs text-neutral-500">
        <Lock className="h-3 w-3" />
        <span>Redacted</span>
      </div>
    )
  }
  
  if (type === 'tooltip') {
    return (
      <div className="p-2 bg-neutral-900 rounded-md border border-white/10 text-xs">
        <div className="flex items-center gap-2 text-yellow-400">
          <Lock className="h-3 w-3" />
          <span>Data redacted for demo account</span>
        </div>
        <p className="text-neutral-400 mt-1">
          Upgrade to view full data
        </p>
      </div>
    )
  }
  
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
        <div className="flex items-center gap-2">
          <EyeOff className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-yellow-400">
            Sensitive data redacted • Free account
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30"
          onClick={() => router.push('/pricing')}
        >
          Upgrade
        </Button>
      </div>
    )
  }
  
  return (
    <Alert className="bg-yellow-900/20 border-yellow-500/30">
      <AlertCircle className="h-5 w-5 text-yellow-400" />
      <AlertDescription className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-yellow-400 font-medium mb-1">
            Sensitive Data Redacted
          </p>
          <p className="text-neutral-300 text-sm">
            Passwords, cookies, and tokens are hidden for demo/free accounts. 
            Upgrade to access complete breach data and credentials.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-4 border-yellow-500/50 text-yellow-400 hover:bg-yellow-900/30"
          onClick={() => router.push('/pricing')}
        >
          <Zap className="mr-2 h-4 w-4" />
          View Plans
        </Button>
      </AlertDescription>
    </Alert>
  )
}

interface RedactedFieldProps {
  value: string
  label?: string
  isPassword?: boolean
  showToggle?: boolean
}

/**
 * Component to display a redacted field with visual indication
 */
export function RedactedField({ 
  value, 
  label, 
  isPassword = false,
  showToggle = false 
}: RedactedFieldProps) {
  const [showHint, setShowHint] = useState(false)
  const router = useRouter()
  
  const displayValue = isPassword ? '••••••••' : value
  
  return (
    <div className="relative inline-flex items-center gap-2">
      {label && (
        <span className="text-sm text-neutral-400">{label}:</span>
      )}
      
      <div className="relative">
        <span className={`font-mono text-sm ${
          isPassword ? 'text-neutral-500' : 'text-neutral-400'
        }`}>
          {displayValue}
        </span>
        
        {/* Redaction indicator */}
        <Badge 
          variant="secondary" 
          className="ml-2 bg-yellow-900/30 text-yellow-400 border-yellow-500/30 text-xs"
        >
          <Lock className="h-3 w-3 mr-1" />
          Redacted
        </Badge>
      </div>
      
      {showToggle && (
        <button
          onClick={() => setShowHint(!showHint)}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          {showHint ? (
            <EyeOff className="h-4 w-4 text-neutral-400" />
          ) : (
            <Eye className="h-4 w-4 text-neutral-400" />
          )}
        </button>
      )}
      
      {showHint && (
        <div className="absolute left-0 top-full mt-2 z-10 p-3 bg-neutral-900 rounded-lg border border-white/10 shadow-xl">
          <p className="text-xs text-neutral-400 mb-2">
            This data is hidden for free accounts
          </p>
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-white/20 hover:bg-white/10"
            onClick={() => router.push('/pricing')}
          >
            Upgrade to View
          </Button>
        </div>
      )}
    </div>
  )
}

interface RedactionStatsProps {
  totalRedacted: number
  fieldsRedacted: string[]
}

/**
 * Shows statistics about redacted data
 */
export function RedactionStats({ totalRedacted, fieldsRedacted }: RedactionStatsProps) {
  return (
    <div className="p-4 bg-neutral-900/60 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Data Protection Active</h3>
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          Free Account
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-neutral-500">Fields Protected</p>
          <p className="text-white font-medium">{fieldsRedacted.length}</p>
        </div>
        <div>
          <p className="text-neutral-500">Items Redacted</p>
          <p className="text-white font-medium">{totalRedacted}</p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-xs text-neutral-400">
          Protected fields: {fieldsRedacted.join(', ')}
        </p>
      </div>
    </div>
  )
}

/**
 * Inline badge to show when a result has redacted data
 */
export function RedactedBadge() {
  return (
    <Badge 
      variant="outline" 
      className="bg-yellow-900/20 text-yellow-400 border-yellow-500/30"
    >
      <EyeOff className="h-3 w-3 mr-1" />
      Redacted
    </Badge>
  )
}
