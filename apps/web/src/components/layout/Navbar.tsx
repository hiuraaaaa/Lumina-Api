'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-lumina-500">⚡</span>
          <span>Lumina<span className="text-lumina-500">API</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <Link href="/docs"       className="hover:text-white transition-colors">Docs</Link>
          <Link href="/models"     className="hover:text-white transition-colors">Models</Link>
          <Link href="/playground" className="hover:text-white transition-colors">Playground</Link>
          <a href="https://github.com/hiuraaaaa" target="_blank" className="hover:text-white transition-colors">GitHub</a>
          {!loading && user && (
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          )}
          {!loading && !user && (
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          )}
          {!loading && user ? (
            <button onClick={() => logout().then(() => router.push('/'))} className="btn-ghost text-sm py-2">
              <span>Keluar</span>
            </button>
          ) : (
            <Link href="/login" className="btn-primary text-sm py-2">Get Started</Link>
          )}
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm text-gray-400 border-t border-gray-800 pt-4">
          <Link href="/docs"       onClick={() => setOpen(false)}>Docs</Link>
          <Link href="/models"     onClick={() => setOpen(false)}>Models</Link>
          <Link href="/playground" onClick={() => setOpen(false)}>Playground</Link>
          <a href="https://github.com/hiuraaaaa" target="_blank">GitHub</a>
          {!loading && user && (
            <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          )}
          {!loading && !user && (
            <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
          )}
          {!loading && user && (
            <button onClick={() => { setOpen(false); logout().then(() => router.push('/')) }} style={{ textAlign: 'left', background: 'none', border: 'none', color: 'inherit', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer' }}>
              Keluar
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
