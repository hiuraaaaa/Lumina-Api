'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebaseClient'

interface AuthContextValue {
  user: User | null
  loading: boolean
  getToken: () => Promise<string | null>
  loginEmail: (email: string, password: string) => Promise<void>
  registerEmail: (email: string, password: string) => Promise<void>
  loginGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    getToken: async () => (auth.currentUser ? auth.currentUser.getIdToken() : null),
    loginEmail: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password)
    },
    registerEmail: async (email, password) => {
      await createUserWithEmailAndPassword(auth, email, password)
    },
    loginGoogle: async () => {
      await signInWithPopup(auth, googleProvider)
    },
    logout: async () => {
      await firebaseSignOut(auth)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth() harus dipakai di dalam <AuthProvider>')
  return ctx
}

