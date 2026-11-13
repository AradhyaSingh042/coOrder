'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { Drop } from '@/lib/store'
import DropDetailView from '@/app/components/drop-detail-view'
import { ChevronLeft, Share2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'

interface DropPageProps {
  params: Promise<{ id: string }>
}

export default function DropPage({ params }: DropPageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const dropId = resolvedParams.id
  const { user } = useAuth()

  const [drop, setDrop] = useState<Drop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch drop data
  const fetchDrop = useCallback(async (showIndicator = false) => {
    if (!dropId) return
    if (showIndicator) setIsRefreshing(true)
    try {
      const res = await fetch(`/api/drops/${dropId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Drop room not found or expired.')
        } else {
          setError('Failed to load drop room.')
        }
        return
      }
      const data = await res.json()
      setDrop(data.drop)
      setError(null)
    } catch (err) {
      console.error('Error fetching drop:', err)
      setError('Unable to connect to CoOrder live room.')
    } finally {
      setLoading(false)
      if (showIndicator) {
        setTimeout(() => setIsRefreshing(false), 400)
      }
    }
  }, [dropId])

  // Polling every 2.5 seconds for live pub/sub collaborative updates
  useEffect(() => {
    fetchDrop()
    const interval = setInterval(() => {
      fetchDrop()
    }, 2500)
    return () => clearInterval(interval)
  }, [fetchDrop])

  // Add Item to Drop
  const handleAddItem = async (itemData: { description: string; estimatedCost: number }) => {
    if (!dropId || !user) return
    try {
      const res = await fetch(`/api/drops/${dropId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          description: itemData.description,
          estimatedCost: itemData.estimatedCost,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setDrop(data.drop)
      }
    } catch (err) {
      console.error('Failed to add item:', err)
    }
  }

  // Toggle Item Check (Host reviews and checks off as added to delivery app)
  const handleToggleItem = async (itemId: string) => {
    if (!dropId) return
    try {
      const res = await fetch(`/api/drops/${dropId}/items/${itemId}/toggle`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setDrop(data.drop)
      }
    } catch (err) {
      console.error('Failed to toggle item check:', err)
    }
  }

  // Delete Item
  const handleDeleteItem = async (itemId: string) => {
    if (!dropId) return
    try {
      const res = await fetch(`/api/drops/${dropId}/items/${itemId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        const data = await res.json()
        setDrop(data.drop)
      }
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }

  // Update Status (lock cart / complete order)
  const handleUpdateStatus = async (status: 'active' | 'locked' | 'completed') => {
    if (!dropId) return
    try {
      const res = await fetch(`/api/drops/${dropId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const data = await res.json()
        setDrop(data.drop)
      }
    } catch (err) {
      console.error('Failed to update drop status:', err)
    }
  }

  // Simulate a neighbor joining and adding an item live
  const handleSimulateNeighbor = async () => {
    if (!dropId) return
    const sampleNeighbors = [
      { name: 'Kavita Nair', desc: 'Britannia Cheese Slices', cost: 75 },
      { name: 'Rohit Gupta', desc: 'Coca Cola Zero 300ml', cost: 40 },
      { name: 'Ananya Roy', desc: 'Cadbury Silk Roasted Almond', cost: 95 },
      { name: 'Siddharth M.', desc: 'Tata Tea Gold 250g', cost: 110 },
    ]
    const randomItem = sampleNeighbors[Math.floor(Math.random() * sampleNeighbors.length)]

    try {
      const res = await fetch(`/api/drops/${dropId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'sim-user-' + Date.now(),
          userName: randomItem.name,
          description: randomItem.desc,
          estimatedCost: randomItem.cost,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setDrop(data.drop)
      }
    } catch (err) {
      console.error('Failed to simulate neighbor:', err)
    }
  }

  const isHost = user && drop ? drop.hostId === user.id : false

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-16 selection:bg-orange-500 selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col relative border-x border-gray-100">
        {/* Top bar with back button & live indicator */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/feed')}
            className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Active Pools</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchDrop(true)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              title="Refresh live room"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-500' : ''}`} />
            </button>

            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                Live Room
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-4">
          {loading ? (
            <div className="space-y-4 py-8">
              <div className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
              <div className="h-60 bg-gray-100 animate-pulse rounded-2xl" />
              <div className="h-40 bg-gray-100 animate-pulse rounded-2xl" />
            </div>
          ) : error || !drop ? (
            <div className="text-center py-16 px-4 space-y-3">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-lg font-bold text-gray-900">{error || 'Drop not found'}</h2>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                This collaborative drop may have finished or expired. Return to the active sector feed to find current drops.
              </p>
              <button
                type="button"
                onClick={() => router.push('/feed')}
                className="mt-3 px-5 py-2.5 bg-[#F95919] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#E54807] cursor-pointer"
              >
                Back to Sector Feed
              </button>
            </div>
          ) : (
            <DropDetailView
              drop={drop}
              currentUserId={user?.id || 'guest'}
              currentUserName={user?.name || 'Resident'}
              isHost={isHost}
              onAddItem={handleAddItem}
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onUpdateStatus={handleUpdateStatus}
              onSimulateNeighbor={handleSimulateNeighbor}
            />
          )}
        </main>
      </div>
    </div>
  )
}
