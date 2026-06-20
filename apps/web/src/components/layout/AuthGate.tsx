'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Halaman yang boleh diakses tanpa login. Selain ini, wajib login dulu.
const PUBLIC_PATHS = ['/', '/login']

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router   = useRouter()

  const isPublic = PUBLIC_PATHS.includes(pathname)
  const blocked  = !loading && !user && !isPublic

  useEffect(() => {
    if (blocked) router.replace('/login')
  }, [blocked, router])

  // Cegah konten halaman terlindungi "kelip" sebelum redirect kelar.
  if (blocked) {
    return (
      <main style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'var(--muted)', fontSize: '.75rem',
      }}>
        Mengalihkan ke login...
      </main>
    )
  }

  return <>{children}</>
}
