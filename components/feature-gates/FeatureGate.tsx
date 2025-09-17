'use client'

import { ReactNode } from 'react'
import { useFeature, useUpgradePrompt } from '@/hooks/useFeatures'
import { Feature, AccountType } from '@/lib/account-types'
import { Lock, AlertCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'

interface FeatureGateProps {
  feature: Feature
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
  minimumPlan?: AccountType
}

/**
 * Component that conditionally renders content based on feature availability
 */
export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showUpgradePrompt = true,
}: FeatureGateProps) {
  const { hasFeature, loading, accountType } = useFeature(feature)
  const router = useRouter()

  if (loading) {
    return <div className="animate-pulse bg-neutral-800 rounded h-20 w-full" />
  }

  if (hasFeature) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showUpgradePrompt) {
    return (
      <UpgradePrompt 
        feature={feature}
        currentPlan={accountType || AccountType.FREE}
      />
    )
  }

  return null
}

interface UpgradePromptProps {
  feature: Feature
  currentPlan: AccountType
  compact?: boolean
}

/**
 * Upgrade prompt component
 */
export function UpgradePrompt({ feature, currentPlan, compact = false }: UpgradePromptProps) {
  const router = useRouter()

  const getRequiredPlan = (feature: Feature): string => {
    const plans: Record<Feature, string> = {
      [Feature.DATA_EXPORT]: 'Starter',
      [Feature.CREDENTIAL_MONITORING]: 'Professional',
      [Feature.API_ACCESS]: 'Professional',
      [Feature.REALTIME_FEEDS]: 'Enterprise',
      [Feature.CUSTOM_ANALYTICS]: 'Enterprise',
      [Feature.USER_MANAGEMENT]: 'Professional',
      [Feature.TEAM_COLLABORATION]: 'Professional',
      [Feature.PRIORITY_SUPPORT]: 'Professional',
      [Feature.DEDICATED_SUPPORT]: 'Enterprise',
      [Feature.DASHBOARD_ACCESS]: 'Free',
      [Feature.SEARCH]: 'Free',
    }
    return plans[feature] || 'Professional'
  }

  const requiredPlan = getRequiredPlan(feature)

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-neutral-900/60 rounded-lg border border-white/10">
        <Lock className="h-4 w-4 text-neutral-400" />
        <span className="text-sm text-neutral-400">
          Requires {requiredPlan} plan
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto text-xs hover:bg-white/10"
          onClick={() => router.push('/pricing')}
        >
          Upgrade
        </Button>
      </div>
    )
  }

  return (
    <div className="p-8 bg-neutral-900/60 backdrop-blur-xl rounded-xl border border-white/10">
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        <div className="p-4 bg-white/10 rounded-2xl mb-4">
          <Lock className="h-8 w-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          Upgrade Required
        </h3>
        
        <p className="text-neutral-400 mb-6">
          This feature requires a {requiredPlan} plan or higher.
          You're currently on the {currentPlan} plan.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={() => router.push('/pricing')}
            className="bg-white text-black hover:bg-neutral-200"
          >
            <Zap className="mr-2 h-4 w-4" />
            View Plans
          </Button>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => router.push('/contact')}
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Usage limit warning component
 */
export function UsageLimitWarning({ 
  used, 
  limit, 
  type 
}: { 
  used: number
  limit: number
  type: 'lookups' | 'apiCredits' | 'monitoringTargets' 
}) {
  const percentage = limit > 0 ? (used / limit) * 100 : 0
  const remaining = limit - used
  
  if (limit === -1) return null // Unlimited
  if (percentage < 80) return null // Only show when approaching limit
  
  const isExceeded = percentage >= 100
  
  return (
    <Alert className={`${
      isExceeded 
        ? 'bg-red-900/20 border-red-500/30' 
        : 'bg-yellow-900/20 border-yellow-500/30'
    }`}>
      <AlertCircle className={`h-4 w-4 ${
        isExceeded ? 'text-red-400' : 'text-yellow-400'
      }`} />
      <AlertDescription className={
        isExceeded ? 'text-red-400' : 'text-yellow-400'
      }>
        {isExceeded ? (
          <>You've reached your {type} limit ({limit}). Upgrade to continue.</>
        ) : (
          <>You have {remaining} {type} remaining out of {limit}.</>
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Feature badge component
 */
export function FeatureBadge({ 
  available, 
  label 
}: { 
  available: boolean
  label: string 
}) {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      available 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-neutral-800 text-neutral-500'
    }`}>
      {available ? (
        <Zap className="h-3 w-3" />
      ) : (
        <Lock className="h-3 w-3" />
      )}
      {label}
    </div>
  )
}
