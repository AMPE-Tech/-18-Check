import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from './api'

interface User {
  id: string
  name: string
  email: string
  plan: string
  credits: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      refreshUser().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { email, password, name })
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }

  async function refreshUser() {
    try {
      const { data } = await api.get('/user/me')
      setUser(data)
    } catch {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
