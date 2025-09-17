'use client'

import { useState, useEffect, useCallback } from 'react'
import { Feature, AccountType, hasFeature, getLimit, canAccessDashboardSection } from '@/lib/account-types'

export interface UserFeatures {
  accountType: AccountType
  features: Record<Feature, boolean>
  limits: {
    lookupsPerDay?: number
    lookupsPerMonth?: number
    apiCreditsPerMonth?: number
    maxMonitoringTargets?: number
    maxTeamMembers?: number
    dataRetentionDays?: number
  }
  usage: {
    lookupsToday: number
    lookupsThisMonth: number
    apiCreditsUsed: number
    monitoringTargets: number
  }
}

/**
 * Hook to access user features and subscription data
 */
export function useFeatures() {
  const [features, setFeatures] = useState<UserFeatures | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/features')
      
      if (!response.ok) {
        throw new Error('Failed to fetch user features')
      }
      
      const data = await response.json()
      setFeatures(data)
    } catch (err) {
      console.error('Error fetching features:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  const checkFeature = useCallback(
    (feature: Feature): boolean => {
      if (!features) return false
      return features.features[feature] || false
    },
    [features]
  )

  const checkLimit = useCallback(
    (limitKey: keyof UserFeatures['limits']): number => {
      if (!features) return 0
      return features.limits[limitKey] || 0
    },
    [features]
  )

  const getRemainingLimit = useCallback(
    (limitType: 'lookups' | 'apiCredits' | 'monitoringTargets'): number => {
      if (!features) return 0
      
      switch (limitType) {
        case 'lookups':
          if (features.limits.lookupsPerDay && features.limits.lookupsPerDay !== -1) {
            return Math.max(0, features.limits.lookupsPerDay - features.usage.lookupsToday)
          }
          if (features.limits.lookupsPerMonth && features.limits.lookupsPerMonth !== -1) {
            return Math.max(0, features.limits.lookupsPerMonth - features.usage.lookupsThisMonth)
          }
          return -1 // Unlimited
          
        case 'apiCredits':
          if (features.limits.apiCreditsPerMonth && features.limits.apiCreditsPerMonth !== -1) {
            return Math.max(0, features.limits.apiCreditsPerMonth - features.usage.apiCreditsUsed)
          }
          return -1 // Unlimited
          
        case 'monitoringTargets':
          if (features.limits.maxMonitoringTargets && features.limits.maxMonitoringTargets !== -1) {
            return Math.max(0, features.limits.maxMonitoringTargets - features.usage.monitoringTargets)
          }
          return -1 // Unlimited
          
        default:
          return 0
      }
    },
    [features]
  )

  const canAccessSection = useCallback(
    (section: 'search' | 'monitoring' | 'data' | 'users' | 'settings'): boolean => {
      if (!features) return false
      return canAccessDashboardSection(features.accountType, section)
    },
    [features]
  )

  return {
    features,
    loading,
    error,
    checkFeature,
    checkLimit,
    getRemainingLimit,
    canAccessSection,
    refetch: fetchFeatures,
  }
}

/**
 * Hook for a single feature check
 */
export function useFeature(feature: Feature) {
  const { features, loading, checkFeature } = useFeatures()
  
  return {
    hasFeature: checkFeature(feature),
    loading,
    accountType: features?.accountType,
  }
}

/**
 * Hook to check if user needs to upgrade
 */
export function useUpgradePrompt() {
  const { features, loading } = useFeatures()
  const [showPrompt, setShowPrompt] = useState(false)
  const [promptMessage, setPromptMessage] = useState('')

  const checkUpgradeNeeded = useCallback(
    (requiredFeature?: Feature, action?: string) => {
      if (!features) return false
      
      if (requiredFeature && !features.features[requiredFeature]) {
        setPromptMessage(
          action 
            ? `Upgrade to access ${action}` 
            : 'This feature requires a subscription upgrade'
        )
        setShowPrompt(true)
        return true
      }
      
      // Check if any limit is close to being reached
      const lookupLimit = features.limits.lookupsPerDay || features.limits.lookupsPerMonth
      if (lookupLimit && lookupLimit !== -1) {
        const remaining = features.limits.lookupsPerDay 
          ? features.limits.lookupsPerDay - features.usage.lookupsToday
          : features.limits.lookupsPerMonth! - features.usage.lookupsThisMonth
        
        if (remaining < lookupLimit * 0.1) { // Less than 10% remaining
          setPromptMessage(`You're running low on lookups. Upgrade for unlimited access!`)
          setShowPrompt(true)
          return true
        }
      }
      
      return false
    },
    [features]
  )

  return {
    showPrompt,
    promptMessage,
    checkUpgradeNeeded,
    hidePrompt: () => setShowPrompt(false),
    accountType: features?.accountType,
  }
}
