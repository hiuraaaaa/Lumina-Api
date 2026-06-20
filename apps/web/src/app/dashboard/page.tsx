'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import CopyButton from '@/components/ui/CopyButton'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.lumina.vercel.app'

interface ApiKeyItem {
  id: string
  name: string
  masked: string
  active: boolean
  isSessionKey: boolean
  requestCount: number
  createdAt: string | null
  lastUsedAt: string | null
}

interface LogItem {
  id: string
  path: string | null
  method: string | null
  timestamp: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, getToken, logout } = useAuth()

  const [keys, setKeys]         = useState<ApiKeyItem[] | null>(null)
  const [fetchErr, setFetchErr] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName]   = useState('')
  const [revealedKey, setRevealedKey] = useState<{ name: string; key: string } | null>(null)
  const [busyId, setBusyId]     = useState<string | null>(null)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [logsByKey, setLogsByKey]   = useState<Record<string, LogItem[] | 'loading' | 'error'>>({})

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  const loadKeys = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/account/keys`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.status) throw new Error(data.error ?? 'Gagal memuat API key.')
      setKeys(data.result)
    } catch (err: any) {
      setFetchErr(err.message ?? 'Gagal memuat API key.')
    }
  }, [getToken])

  useEffect(() => {
    if (user) loadKeys()
  }, [user, loadKeys])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setFetchErr(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/account/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName || 'Unnamed key' }),
      })
      const data = await res.json()
      if (!data.status) throw new Error(data.error ?? 'Gagal membuat API key.')
      setRevealedKey({ name: data.result.name, key: data.result.key })
      setNewName('')
      await loadKeys()
    } catch (err: any) {
      setFetchErr(err.message ?? 'Gagal membuat API key.')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm('Cabut API key ini? Aplikasi yang masih pakai key ini akan langsung berhenti berfungsi.')) return
    setBusyId(id)
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/account/keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.status) throw new Error(data.error ?? 'Gagal mencabut API key.')
      await loadKeys()
    } catch (err: any) {
      setFetchErr(err.message ?? 'Gagal mencabut API key.')
    } finally {
      setBusyId(null)
    }
  }

  async function toggleLogs(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (logsByKey[id] && logsByKey[id] !== 'error') return // udah pernah di-load

    setLogsByKey((prev) => ({ ...prev, [id]: 'loading' }))
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/account/keys/${id}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.status) throw new Error(data.error ?? 'Gagal memuat log.')
      setLogsByKey((prev) => ({ ...prev, [id]: data.result }))
    } catch {
      setLogsByKey((prev) => ({ ...prev, [id]: 'error' }))
    }
  }

  if (loading || !user) {
    return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '.75rem' }}>Memuat...</main>
  }

  const totalRequests = keys?.reduce((sum, k) => sum + k.requestCount, 0) ?? 0

  return (
    <main style={{ minHeight: '100vh', padding: '2.5rem 1.25rem 4rem', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.7rem', fontWeight: 700, marginBottom: '.3rem' }}>Dashboard</h1>
          <p style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{user.email}</p>
        </div>
        <button onClick={() => logout().then(() => router.push('/'))} className="btn-ghost">
          <span>Keluar</span>
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '.85rem', marginBottom: '2.2rem' }}>
        <StatCard label="API Key Aktif" value={keys?.filter(k => k.active).length ?? 0} />
        <StatCard label="Total Request" value={totalRequests} />
        <StatCard label="Limit per Akun" value="10 keys" />
      </div>

      {/* Create new key */}
      <section style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '1.4rem', marginBottom: '2rem' }}>
        <h2 style={sectionTitle}>Buat API Key Baru</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginTop: '.9rem' }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama key (mis. nobar-app, dev-test)"
            style={{ flex: '1 1 220px', padding: '.7rem .9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: '.74rem', outline: 'none' }}
          />
          <button type="submit" disabled={creating} className="btn-primary" style={{ opacity: creating ? 0.6 : 1 }}>
            <span>{creating ? 'Membuat...' : '+ Buat Key'}</span>
          </button>
        </form>
      </section>

      {fetchErr && <p style={{ fontSize: '.72rem', color: '#ff6b6b', marginBottom: '1.2rem' }}>{fetchErr}</p>}

      {/* Reveal new key once */}
      {revealedKey && (
        <div style={{ border: '1px solid var(--accent)', background: 'rgba(167,139,250,0.07)', padding: '1.1rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '.68rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.6rem' }}>
            Simpan key ini sekarang — gak akan ditampilkan lagi
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
            <code style={{ fontSize: '.78rem', wordBreak: 'break-all' }}>{revealedKey.key}</code>
            <CopyButton text={revealedKey.key} />
          </div>
          <button onClick={() => setRevealedKey(null)} style={{ marginTop: '.8rem', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
            Tutup
          </button>
        </div>
      )}

      {/* Key list */}
      <section>
        <h2 style={sectionTitle}>API Key Kamu</h2>
        {keys === null && !fetchErr && (
          <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.8rem' }}>Memuat...</p>
        )}
        {keys?.length === 0 && (
          <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.8rem' }}>Belum ada API key. Buat satu di atas.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginTop: '.9rem' }}>
          {keys?.map((k) => {
            const isOpen = expandedId === k.id
            const logState = logsByKey[k.id]
            return (
              <div
                key={k.id}
                style={{
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  opacity: k.active ? 1 : 0.45,
                }}
              >
                <div style={{
                  padding: '1rem 1.1rem', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '.82rem', fontWeight: 600, marginBottom: '.25rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      {k.name}
                      {k.isSessionKey && (
                        <span style={{ fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '.1rem .4rem' }}>
                          Otomatis · Web
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: '.68rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>{k.masked}</p>
                    <p style={{ fontSize: '.62rem', color: 'var(--muted)', marginTop: '.3rem' }}>
                      {k.requestCount} request · {k.lastUsedAt ? `terakhir dipakai ${new Date(k.lastUsedAt).toLocaleDateString('id-ID')}` : 'belum pernah dipakai'}
                      {!k.active && ' · dicabut'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => toggleLogs(k.id)}
                      style={{
                        background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
                        padding: '.5rem .9rem', fontSize: '.65rem', textTransform: 'uppercase',
                        letterSpacing: '.06em', cursor: 'pointer', fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {isOpen ? 'Tutup' : 'Aktivitas'}
                    </button>
                    {k.active && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        disabled={busyId === k.id}
                        style={{
                          background: 'none', border: '1px solid var(--border)', color: '#ff6b6b',
                          padding: '.5rem .9rem', fontSize: '.65rem', textTransform: 'uppercase',
                          letterSpacing: '.06em', cursor: 'pointer', fontFamily: "'DM Mono', monospace",
                          opacity: busyId === k.id ? 0.5 : 1,
                        }}
                      >
                        {busyId === k.id ? '...' : 'Cabut'}
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '.9rem 1.1rem', background: 'var(--bg2)' }}>
                    {logState === 'loading' && (
                      <p style={{ fontSize: '.68rem', color: 'var(--muted)' }}>Memuat aktivitas...</p>
                    )}
                    {logState === 'error' && (
                      <p style={{ fontSize: '.68rem', color: '#ff6b6b' }}>Gagal memuat aktivitas.</p>
                    )}
                    {Array.isArray(logState) && logState.length === 0 && (
                      <p style={{ fontSize: '.68rem', color: 'var(--muted)' }}>Belum ada aktivitas tercatat untuk key ini.</p>
                    )}
                    {Array.isArray(logState) && logState.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', maxHeight: 260, overflowY: 'auto' }}>
                        {logState.map((log) => (
                          <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', fontSize: '.66rem', fontFamily: "'DM Mono', monospace" }}>
                            <span style={{ color: log.method === 'GET' ? '#4ade80' : '#60a5fa', flexShrink: 0, width: 36 }}>{log.method}</span>
                            <span style={{ color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.path}</span>
                            <span style={{ color: 'var(--muted)', flexShrink: 0 }}>
                              {log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '1rem 1.1rem' }}>
      <p style={{ fontSize: '.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.4rem' }}>{label}</p>
      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 700 }}>{value}</p>
    </div>
  )
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700,
}
