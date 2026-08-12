import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser } from '@/types/auth'
import { authApi } from '@/lib/api'
import { ApiError, setUnauthorizedHandler } from '@/lib/api/client'
import { getStoredToken, setStoredToken, clearStoredToken } from '@/lib/authStorage'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signup: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    clearStoredToken()
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => clearStoredToken())
      .finally(() => setLoading(false))
  }, [])

  const signup = useCallback(async (email: string, password: string) => {
    const { token, user } = await authApi.signup(email, password)
    setStoredToken(token)
    setUser(user)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password)
    setStoredToken(token)
    setUser(user)
  }, [])

  const value = useMemo(() => ({ user, loading, signup, login, logout }), [user, loading, signup, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function authErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
}
