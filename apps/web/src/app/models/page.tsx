'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ENDPOINTS, CATEGORIES } from '@/lib/endpoints'
import { ProviderIcon } from '@/components/ui/ProviderIcon'

export default function EndpointsCatalogPage() {
  const [activeCat, setActiveCat] = useState<string>('Semua')
  const [filter, setFilter]       = useState('')

  const cats = ['Semua', ...CATEGORIES]

  const filtered = ENDPOINTS.filter(e => {
    const matchCat = activeCat === 'Semua' || e.category === activeCat
    const matchText = e.name.toLowerCase().includes(filter.toLowerCase())
      || e.desc.toLowerCase().includes(filter.toLowerCase())
    return matchCat && matchText
  })

  return (
    <main style={{ minHeight: '100vh', padding: 'calc(64px + 2.5rem) 1.25rem 4rem', maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.6rem' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.7rem', fontWeight: 700, marginBottom: '.3rem' }}>Endpoints</h1>
        <p style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{ENDPOINTS.length} endpoint tersedia, terorganisir per kategori.</p>
      </div>

      {/* filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem', marginBottom: '1.8rem' }}>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Cari endpoint..."
          style={{
            width: '100%', boxSizing: 'border-box', background: 'var(--bg2)', border: '1px solid var(--border)',
            padding: '.7rem .9rem', fontFamily: "'DM Mono', monospace", fontSize: '.74rem', color: 'var(--text)', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {cats.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                padding: '.4rem .9rem', fontSize: '.66rem', textTransform: 'uppercase', letterSpacing: '.06em',
                border: '1px solid ' + (activeCat === cat ? 'var(--accent)' : 'var(--border)'),
                background: activeCat === cat ? 'rgba(167,139,250,.08)' : 'transparent',
                color: activeCat === cat ? 'var(--accent)' : 'var(--muted)',
                cursor: 'pointer', fontFamily: "'DM Mono', monospace",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.9rem' }}>
        {filtered.map(ep => {
          const catSlug = ep.category.toLowerCase().replace(/\s+/g, '-')
          return (
            <Link
              key={`${ep.category}-${ep.slug}`}
              href={`/docs/${catSlug}/${ep.slug}`}
              style={{
                display: 'block', border: '1px solid var(--border)', background: 'var(--surface)',
                padding: '1.1rem 1.2rem', textDecoration: 'none', color: 'var(--text)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.6rem' }}>
                <span style={{
                  fontSize: '.6rem', fontFamily: "'DM Mono', monospace", fontWeight: 700,
                  padding: '.2rem .45rem',
                  background: ep.method === 'GET' ? 'rgba(74,222,128,.12)' : 'rgba(96,165,250,.12)',
                  color:      ep.method === 'GET' ? '#4ade80' : '#60a5fa',
                }}>
                  {ep.method}
                </span>
                <span style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{ep.category}</span>
              </div>
              <p style={{ fontSize: '.88rem', fontWeight: 600, marginBottom: '.4rem', display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                {ep.category === 'AI CHAT' && <ProviderIcon slug={ep.slug} size={16} />}
                {ep.name}
              </p>
              <p style={{ fontSize: '.7rem', color: 'var(--muted)', lineHeight: 1.55 }}>{ep.desc}</p>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <p style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Gak ada endpoint yang cocok.</p>
        )}
      </div>
    </main>
  )
}
