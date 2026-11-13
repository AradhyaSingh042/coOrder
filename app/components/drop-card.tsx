'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock } from 'lucide-react'
import type { Drop } from '@/lib/store'
import { formatTimeLeft, formatCurrency, platformConfig, cn } from '@/lib/utils'

interface DropCardProps {
  drop: Drop
  currentUserId?: string
  onJoin: (dropId: string) => void
}

function getDistance(drop: Drop): string {
  if (drop.pickupLocation.includes('150m') || drop.platform === 'zepto') return '150m away'
  if (drop.pickupLocation.includes('320m') || drop.platform === 'blinkit') return '320m away'
  if (drop.pickupLocation.includes('480m') || drop.platform === 'zomato') return '480m away'
  return '250m away'
}

export default function DropCard({ drop, currentUserId, onJoin }: DropCardProps) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(drop.expiresAt))

  useEffect(() => {
    setTimeLeft(formatTimeLeft(drop.expiresAt))
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(drop.expiresAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [drop.expiresAt])

  const platform = platformConfig[drop.platform]
  const totalCost = drop.items.reduce((sum, item) => sum + item.estimatedCost, 0)
  const isJoined = currentUserId ? drop.members.includes(currentUserId) : false
  const isHost = currentUserId ? drop.hostId === currentUserId : false
  const distance = getDistance(drop)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/90 p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Top row: Platform badge + distance + live timer pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs font-bold px-2.5 py-0.5 rounded-full capitalize',
              platform.badgeBg,
              platform.badgeText
            )}
          >
            {platform.label}
          </span>
          <span className="text-xs text-gray-500 font-medium">{distance}</span>
        </div>

        {/* Timer pill */}
        <div className="flex items-center gap-1 bg-red-50 text-red-500 border border-red-100/80 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3 text-red-500" />
          <span className="text-[11px] font-semibold tabular-nums tracking-tight">
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Host row */}
      <div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">
            Started by <span className="text-gray-900 font-bold">{drop.hostName}</span>
          </span>
          <span className="text-[10px] font-medium bg-amber-100/80 text-amber-800 px-1.5 py-0.5 rounded">
            Top Neighbor
          </span>
          {isHost && (
            <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
              You (Host)
            </span>
          )}
        </div>

        {/* Pickup location */}
        <div className="flex items-center gap-1 text-gray-500 mt-1">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500 truncate">{drop.pickupLocation}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
          <span>
            <strong className="font-semibold text-gray-800">{drop.members.length}</strong> neighbors joined (
            <strong className="font-semibold text-gray-800">{drop.items.length}</strong> items)
          </span>
        </div>
        <div className="text-xs font-bold text-gray-900">
          Total: {formatCurrency(totalCost)}
        </div>
      </div>

      {/* Join CTA button matching Mockup 2 */}
      <button
        type="button"
        onClick={() => onJoin(drop.id)}
        className={cn(
          'w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all',
          isJoined || isHost
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-[#F95919] hover:bg-[#E54807] text-white'
        )}
      >
        <span>{isHost ? 'Manage Drop Room →' : isJoined ? 'Enter Drop Room →' : 'Join Drop →'}</span>
      </button>
    </div>
  )
}
