'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import BottomNav, { type Tab } from '@/app/components/bottom-nav'
import CreateDropModal from '@/app/components/create-drop-modal'
import { Users, Truck, Check, ChevronDown, Sparkles } from 'lucide-react'

const BUILDINGS = [
  'Candor TechSpace, Tower A',
  'Godrej Woods, Tower B',
  'DLF CyberCity, Phase 3',
  'Prestige Tech Park, Block C',
  'Sunrise Apartments, Gate 1',
]

const DEMO_PERSONAS = [
  { id: 'aman', name: 'Aman', role: 'Host (Zepto)', building: 'Godrej Woods, Tower B' },
  { id: 'priya', name: 'Priya S.', role: 'Host (Blinkit)', building: 'Godrej Woods, Tower B' },
  { id: 'vikram', name: 'Vikram', role: 'Host (Zomato)', building: 'Godrej Woods, Tower B' },
  { id: 'new', name: 'Karan M.', role: 'New Resident', building: 'Candor TechSpace, Tower A' },
] as const

export default function LandingPage() {
  const router = useRouter()
  const { user, login, setBuilding, setDemoUser } = useAuth()
  const [selectedBuilding, setSelectedBuildingState] = useState(
    user?.building || 'Candor TechSpace, Tower A'
  )
  const [customName, setCustomName] = useState(user?.name || '')
  const [customEmail, setCustomEmail] = useState(user?.email || '')
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('active')

  const handleSelectBuilding = (b: string) => {
    setSelectedBuildingState(b)
    setBuilding(b)
  }

  const handleContinueWithGoogle = async () => {
    // One click sign in with selected building
    const name = customName.trim() || 'Aman'
    const email = customEmail.trim() || `${name.toLowerCase()}@neighborhood.co`
    await login(name, email, selectedBuilding)
    router.push('/feed')
  }

  const handleSelectPersona = async (personaId: 'aman' | 'priya' | 'vikram' | 'new') => {
    await setDemoUser(personaId)
    router.push('/feed')
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Mobile container */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col px-5 pt-3 pb-24">
        {/* Mock phone status bar */}
        <div className="flex items-center justify-between text-xs text-gray-400 py-1 font-semibold tracking-wider">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <span className="w-4 h-2.5 border border-gray-400 rounded-xs inline-block relative after:content-[''] after:absolute after:right-0 after:top-0.5 after:bottom-0.5 after:w-2 after:bg-gray-200" />
          </div>
        </div>

        {/* Stepper matching Mockup 3 */}
        <div className="flex items-center justify-center gap-2 py-3">
          <div className="bg-[#F95919] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
            1: Login
          </div>
          <button
            type="button"
            onClick={() => router.push('/feed')}
            className="text-gray-400 hover:text-gray-200 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors"
          >
            2: Feed
          </button>
          <span className="text-gray-500 text-[11px] font-semibold px-2 py-1">
            3: Pool
          </span>
          <span className="text-gray-500 text-[11px] font-semibold px-2 py-1">
            4: Match
          </span>
        </div>

        {/* Main hero card */}
        <div className="flex-1 flex flex-col items-center text-center mt-3 space-y-4">
          {/* Hyper-local order sharing badge */}
          <div className="inline-flex items-center gap-1.5 bg-orange-950/60 border border-orange-500/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#F95919] inline-block animate-pulse" />
            <span className="text-xs font-bold text-orange-400 tracking-wide">
              Hyper-Local Order Sharing
            </span>
          </div>

          {/* Logo & title */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <div className="w-10 h-10 bg-[#F95919] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-[#F95919] tracking-tight">
              CoOrder
            </h1>
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight leading-snug">
              Split the cart, skip the cost.
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
              Team up with neighbors in your building, combine delivery orders, and pay ₹0 delivery fees.
            </p>
          </div>

          {/* Graphic community card matching Mockup 3 */}
          <div className="w-full bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-4 relative overflow-hidden shadow-xl my-2 backdrop-blur-xs">
            {/* Background ambient glow */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />

            {/* Illustration simulation with avatars */}
            <div className="relative py-4 flex flex-col items-center">
              <div className="flex items-center justify-center -space-x-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 border-2 border-slate-900 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">👩🏾‍🦱</span>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 border-2 border-slate-900 flex items-center justify-center shadow-xl z-10">
                  <span className="text-3xl">🧑🏽</span>
                </div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 border-2 border-slate-900 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">👨🏻‍💼</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10">
                  <Users className="w-3.5 h-3.5 text-orange-400" />
                  <span>Tower A Community</span>
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-300 border border-emerald-500/30">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>₹0 Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Building selector */}
          <div className="w-full text-left space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              SELECT YOUR BUILDING/SOCIETY
            </label>
            <div className="relative">
              <select
                value={selectedBuilding}
                onChange={(e) => handleSelectBuilding(e.target.value)}
                className="w-full appearance-none bg-white text-gray-900 text-xs sm:text-sm font-semibold rounded-2xl px-4 py-3.5 pr-10 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-sm"
              >
                {BUILDINGS.map((b) => (
                  <option key={b} value={b} className="text-gray-900 font-medium py-1">
                    {b}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Primary Continue with Google button */}
          <div className="w-full space-y-2 pt-1">
            <button
              type="button"
              onClick={handleContinueWithGoogle}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm sm:text-base py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all cursor-pointer active:scale-[0.99]"
            >
              {/* Google G logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="text-[11px] text-gray-500">
              By signing in, you verify your residency in{' '}
              <span className="text-gray-300 font-semibold">{selectedBuilding.split(',')[0]}</span>.
            </p>
          </div>

          {/* Quick Demo Switcher */}
          <div className="w-full pt-2">
            <div className="flex items-center gap-1.5 justify-center text-[11px] text-gray-400 mb-2 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Or test instantly as demo neighbor:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPersona(p.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-orange-400">
                      {p.name}
                    </span>
                    <span className="text-[9px] font-semibold text-orange-400 bg-orange-500/10 px-1 rounded">
                      {p.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                    {p.building.split(',')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav
        activeTab="active"
        onTabChange={(tab) => {
          if (tab === 'active') router.push('/feed')
        }}
        onCreateClick={() => setIsModalOpen(true)}
      />

      {/* Create Modal */}
      <CreateDropModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          setIsModalOpen(false)
          // Ensure logged in
          if (!user) {
            await handleContinueWithGoogle()
          }
          // Redirect to feed and trigger creation
          router.push('/feed')
        }}
        building={selectedBuilding}
      />
    </div>
  )
}
