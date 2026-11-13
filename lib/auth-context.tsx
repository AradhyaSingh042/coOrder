'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from './store'

interface AuthContextValue {
  user: User | null
  login: (name: string, email: string, building: string) => Promise<User>
  logout: () => void
  setBuilding: (building: string) => void
  setDemoUser: (preset: 'aman' | 'priya' | 'vikram' | 'new') => Promise<User>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('coorder-user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('coorder-user')
      }
    } else {
      // Default to Candor TechSpace resident for instant discovery if desired
      const defaultUser: User = {
        id: 'user-default-1',
        name: 'Aman',
        email: 'aman@godrejwoods.com',
        building: 'Godrej Woods, Tower B',
        upiId: 'aman@okhdfcbank',
      }
      setUser(defaultUser)
      localStorage.setItem('coorder-user', JSON.stringify(defaultUser))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(
    async (name: string, email: string, building: string) => {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, building }),
        })
        const data = await res.json()
        const loggedInUser: User = data.user
        localStorage.setItem('coorder-user', JSON.stringify(loggedInUser))
        setUser(loggedInUser)
        return loggedInUser
      } catch {
        const fallbackUser: User = {
          id: 'user-' + Date.now(),
          name,
          email,
          building,
          upiId: `${name.toLowerCase().replace(/\s+/g, '')}@okaxis`,
        }
        localStorage.setItem('coorder-user', JSON.stringify(fallbackUser))
        setUser(fallbackUser)
        return fallbackUser
      }
    },
    []
  )

  const setBuilding = useCallback(
    (building: string) => {
      setUser((prev) => {
        if (!prev) return null
        const updated = { ...prev, building }
        localStorage.setItem('coorder-user', JSON.stringify(updated))
        return updated
      })
    },
    []
  )

  const setDemoUser = useCallback(
    async (preset: 'aman' | 'priya' | 'vikram' | 'new') => {
      const presets: Record<string, { name: string; email: string; building: string }> = {
        aman: {
          name: 'Aman',
          email: 'aman@godrejwoods.com',
          building: 'Godrej Woods, Tower B',
        },
        priya: {
          name: 'Priya S.',
          email: 'priya.s@godrejwoods.com',
          building: 'Godrej Woods, Tower B',
        },
        vikram: {
          name: 'Vikram',
          email: 'vikram.k@godrejwoods.com',
          building: 'Godrej Woods, Tower B',
        },
        new: {
          name: 'Karan Mehra',
          email: 'karan@candortech.com',
          building: 'Candor TechSpace, Tower A',
        },
      }
      const p = presets[preset] || presets.aman
      return await login(p.name, p.email, p.building)
    },
    [login]
  )

  const logout = useCallback(() => {
    localStorage.removeItem('coorder-user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, setBuilding, setDemoUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
