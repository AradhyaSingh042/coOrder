'use client'

import { useState } from 'react'
import { X, Clock, MapPin, Zap } from 'lucide-react'
import type { Platform } from '@/lib/store'
import { platformConfig, cn } from '@/lib/utils'

interface CreateDropModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { platform: Platform; waitMinutes: number; pickupLocation: string }) => void
  building?: string
}

const platforms: Platform[] = ['zepto', 'blinkit', 'zomato']
const waitOptions = [10, 15, 20] as const

export default function CreateDropModal({
  isOpen,
  onClose,
  onSubmit,
  building = 'Tower B Lobby',
}: CreateDropModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('zepto')
  const [waitMinutes, setWaitMinutes] = useState<number>(15)
  const [pickupLocation, setPickupLocation] = useState('Tower B Lobby')

  if (!isOpen) return null

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!pickupLocation.trim()) return
    onSubmit({
      platform: selectedPlatform,
      waitMinutes,
      pickupLocation: pickupLocation.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal sheet matching Mockup 4 */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-5 pt-2 pb-6 space-y-5">
          {/* Title & Subtitle */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Start a New Drop
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Become the host & broadcast to neighbors nearby
            </p>
          </div>

          {/* 1. SELECT PLATFORM */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
              1. SELECT PLATFORM
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              {platforms.map((p) => {
                const config = platformConfig[p]
                const isSelected = selectedPlatform === p

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPlatform(p)}
                    className={cn(
                      'flex flex-col items-center justify-center py-3 px-2 rounded-2xl border-2 transition-all cursor-pointer',
                      isSelected
                        ? 'border-orange-500 bg-orange-50/20 shadow-xs ring-1 ring-orange-500/20'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    )}
                  >
                    {/* Circle logo with letter */}
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shadow-xs mb-1.5',
                        config.accentBg,
                        config.accentText
                      )}
                    >
                      {config.letter}
                    </div>
                    <span className="text-xs font-bold text-gray-900">{config.label}</span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Split ₹{config.splitSaving}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. WAIT TIME FOR NEIGHBORS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                2. WAIT TIME FOR NEIGHBORS
              </span>
              <span className="text-[10px] text-gray-400">Cart locks automatically</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {waitOptions.map((mins) => {
                const isSelected = waitMinutes === mins
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setWaitMinutes(mins)}
                    className={cn(
                      'py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[#0F172A] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{mins}m</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. EXACT PICKUP LOCATION */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
              3. EXACT PICKUP LOCATION
            </span>

            <div className="relative">
              <input
                type="text"
                placeholder="Tower B Lobby"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <MapPin className="w-4 h-4 text-pink-500" />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 pl-0.5">
              Neighbors will meet you here to collect their items.
            </p>
          </div>

          {/* Broadcast Drop CTA */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!pickupLocation.trim()}
            className={cn(
              'w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all',
              pickupLocation.trim()
                ? 'bg-[#F95919] hover:bg-[#E54807] text-white cursor-pointer active:scale-[0.99]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            <span>Broadcast Drop</span>
            <Zap className="w-4 h-4 fill-white text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
