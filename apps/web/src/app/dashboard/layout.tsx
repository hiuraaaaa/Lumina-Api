'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { href: '/dashboard',           label: 'Overview',  icon: 'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z' },
  { href: '/dashboard/keys',      label: 'API Keys',   icon: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777Zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4' },
  { href: '/models',               label: 'Endpoints',  icon: 'M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Zm4-7h8M8 14h5' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarNav = () => (
    <>
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 700,
        textDecoration: 'none', color: 'var(--text)', padding: '0 1.2rem', marginBottom: '1.8rem',
      }}>
        <span style={{ color: 'var(--accent)' }}>⚡</span>
        <span>Lumina<span style={{ color: 'var(--accent)' }}>API</span></span>
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '.2rem', padding: '0 .7rem', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '.7rem',
                padding: '.65rem .8rem', fontSize: '.78rem', textDecoration: 'none',
                color: active ? 'var(--text)' : 'var(--muted)',
                background: active ? 'var(--surface)' : 'transparent',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={item.icon} /></svg>
              {item.label}
            </Link>
          )
        })}

        <div style={{ height: 1, background: 'var(--border)', margin: '.7rem .1rem' }} />

        <Link
          href="/playground"
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '.7rem',
            padding: '.65rem .8rem', fontSize: '.78rem', textDecoration: 'none', color: 'var(--muted)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          Playground
        </Link>
        <Link
          href="/docs"
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '.7rem',
            padding: '.65rem .8rem', fontSize: '.78rem', textDecoration: 'none', color: 'var(--muted)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" /></svg>
          Dokumentasi
        </Link>
      </nav>

      <div style={{ padding: '.9rem 1.2rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '.66rem', color: 'var(--muted)', marginBottom: '.6rem', wordBreak: 'break-all' }}>{user?.email}</p>
        <button
          onClick={() => logout().then(() => router.push('/'))}
          style={{
            width: '100%', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
            padding: '.5rem', fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.06em',
            cursor: 'pointer', fontFamily: "'DM Mono', monospace",
          }}
        >
          Keluar
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* desktop sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, borderRight: '1px solid var(--border)',
        display: 'none', flexDirection: 'column', paddingTop: '1.5rem',
        position: 'sticky', top: 0, height: '100vh',
      }} className="dash-sidebar-desktop">
        <SidebarNav />
      </aside>

      {/* mobile top bar */}
      <div className="dash-mobile-bar" style={{
        position: 'fixed', top: 0, insetInline: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '.8rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontWeight: 700, textDecoration: 'none', color: 'var(--text)', fontSize: '.85rem' }}>
          <span style={{ color: 'var(--accent)' }}>⚡</span> Lumina<span style={{ color: 'var(--accent)' }}>API</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '.4rem .6rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,15,.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 1, width: 'min(260px, 80vw)', background: 'var(--bg)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', paddingTop: '1.5rem' }}>
            <SidebarNav />
          </div>
        </div>
      )}

      <main style={{ flex: 1, minWidth: 0, paddingTop: 'var(--dash-main-pt, 0)' }} className="dash-main">
        {children}
      </main>

      <style>{`
        @media (min-width: 860px) {
          .dash-sidebar-desktop { display: flex !important; }
          .dash-mobile-bar { display: none !important; }
          .dash-main { --dash-main-pt: 0; }
        }
        @media (max-width: 859px) {
          .dash-main { --dash-main-pt: 56px; }
        }
      `}</style>
    </div>
  )
}
