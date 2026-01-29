'use client'

import { useFeatures } from '@/hooks/useFeatures'
import { AccountType } from '@/lib/account-types'
import { BlueprintIcon } from '@/components/ui/blueprint-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

export function SubscriptionStatus() {
  const { features, loading } = useFeatures()
  const router = useRouter()

  if (loading || !features) {
    return (
      <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/10">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-neutral-800 rounded w-1/3"></div>
            <div className="h-8 bg-neutral-800 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getIcon = (accountType: AccountType) => {
    switch (accountType) {
      case AccountType.STARTER:
        return <BlueprintIcon icon="shield" size={24} />
      case AccountType.PROFESSIONAL:
        return <BlueprintIcon icon="lightning" size={24} />
      case AccountType.ENTERPRISE:
        return <BlueprintIcon icon="office" size={24} />
      default:
        return <BlueprintIcon icon="shield" size={24} />
    }
  }

  const getPlanColor = (accountType: AccountType) => {
    switch (accountType) {
      case AccountType.FREE:
        return 'bg-neutral-500'
      case AccountType.STARTER:
        return 'bg-blue-500'
      case AccountType.PROFESSIONAL:
        return 'bg-purple-500'
      case AccountType.ENTERPRISE:
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
      default:
        return 'bg-neutral-500'
    }
  }

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0 // Unlimited
    if (limit === 0) return 100
    return Math.min((used / limit) * 100, 100)
  }

  return (
    <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getPlanColor(features.accountType)}/20`}>
              <div className={`text-white`}>
                {getIcon(features.accountType)}
              </div>
            </div>
            <div>
              <CardTitle className="text-white">
                {features.accountType.charAt(0).toUpperCase() + features.accountType.slice(1)} Plan
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Your current subscription
              </CardDescription>
            </div>
          </div>
          {features.accountType !== AccountType.ENTERPRISE && (
            <Button
              onClick={() => router.push('/pricing')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Upgrade
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Usage Stats */}
        <div className="space-y-3">
          {/* Lookups Usage */}
          {features.limits.lookupsPerDay && features.limits.lookupsPerDay !== -1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Daily Lookups</span>
                <span className="text-white">
                  {features.usage.lookupsToday} / {features.limits.lookupsPerDay}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(features.usage.lookupsToday, features.limits.lookupsPerDay)}
                className="h-2 bg-neutral-800"
              />
            </div>
          )}
          
          {/* API Credits */}
          {features.limits.apiCreditsPerMonth && features.limits.apiCreditsPerMonth !== -1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">API Credits</span>
                <span className="text-white">
                  {features.usage.apiCreditsUsed} / {features.limits.apiCreditsPerMonth}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(features.usage.apiCreditsUsed, features.limits.apiCreditsPerMonth)}
                className="h-2 bg-neutral-800"
              />
            </div>
          )}
          
          {/* Monitoring Targets */}
          {features.limits.maxMonitoringTargets && features.limits.maxMonitoringTargets !== -1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Monitoring Targets</span>
                <span className="text-white">
                  {features.usage.monitoringTargets} / {features.limits.maxMonitoringTargets}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(features.usage.monitoringTargets, features.limits.maxMonitoringTargets)}
                className="h-2 bg-neutral-800"
              />
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-sm text-neutral-400 mb-3">Active Features</p>
          <div className="flex flex-wrap gap-2">
            {features.features.search && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <BlueprintIcon icon="tick-circle" size={12} className="mr-1" />
                Search
              </Badge>
            )}
            {features.features.data_export && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <BlueprintIcon icon="tick-circle" size={12} className="mr-1" />
                Export
              </Badge>
            )}
            {features.features.credential_monitoring && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <BlueprintIcon icon="tick-circle" size={12} className="mr-1" />
                Monitoring
              </Badge>
            )}
            {features.features.api_access && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <BlueprintIcon icon="tick-circle" size={12} className="mr-1" />
                API
              </Badge>
            )}
          </div>
        </div>

        {/* Upgrade Prompt for Free/Starter */}
        {(features.accountType === AccountType.FREE || features.accountType === AccountType.STARTER) && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-start gap-2">
              <BlueprintIcon icon="error" size={16} className="text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-400 font-medium">
                  Unlock more features
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  {features.accountType === AccountType.FREE 
                    ? 'Upgrade to Starter for data exports and more lookups'
                    : 'Upgrade to Professional for unlimited lookups and API access'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
