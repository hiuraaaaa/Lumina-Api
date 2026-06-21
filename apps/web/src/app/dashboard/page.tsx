'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import CopyButton from '@/components/ui/CopyButton'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.lumina.vercel.app'

interface Summary {
  activeKeys: number
  totalRequests: number
}

export default function DashboardOverviewPage() {
  const { user, getToken } = useAuth()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [tab, setTab] = useState<'curl' | 'js'>('curl')

  const load = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/account/keys`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.status) return
      setSummary({
        activeKeys: data.result.filter((k: any) => k.active).length,
        totalRequests: data.result.reduce((sum: number, k: any) => sum + k.requestCount, 0),
      })
    } catch { /* diamkan, ini cuma ringkasan */ }
  }, [getToken])

  useEffect(() => { if (user) load() }, [user, load])

  return (
    <main style={{ minHeight: '100vh', padding: '2.5rem 1.25rem 4rem', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.7rem', fontWeight: 700, marginBottom: '.3rem' }}>
          Selamat datang{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p style={{ fontSize: '.72rem', color: 'var(--muted)' }}>Ringkasan akun & cara mulai pakai Lumina API.</p>
      </div>

      {/* summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '.85rem', marginBottom: '2.2rem' }}>
        <StatCard label="API Key Aktif" value={summary?.activeKeys ?? '–'} />
        <StatCard label="Total Request" value={summary?.totalRequests ?? '–'} />
        <StatCard label="Limit Pakai Key" value="100/min" />
      </div>

      {/* quickstart */}
      <section style={{ border: '1px solid var(--border)', background: 'var(--surface)', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.2rem 1.4rem .8rem' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '.3rem' }}>Quickstart</h2>
          <p style={{ fontSize: '.72rem', color: 'var(--muted)' }}>Buat key dulu di tab API Keys, terus langsung jalanin ini.</p>
        </div>
        <div style={{ display: 'flex', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          {(['curl', 'js'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '.6rem 1.2rem', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.06em',
                background: tab === t ? 'var(--bg2)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--muted)',
                border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {t === 'curl' ? 'cURL' : 'JavaScript'}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <pre style={{
            margin: 0, padding: '1.1rem 1.4rem', fontSize: '.7rem', fontFamily: "'DM Mono', monospace",
            color: 'var(--text)', overflowX: 'auto', lineHeight: 1.7, whiteSpace: 'pre',
          }}>
{tab === 'curl'
  ? `curl "${API_BASE}/api/ai-chat/lumina?query=halo" \\\n  -H "x-api-key: lumina-xxxxxxxxxxxx"`
  : `fetch("${API_BASE}/api/ai-chat/lumina?query=halo", {\n  headers: { "x-api-key": "lumina-xxxxxxxxxxxx" }\n})\n  .then(res => res.json())\n  .then(console.log)`}
          </pre>
          <div style={{ position: 'absolute', top: '.6rem', right: '.6rem' }}>
            <CopyButton text={tab === 'curl'
              ? `curl "${API_BASE}/api/ai-chat/lumina?query=halo" -H "x-api-key: lumina-xxxxxxxxxxxx"`
              : `fetch("${API_BASE}/api/ai-chat/lumina?query=halo", { headers: { "x-api-key": "lumina-xxxxxxxxxxxx" } }).then(res => res.json()).then(console.log)`} />
          </div>
        </div>
      </section>

      {/* action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.85rem' }}>
        <ActionCard href="/dashboard/keys"      title="Kelola API Keys"     desc="Buat, lihat usage, cabut key" />
        <ActionCard href="/dashboard/endpoints" title="Jelajah Endpoint"    desc="Semua endpoint yang tersedia" />
        <ActionCard href="/docs"                title="Baca Dokumentasi"    desc="Detail params & contoh tiap endpoint" />
        <ActionCard href="/playground"          title="Coba di Playground" desc="Test endpoint langsung di browser" />
      </div>
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

function ActionCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} style={{
      display: 'block', border: '1px solid var(--border)', background: 'var(--surface)',
      padding: '1.1rem 1.2rem', textDecoration: 'none', color: 'var(--text)', transition: 'border-color .2s',
    }}>
      <p style={{ fontSize: '.85rem', fontWeight: 600, marginBottom: '.3rem' }}>{title}</p>
      <p style={{ fontSize: '.7rem', color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</p>
    </Link>
  )
}
