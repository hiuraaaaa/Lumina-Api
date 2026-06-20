'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ENDPOINTS, CATEGORIES } from '@/lib/endpoints'
import { ProviderIcon } from '@/components/ui/ProviderIcon'
import { useAuth } from '@/context/AuthContext'
import type { EndpointDoc } from '@lumina/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.lumina.vercel.app'

export default function PlaygroundPage() {
  const { user, loading: authLoading, getToken } = useAuth()
  const [selected, setSelected] = useState<EndpointDoc>(ENDPOINTS[0])
  const [values,   setValues]   = useState<Record<string, string>>({})
  const [loading,  setLoading]  = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [status,   setStatus]   = useState<number | null>(null)
  const [filter,   setFilter]   = useState('')
  const [sideOpen, setSideOpen] = useState(false)

  const filtered = ENDPOINTS.filter(e =>
    e.name.toLowerCase().includes(filter.toLowerCase()) ||
    e.category.toLowerCase().includes(filter.toLowerCase())
  )

  const selectEndpoint = (ep: EndpointDoc) => {
    setSelected(ep); setValues({}); setResponse(null); setStatus(null)
    setSideOpen(false) // close drawer on mobile after selection
  }

  const handleSend = async () => {
    setLoading(true); setResponse(null)
    try {
      const qs  = new URLSearchParams(Object.fromEntries(Object.entries(values).filter(([, v]) => v))).toString()
      const url = `${API_BASE}${selected.path}${qs ? '?' + qs : ''}`
      const headers: Record<string, string> = {}
      if (user) {
        const token = await getToken()
        if (token) headers.Authorization = `Bearer ${token}`
      }
      const res = await fetch(url, { method: selected.method, headers })
      setStatus(res.status)
      setResponse(JSON.stringify(await res.json(), null, 2))
    } catch (e: any) {
      setResponse(e.message); setStatus(500)
    } finally {
      setLoading(false)
    }
  }

  // lock body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = sideOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sideOpen])

  const ok = status !== null && status < 300

  const SidebarContent = () => (
    <>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <Link href="/" style={{
          fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase',
          color: 'var(--muted)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '.35rem',
          marginBottom: '.85rem',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
          Home
        </Link>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: '.85rem', letterSpacing: '.04em', marginBottom: '.85rem',
        }}>
          Playground
        </div>
        <input
          type="text"
          placeholder="Filter endpoints..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,.04)',
            border: '1px solid var(--border)',
            padding: '.55rem .75rem',
            fontFamily: "'DM Mono', monospace",
            fontSize: '.7rem', color: 'var(--text)',
            outline: 'none', minHeight: 40,
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '.5rem' }}>
        {CATEGORIES.map(cat => {
          const eps = filtered.filter(e => e.category === cat)
          if (!eps.length) return null
          return (
            <div key={cat} style={{ marginBottom: '.5rem' }}>
              <div style={{
                fontSize: '.58rem', letterSpacing: '.18em', textTransform: 'uppercase',
                color: 'var(--muted)', padding: '.6rem .5rem .35rem', opacity: .6,
              }}>
                {cat}
              </div>
              {eps.map(ep => {
                const isActive = selected.slug === ep.slug && selected.category === ep.category
                return (
                  <button
                    key={ep.slug}
                    onClick={() => selectEndpoint(ep)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '.5rem .6rem',
                      background: isActive ? 'rgba(232,100,58,.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(232,100,58,.25)' : '1px solid transparent',
                      color: isActive ? 'var(--text)' : 'var(--muted)',
                      fontSize: '.7rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '.5rem',
                      minHeight: 44, transition: 'all .2s',
                    }}
                  >
                    <span style={{
                      fontSize: '.58rem', fontFamily: "'DM Mono', monospace",
                      fontWeight: 700, flexShrink: 0,
                      color: ep.method === 'GET' ? '#4ade80' : '#60a5fa',
                    }}>
                      {ep.method}
                    </span>
                    {ep.category === 'AI CHAT' && <ProviderIcon slug={ep.slug} size={14} />}
                    <span style={{ lineHeight: 1.3 }}>{ep.name}</span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </>
  )

  return (
    <>
      <style>{`
        .pg-layout {
          display: flex;
          flex-direction: column;
          height: 100svh;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .pg-layout { flex-direction: row; }
          .pg-sidebar-desktop { display: flex !important; }
          .pg-mobile-bar { display: none !important; }
        }
        .pg-sidebar-desktop {
          display: none;
          flex-direction: column;
          width: 260px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          height: 100%;
          overflow: hidden;
        }
        .pg-mobile-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: .75rem 1rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
          flex-shrink: 0;
        }
        .pg-main {
          flex: 1;
          overflow-y: auto;
          min-width: 0;
        }
        .pg-drawer {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
        }
        .pg-drawer-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10,10,15,.7);
          backdrop-filter: blur(4px);
        }
        .pg-drawer-panel {
          position: relative;
          z-index: 1;
          width: min(300px, 85vw);
          background: var(--bg);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* mobile drawer */}
      {sideOpen && (
        <div className="pg-drawer md:hidden">
          <div className="pg-drawer-overlay" onClick={() => setSideOpen(false)} />
          <div className="pg-drawer-panel">
            <SidebarContent />
          </div>
        </div>
      )}

      <main className="pg-layout" style={{ paddingTop: 60, background: 'var(--bg)' }}>
        {/* desktop sidebar */}
        <aside className="pg-sidebar-desktop">
          <SidebarContent />
        </aside>

        {/* mobile top bar */}
        <div className="pg-mobile-bar">
          <button
            onClick={() => setSideOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text)', padding: '.5rem .85rem',
              fontFamily: "'DM Mono', monospace", fontSize: '.68rem',
              letterSpacing: '.08em', cursor: 'pointer', minHeight: 44,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            Endpoints
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span style={{
              fontSize: '.6rem', fontFamily: "'DM Mono', monospace",
              fontWeight: 700, padding: '.2rem .4rem',
              background: selected.method === 'GET' ? 'rgba(74,222,128,.12)' : 'rgba(96,165,250,.12)',
              color:      selected.method === 'GET' ? '#4ade80' : '#60a5fa',
            }}>
              {selected.method}
            </span>
            <span style={{ fontSize: '.72rem', fontFamily: "'Syne', sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              {selected.category === 'AI CHAT' && <ProviderIcon slug={selected.slug} size={13} />}
              {selected.name}
            </span>
          </div>
        </div>

        {/* main content */}
        <div className="pg-main">
          <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2rem)', maxWidth: 720 }}>

            {/* endpoint header */}
            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.6rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '.65rem', fontFamily: "'DM Mono', monospace", fontWeight: 700,
                  padding: '.25rem .55rem',
                  background: selected.method === 'GET' ? 'rgba(74,222,128,.12)' : 'rgba(96,165,250,.12)',
                  color:      selected.method === 'GET' ? '#4ade80' : '#60a5fa',
                }}>
                  {selected.method}
                </span>
                <code style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 'clamp(.65rem, 2vw, .78rem)',
                  color: 'var(--accent)', wordBreak: 'break-all',
                }}>
                  {selected.path}
                </code>
              </div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 'clamp(1.4rem, 4vw, 2rem)',
                letterSpacing: '-.04em', marginBottom: '.4rem',
                display: 'flex', alignItems: 'center', gap: '.55rem',
              }}>
                {selected.category === 'AI CHAT' && <ProviderIcon slug={selected.slug} size={22} />}
                {selected.name}
              </h2>
              <p style={{ fontSize: '.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>{selected.desc}</p>
            </div>

            {/* params */}
            {selected.params.length > 0 && (
              <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                {selected.params.map(p => (
                  <div key={p.name}>
                    <label style={{
                      display: 'block', marginBottom: '.35rem',
                      fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase',
                      color: 'var(--muted)', fontFamily: "'DM Mono', monospace",
                    }}>
                      {p.name}
                      {p.required && <span style={{ color: '#f87171', marginLeft: '.3rem' }}>*</span>}
                      {p.description && (
                        <span style={{ opacity: .6, marginLeft: '.5rem', textTransform: 'none', letterSpacing: 0 }}>
                          — {p.description}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder={p.description ?? p.name}
                      value={values[p.name] ?? ''}
                      onChange={e => setValues(prev => ({ ...prev, [p.name]: e.target.value }))}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(255,255,255,.04)',
                        border: '1px solid var(--border)',
                        padding: '.65rem .85rem',
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '.72rem', color: 'var(--text)',
                        outline: 'none', minHeight: 44,
                        transition: 'border-color .2s',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>
                ))}
              </div>
            )}

            {!authLoading && !user && (
              <div style={{
                border: '1px solid var(--border)', background: 'var(--surface)',
                padding: '.8rem 1rem', marginBottom: '1rem', fontSize: '.68rem',
                color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.8rem', flexWrap: 'wrap',
              }}>
                <span>Semua endpoint sekarang butuh API key. Login dulu biar bisa langsung coba di sini tanpa nempel key manual.</span>
                <Link href="/login" className="btn-ghost" style={{ fontSize: '.65rem', padding: '.4rem .8rem', flexShrink: 0 }}>
                  <span>Login</span>
                </Link>
              </div>
            )}

            {/* send */}
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                width: '100%', minHeight: 50,
                background: loading ? 'var(--surface)' : 'var(--accent)',
                color: loading ? 'var(--muted)' : 'var(--bg)',
                border: '1px solid ' + (loading ? 'var(--border)' : 'var(--accent)'),
                fontFamily: "'DM Mono', monospace",
                fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem',
                transition: 'all .25s', marginBottom: '2rem',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 12, height: 12, border: '2px solid var(--muted)',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin .7s linear infinite',
                  }} />
                  Sending...
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Send Request
                </>
              )}
            </button>

            {/* response */}
            {response && (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.75rem',
                }}>
                  <span style={{ fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>Response</span>
                  <span style={{
                    fontSize: '.62rem', padding: '.2rem .5rem',
                    fontFamily: "'DM Mono', monospace",
                    background: ok ? 'rgba(74,222,128,.12)' : 'rgba(239,68,68,.12)',
                    color:      ok ? '#4ade80' : '#f87171',
                  }}>
                    HTTP {status}
                  </span>
                </div>
                <pre style={{
                  background: 'rgba(0,0,0,.4)', border: '1px solid var(--border)',
                  padding: '1rem',
                  fontSize: 'clamp(.62rem, 2vw, .7rem)',
                  fontFamily: "'DM Mono', monospace",
                  color: 'var(--text)',
                  overflowX: 'auto', overflowY: 'auto',
                  maxHeight: '360px',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  margin: 0, lineHeight: 1.65,
                }}>
                  {response}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
