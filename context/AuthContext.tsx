'use client'
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'

interface AuthUser { id: string; name: string; email: string }
interface AuthCtx {
  user: AuthUser | null
  isLoaded: boolean
  isSignedIn: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    axios.get('/api/auth/me')
      .then(r => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoaded(true))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const r = await axios.post('/api/auth/login', { email, password })
    setUser(r.data.user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const r = await axios.post('/api/auth/register', { name, email, password })
    setUser(r.data.user)
  }, [])

  const logout = useCallback(async () => {
    await axios.delete('/api/auth/me')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoaded, isSignedIn: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
