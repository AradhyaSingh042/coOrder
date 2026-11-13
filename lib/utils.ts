import type { Platform } from './store'

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatTimeLeft(expiresAt: number): string {
  const diff = expiresAt - Date.now()
  if (diff <= 0) return '00:00 left'
  const totalSeconds = Math.floor(diff / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} left`
}

export function formatCurrency(amount: number): string {
  return `₹${amount}`
}

export const platformConfig: Record<
  Platform,
  {
    label: string
    color: string
    bgColor: string
    badgeBg: string
    badgeText: string
    accentBg: string
    accentText: string
    letter: string
    splitSaving: number
    deliveryFee: number
  }
> = {
  zepto: {
    label: 'Zepto',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    accentBg: 'bg-purple-600',
    accentText: 'text-white',
    letter: 'Z',
    splitSaving: 35,
    deliveryFee: 35,
  },
  blinkit: {
    label: 'Blinkit',
    color: 'text-amber-800',
    bgColor: 'bg-yellow-100',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-amber-800',
    accentBg: 'bg-yellow-400',
    accentText: 'text-gray-900',
    letter: 'B',
    splitSaving: 40,
    deliveryFee: 40,
  },
  zomato: {
    label: 'Zomato',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    accentBg: 'bg-red-500',
    accentText: 'text-white',
    letter: 'Z',
    splitSaving: 50,
    deliveryFee: 50,
  },
}
