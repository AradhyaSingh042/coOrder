'use client'

import { Flame, Plus, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Tab = 'active' | 'create' | 'matches' | 'profile'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onCreateClick: () => void
}

const tabs: { id: Tab; label: string; icon: typeof Flame }[] = [
  { id: 'active', label: 'Active Pools', icon: Flame },
  { id: 'create', label: 'Create', icon: Plus },
  { id: 'matches', label: 'My Matches', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function BottomNav({ activeTab, onTabChange, onCreateClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto flex items-center justify-around py-1.5 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const isCreate = tab.id === 'create'

          const handleClick = () => {
            if (isCreate) {
              onCreateClick()
            } else {
              onTabChange(tab.id)
            }
          }

          if (isCreate) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={handleClick}
                className="flex flex-col items-center group -mt-3.5 cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-[#F95919] hover:bg-[#E54807] rounded-full flex items-center justify-center shadow-md shadow-orange-500/25 transition-transform group-active:scale-95">
                  <Icon className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold text-gray-500 mt-1">
                  {tab.label}
                </span>
              </button>
            )
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={handleClick}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer focus:outline-none',
                isActive
                  ? 'text-[#F95919]'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'stroke-[2.5]' : 'stroke-2')} />
              <span className={cn('text-[10px]', isActive ? 'font-bold' : 'font-medium')}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
