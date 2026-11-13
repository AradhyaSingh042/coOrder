'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { Drop, Platform } from '@/lib/store'
import Header from '@/app/components/header'
import FeedBanner from '@/app/components/feed-banner'
import DropCard from '@/app/components/drop-card'
import CreateDropModal from '@/app/components/create-drop-modal'
import BottomNav, { type Tab } from '@/app/components/bottom-nav'
import {
  RotateCcw,
  Plus,
  Sparkles,
  ShoppingBag,
  Building,
  User,
  LogOut,
  MapPin,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react'
import { formatCurrency, platformConfig, cn } from '@/lib/utils'

export default function FeedPage() {
  const router = useRouter()
  const { user, login, logout, setBuilding, setDemoUser } = useAuth()
  const [drops, setDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('active')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showBuildingModal, setShowBuildingModal] = useState(false)

  // Fetch active drops
  const fetchDrops = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true)
    try {
      const buildingQuery = user?.building ? `?building=${encodeURIComponent(user.building)}` : ''
      const res = await fetch(`/api/drops${buildingQuery}`)
      if (res.ok) {
        const data = await res.json()
        setDrops(data.drops || [])
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error('Failed to fetch drops:', err)
    } finally {
      setLoading(false)
      if (showIndicator) {
        setTimeout(() => setIsRefreshing(false), 500)
      }
    }
  }, [user?.building])

  // Polling every 3 seconds for live updates as per mockup/stack specification
  useEffect(() => {
    fetchDrops()
    const interval = setInterval(() => {
      fetchDrops()
    }, 3000)
    return () => clearInterval(interval)
  }, [fetchDrops])

  // Handle Join Drop
  const handleJoinDrop = async (dropId: string) => {
    if (!user) {
      router.push('/')
      return
    }
    try {
      const res = await fetch(`/api/drops/${dropId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      if (res.ok) {
        router.push(`/drop/${dropId}`)
      } else {
        router.push(`/drop/${dropId}`)
      }
    } catch {
      router.push(`/drop/${dropId}`)
    }
  }

  // Handle Create Drop submission
  const handleCreateDrop = async (data: {
    platform: Platform
    waitMinutes: number
    pickupLocation: string
  }) => {
    if (!user) {
      router.push('/')
      return
    }
    try {
      const res = await fetch('/api/drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: user.id,
          hostName: user.name,
          platform: data.platform,
          pickupLocation: data.pickupLocation,
          building: user.building,
          waitMinutes: data.waitMinutes,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        setIsModalOpen(false)
        await fetchDrops(true)
        if (result.drop?.id) {
          router.push(`/drop/${result.drop.id}`)
        }
      }
    } catch (err) {
      console.error('Failed to create drop:', err)
    }
  }

  // Filtered drops based on platform selection
  const filteredDrops = drops.filter((d) => {
    if (selectedPlatform === 'all') return true
    return d.platform === selectedPlatform
  })

  // User's joined drops for "My Matches"
  const myDrops = drops.filter(
    (d) => user && (d.hostId === user.id || d.members.includes(user.id))
  )

  const totalSaved = myDrops.reduce((acc, d) => acc + (d.splitSavings || 35), 0)

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20 selection:bg-orange-500 selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col relative border-x border-gray-100">
        {/* Header matching Mockup 2 */}
        <Header
          building={user?.building}
          userName={user?.name}
          onSwitchBuilding={() => setShowBuildingModal(true)}
        />

        {/* Tab Content */}
        {activeTab === 'active' && (
          <main className="flex-1 space-y-3 pb-8">
            {/* Feed Banner matching Mockup 2 */}
            <FeedBanner />

            {/* Platform filter pills */}
            <div className="px-4 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer',
                    selectedPlatform === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  All Platforms ({drops.length})
                </button>
                {(['zepto', 'blinkit', 'zomato'] as Platform[]).map((p) => {
                  const cfg = platformConfig[p]
                  const isSelected = selectedPlatform === p
                  const count = drops.filter((d) => d.platform === p).length
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPlatform(p)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
                        isSelected
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      <span>{cfg.label}</span>
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                          isSelected ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sector Header matching Mockup 2 */}
            <div className="px-4 flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                  ACTIVE POOLS IN YOUR SECTOR
                </span>
                <span className="w-5 h-5 rounded-full bg-slate-200 text-gray-700 font-bold text-xs flex items-center justify-center">
                  {filteredDrops.length}
                </span>
              </div>

              {/* Auto-updating indicator */}
              <button
                type="button"
                onClick={() => fetchDrops(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-[#F95919] hover:text-[#E54807] transition-colors cursor-pointer"
                title="Refreshes automatically every 3 seconds"
              >
                <span>Auto-updating</span>
                <RotateCcw className={cn('w-3 h-3', isRefreshing && 'animate-spin')} />
              </button>
            </div>

            {/* Drop Cards List matching Mockup 2 */}
            <div className="px-4 space-y-3.5">
              {loading && drops.length === 0 ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-44 bg-gray-100 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : filteredDrops.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-gray-800">No active drops right now</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Be the first neighbor to start a pool and save ₹30-50 on delivery fees!
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-[#F95919] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#E54807] cursor-pointer"
                  >
                    Start a New Drop
                  </button>
                </div>
              ) : (
                filteredDrops.map((drop) => (
                  <DropCard
                    key={drop.id}
                    drop={drop}
                    currentUserId={user?.id}
                    onJoin={handleJoinDrop}
                  />
                ))
              )}
            </div>

            {/* Quick Demo Tips */}
            <div className="px-4 pt-4">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>How CoOrder Works</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  1. <strong>Host</strong> starts a drop on Zepto, Blinkit or Zomato with a cut-off timer.
                  <br />
                  2. <strong>Hoppers</strong> nearby join the private room and add their items.
                  <br />
                  3. Host places 1 consolidated bulk order, skipping individual delivery fees!
                </p>
              </div>
            </div>
          </main>
        )}

        {/* "My Matches" Tab Content */}
        {activeTab === 'matches' && (
          <main className="flex-1 p-4 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Drops & Matches</h2>
              <p className="text-xs text-gray-500">
                Active & past collaborative orders in your sector
              </p>
            </div>

            {/* Savings card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md">
              <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider block">
                Total Delivery Fees Saved
              </span>
              <div className="text-2xl font-black mt-1">₹{totalSaved || 115}</div>
              <p className="text-xs text-emerald-100 mt-1">
                Across {myDrops.length || 3} consolidated neighbor orders
              </p>
            </div>

            {/* Orders list */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
                Your Active Drops
              </span>

              {myDrops.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                  <p className="text-xs text-gray-500">You haven&apos;t joined any drops yet.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('active')}
                    className="mt-2 text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    Browse Active Pools →
                  </button>
                </div>
              ) : (
                myDrops.map((drop) => (
                  <div
                    key={drop.id}
                    onClick={() => router.push(`/drop/${drop.id}`)}
                    className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-orange-500 transition-all cursor-pointer shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded-full capitalize',
                            platformConfig[drop.platform].badgeBg,
                            platformConfig[drop.platform].badgeText
                          )}
                        >
                          {platformConfig[drop.platform].label}
                        </span>
                        <span className="text-xs text-gray-500 font-medium truncate max-w-[140px]">
                          {drop.pickupLocation}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-orange-600 flex items-center gap-0.5">
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-100">
                      <span>Host: <strong className="text-gray-800">{drop.hostName}</strong></span>
                      <span>{drop.items.length} items ({drop.members.length} neighbors)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        )}

        {/* "Profile" Tab Content */}
        {activeTab === 'profile' && (
          <main className="flex-1 p-4 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Resident Profile</h2>
              <p className="text-xs text-gray-500">
                Hyper-local community identity & preferences
              </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-[#F95919] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">{user?.name || 'Resident'}</h3>
                  <p className="text-xs text-gray-500">{user?.email || 'resident@example.com'}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-orange-600 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Resident</span>
                  </div>
                </div>
              </div>

              {/* Building selector */}
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Building / Society
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                    <Building className="w-4 h-4 text-orange-500" />
                    <span>{user?.building || 'Candor TechSpace, Tower A'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBuildingModal(true)}
                    className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Persona Switcher for Quick Demo Testing */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide block">
                  Quick Switch Persona (For Testing)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoUser('aman')}
                    className="p-2 text-left rounded-xl border border-gray-200 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-gray-900 block">Aman (Host)</span>
                    <span className="text-[10px] text-gray-500">Zepto Room Host</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoUser('priya')}
                    className="p-2 text-left rounded-xl border border-gray-200 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-gray-900 block">Priya S. (Hopper)</span>
                    <span className="text-[10px] text-gray-500">Blinkit Host</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoUser('vikram')}
                    className="p-2 text-left rounded-xl border border-gray-200 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-gray-900 block">Vikram (Host)</span>
                    <span className="text-[10px] text-gray-500">Zomato Food Host</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoUser('new')}
                    className="p-2 text-left rounded-xl border border-gray-200 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-gray-900 block">Karan (New)</span>
                    <span className="text-[10px] text-gray-500">Candor Resident</span>
                  </button>
                </div>
              </div>

              {/* Logout button */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    router.push('/')
                  }}
                  className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </main>
        )}

        {/* Floating Action Button (+) matching Mockup 2 */}
        {activeTab === 'active' && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-20 right-5 z-30 w-13 h-13 rounded-full bg-[#F95919] hover:bg-[#E54807] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-transform active:scale-95 cursor-pointer focus:outline-none"
            aria-label="Start a New Drop"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        )}

        {/* Bottom Navigation matching Mockup 2 & 3 */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(t) => setActiveTab(t)}
          onCreateClick={() => setIsModalOpen(true)}
        />

        {/* Create Drop Modal matching Mockup 4 */}
        <CreateDropModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateDrop}
          building={user?.building || 'Tower B Lobby'}
        />

        {/* Building Switcher Modal */}
        {showBuildingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
              <h3 className="font-bold text-gray-900 text-base">Select Your Building</h3>
              <div className="space-y-1.5">
                {[
                  'Candor TechSpace, Tower A',
                  'Godrej Woods, Tower B',
                  'DLF CyberCity, Phase 3',
                  'Prestige Tech Park, Block C',
                  'Sunrise Apartments, Gate 1',
                ].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setBuilding(b)
                      setShowBuildingModal(false)
                      fetchDrops(true)
                    }}
                    className={cn(
                      'w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer',
                      user?.building === b
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    )}
                  >
                    <span>{b}</span>
                    {user?.building === b && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowBuildingModal(false)}
                className="w-full py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
