'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { EndpointDoc } from '@lumina/types'
import { useAuth } from '@/context/AuthContext'

interface Props {
  endpoint: EndpointDoc
  apiBase:  string
}

export default function PlaygroundInline({ endpoint, apiBase }: Props) {
  const { user, loading: authLoading, getToken } = useAuth()
  const [values,   setValues]   = useState<Record<string, string>>({})
  const [loading,  setLoading]  = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [status,   setStatus]   = useState<number | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setResponse(null)
    try {
      const qs  = new URLSearchParams(
        Object.fromEntries(Object.entries(values).filter(([, v]) => v))
      ).toString()
      const url = `${apiBase}${endpoint.path}${qs ? '?' + qs : ''}`
      const headers: Record<string, string> = {}
      if (user) {
        const token = await getToken()
        if (token) headers.Authorization = `Bearer ${token}`
      }
      const res = await fetch(url, { method: endpoint.method, headers })
      const data = await res.json()
      setStatus(res.status)
      setResponse(JSON.stringify(data, null, 2))
    } catch (e: any) {
      setResponse(e.message)
      setStatus(500)
    } finally {
      setLoading(false)
    }
  }

  const ok = status !== null && status < 300

  return (
    <div style={{
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      overflow: 'hidden',
    }}>
      {!authLoading && !user && (
        <div style={{
          padding: '.8rem 1.2rem', borderBottom: '1px solid var(--border)',
          fontSize: '.66rem', color: 'var(--muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.8rem', flexWrap: 'wrap',
        }}>
          <span>Semua endpoint butuh API key. Login dulu biar bisa coba langsung di sini.</span>
          <Link href="/login" className="btn-ghost" style={{ fontSize: '.62rem', padding: '.35rem .7rem', flexShrink: 0 }}>
            <span>Login</span>
          </Link>
        </div>
      )}
      {/* inputs */}
      {endpoint.params.length > 0 && (
        <div style={{
          padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '.75rem',
          borderBottom: '1px solid var(--border)',
        }}>
          {endpoint.params.map(p => (
            <div key={p.name}>
              <label style={{
                display: 'block', marginBottom: '.35rem',
                fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase',
                color: 'var(--muted)', fontFamily: "'DM Mono', monospace",
              }}>
                {p.name}
                {p.required && <span style={{ color: '#f87171', marginLeft: '.3rem' }}>*</span>}
                {p.description && (
                  <span style={{ color: 'var(--muted)', opacity: .6, marginLeft: '.5rem', fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>
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
                  outline: 'none',
                  transition: 'border-color .2s',
                  minHeight: 44,
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          ))}
        </div>
      )}

      {/* send button */}
      <div style={{ padding: '1rem 1.2rem', borderBottom: response ? '1px solid var(--border)' : 'none' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', minHeight: 48,
            background: loading ? 'var(--surface)' : 'var(--accent)',
            color: loading ? 'var(--muted)' : 'var(--bg)',
            border: '1px solid ' + (loading ? 'var(--border)' : 'var(--accent)'),
            fontFamily: "'DM Mono', monospace",
            fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase',
            cursor: loading ? 'wait' : 'pointer',
            transition: 'all .25s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem',
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Send {endpoint.method} Request
            </>
          )}
        </button>
      </div>

      {/* response */}
      {response && (
        <div style={{ padding: '1rem 1.2rem 1.2rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '.6rem',
            marginBottom: '.75rem',
          }}>
            <span style={{ fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Response
            </span>
            <span style={{
              fontSize: '.62rem', padding: '.2rem .5rem',
              fontFamily: "'DM Mono', monospace",
              background: ok ? 'rgba(74,222,128,.12)' : 'rgba(239,68,68,.12)',
              color:      ok ? '#4ade80' : '#f87171',
            }}>
              HTTP {status}
            </span>
            <span style={{
              fontSize: '.6rem', color: ok ? '#4ade80' : '#f87171', marginLeft: 'auto',
            }}>
              {ok ? '✓ OK' : '✗ Error'}
            </span>
          </div>
          <pre style={{
            background: 'rgba(0,0,0,.4)', border: '1px solid var(--border)',
            padding: '1rem',
            fontSize: 'clamp(.62rem, 2vw, .7rem)',
            fontFamily: "'DM Mono', monospace",
            color: 'var(--text)',
            overflowX: 'auto', overflowY: 'auto',
            maxHeight: '280px',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            margin: 0, lineHeight: 1.65,
          }}>
            {response}
          </pre>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
