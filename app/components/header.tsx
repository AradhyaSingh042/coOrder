'use client'

import { MapPin } from 'lucide-react'

interface HeaderProps {
  building?: string
  userName?: string
  onSwitchBuilding?: () => void
}

export default function Header({ building, userName, onSwitchBuilding }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-2.5">
        {/* Left: Logo + Text */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F95919] rounded-xl flex items-center justify-center shadow-xs">
            {/* Box package icon */}
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold text-[#F95919] tracking-tight leading-none">
                CoOrder
              </h1>
            </div>
            <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase leading-none mt-0.5">
              HYPER-LOCAL
            </p>
          </div>
        </div>

        {/* Right: Live Radar Pill */}
        <div className="flex items-center gap-2">
          {building && (
            <button
              type="button"
              onClick={onSwitchBuilding}
              className="hidden xs:flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full truncate max-w-[120px]"
              title={building}
            >
              <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
              <span className="truncate">{building.split(',')[0]}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-[#E6F8F0] border border-[#BCEEDA] rounded-full px-2.5 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-extrabold text-emerald-800 tracking-wide uppercase">
              LIVE 500M RADAR
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
