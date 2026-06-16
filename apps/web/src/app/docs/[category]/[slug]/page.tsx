'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ENDPOINTS, CATEGORIES, getEndpoint } from '@/lib/endpoints'
import PlaygroundInline from '@/components/ui/PlaygroundInline'

interface Props {
  params: { category: string; slug: string }
}

export async function generateStaticParams() {
  return ENDPOINTS.map(ep => ({
    category: ep.category.toLowerCase().replace(/\s+/g, '-'),
    slug:     ep.slug,
  }))
}

export async function generateMetadata({ params }: Props) {
  const ep = getEndpoint(params.category, params.slug)
  if (!ep) return {}
  return {
    title:       `${ep.name} — Lumina API`,
    description: ep.desc,
    openGraph:   { title: ep.name, description: ep.desc },
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: .6, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
}

export default function EndpointPage({ params }: Props) {
  const ep = getEndpoint(params.category, params.slug)
  if (!ep) notFound()

  const apiBase    = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.luminaa.web.id'
  const exampleUrl = `${apiBase}${ep.path}?${ep.params.filter(p => p.required).map(p => `${p.name}=example`).join('&')}`

  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(exampleUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <>
      <style>{`
        .ep-detail-layout {
          display: grid; grid-template-columns: 1fr;
          max-width: 1280px; margin: 0 auto;
        }
        @media (min-width: 1024px) {
          .ep-detail-layout { grid-template-columns: 220px 1fr; }
          .ep-sidebar { display: flex !important; }
          .ep-main { border-left: 1px solid var(--border); }
        }
        .ep-sidebar {
          display: none; flex-direction: column;
          position: sticky; top: 60px; height: calc(100vh - 60px);
          overflow-y: auto; padding: 2rem 1rem;
          gap: .15rem; scrollbar-width: thin;
          border-right: 1px solid var(--border);
        }
        .sidebar-ep-btn {
          display: flex; align-items: flex-start; gap: .5rem;
          padding: .45rem .75rem; font-size: .67rem;
          color: var(--muted); text-decoration: none;
          transition: background .2s, color .2s, border-left-color .2s;
          min-height: 36px; line-height: 1.4;
          border-left: 2px solid transparent;
        }
        .sidebar-ep-btn:hover { background: var(--surface); color: var(--text); }
        .sidebar-ep-btn.active {
          color: var(--accent);
          background: rgba(167,139,250,.06);
          border-left-color: var(--accent);
        }
        .param-row {
          display: grid;
          grid-template-columns: minmax(80px,1fr) 60px 85px;
          gap: .5rem; padding: .9rem 1rem;
          border-bottom: 1px solid var(--border);
          align-items: start; font-size: .72rem;
        }
        .param-row:last-child { border-bottom: none; }
        @media (min-width: 640px) {
          .param-row { grid-template-columns: minmax(100px,1fr) 80px 90px 1fr; }
        }
        .param-desc { display: none; }
        @media (min-width: 640px) { .param-desc { display: block; } }
        .param-desc-mobile {
          grid-column: 1 / -1; font-size: .67rem;
          color: var(--muted); padding-top: .3rem; line-height: 1.5;
        }
        @media (min-width: 640px) { .param-desc-mobile { display: none; } }
        .method-get  { background: rgba(74,222,128,.1);  color: #4ade80; border: 1px solid rgba(74,222,128,.2); }
        .method-post { background: rgba(96,165,250,.1);  color: #60a5fa; border: 1px solid rgba(96,165,250,.2); }
        .copy-btn {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .3rem .6rem; border: 1px solid var(--border);
          background: transparent; color: var(--muted); cursor: pointer;
          font-family: 'DM Mono', monospace; font-size: .6rem;
          letter-spacing: .08em; text-transform: uppercase;
          transition: border-color .2s, color .2s; min-height: 30px; flex-shrink: 0;
        }
        .copy-btn:hover { border-color: var(--accent); color: var(--accent); }
        .breadcrumb-link { font-size: .63rem; color: var(--muted); text-decoration: none; transition: color .2s; }
        .breadcrumb-link:hover { color: var(--text); }
        .section-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: .72rem; letter-spacing: .18em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 1rem;
          display: flex; align-items: center; gap: .5rem;
        }
        .section-title::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }
      `}</style>

      <main style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="ep-detail-layout">

          {/* sidebar */}
          <aside className="ep-sidebar">
            <Link href="/docs" style={{
              fontSize: '.58rem', letterSpacing: '.15em', textTransform: 'uppercase',
              color: 'var(--muted)', textDecoration: 'none', marginBottom: '1.25rem',
              display: 'flex', alignItems: 'center', gap: '.4rem',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
              </svg>
              All Docs
            </Link>

            {CATEGORIES.map(cat => {
              const catSlug = cat.toLowerCase().replace(/\s+/g, '-')
              const eps     = ENDPOINTS.filter(e => e.category === cat)
              return (
                <div key={cat}>
                  <div style={{
                    fontSize: '.55rem', letterSpacing: '.18em', textTransform: 'uppercase',
                    color: 'var(--muted)', padding: '.75rem .75rem .3rem', opacity: .5,
                  }}>
                    {cat}
                  </div>
                  {eps.map(e => {
                    const eSlug    = e.category.toLowerCase().replace(/\s+/g, '-')
                    const isActive = e.slug === ep?.slug && eSlug === params.category
                    return (
                      <Link
                        key={e.slug}
                        href={`/docs/${eSlug}/${e.slug}`}
                        className={`sidebar-ep-btn ${isActive ? 'active' : ''}`}
                      >
                        <span style={{
                          fontSize: '.56rem', fontFamily: "'DM Mono', monospace",
                          fontWeight: 700, flexShrink: 0, paddingTop: 2,
                          color: e.method === 'GET' ? '#4ade80' : '#60a5fa',
                        }}>
                          {e.method}
                        </span>
                        <span style={{ lineHeight: 1.4 }}>{e.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </aside>

          {/* main */}
          <div className="ep-main" style={{ minWidth: 0 }}>
            <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2.5rem)' }}>

              {/* breadcrumb */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '.35rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {[
                  { label: 'Home',        href: '/' },
                  { label: 'Docs',        href: '/docs' },
                  { label: ep!.category,  href: `/docs#${params.category}` },
                  { label: ep!.name,      href: null },
                ].map((b, i) => (
                  <span key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                    {i > 0 && <span style={{ color: 'var(--border)', fontSize: '.7rem' }}>/</span>}
                    {b.href
                      ? <Link href={b.href} className="breadcrumb-link">{b.label}</Link>
                      : <span style={{ fontSize: '.63rem', color: 'var(--text)' }}>{b.label}</span>
                    }
                  </span>
                ))}
              </nav>

              {/* endpoint header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .65, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  marginBottom: '2.5rem',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '2rem',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* orb */}
                <div style={{
                  position: 'absolute', top: -60, right: -60,
                  width: 220, height: 220, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(167,139,250,.12), transparent 70%)',
                  filter: 'blur(40px)', pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.9rem', flexWrap: 'wrap' }}>
                  <span className={`method-${ep!.method.toLowerCase()}`} style={{
                    fontSize: '.63rem', fontFamily: "'DM Mono', monospace",
                    fontWeight: 700, padding: '.28rem .6rem', letterSpacing: '.08em',
                  }}>
                    {ep!.method}
                  </span>
                  <code style={{
                    fontSize: 'clamp(.68rem, 2vw, .82rem)',
                    fontFamily: "'DM Mono', monospace",
                    color: 'var(--accent)', wordBreak: 'break-all',
                  }}>
                    {ep!.path}
                  </code>
                </div>

                <h1 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
                  letterSpacing: '-.04em', lineHeight: 1.05, marginBottom: '.65rem',
                }}>
                  {ep!.name}
                </h1>
                <p style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.75, maxWidth: 520 }}>
                  {ep!.desc}
                </p>
              </motion.div>

              <motion.div variants={stagger} initial="hidden" animate="show">

                {/* parameters */}
                <motion.section variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
                  <div className="section-title">Parameters</div>

                  {ep!.params.length === 0 ? (
                    <div style={{
                      padding: '1.2rem', border: '1px solid var(--border)',
                      fontSize: '.72rem', color: 'var(--muted)',
                      background: 'var(--surface)',
                    }}>
                      No parameters required.
                    </div>
                  ) : (
                    <div style={{ border: '1px solid var(--border)' }}>
                      {/* header — desktop */}
                      <div style={{
                        display: 'none',
                        gridTemplateColumns: 'minmax(100px,1fr) 80px 90px 1fr',
                        gap: '.5rem', padding: '.6rem 1rem',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--surface)',
                      }} className="sm-grid">
                        {['Name', 'Type', 'Required', 'Description'].map(h => (
                          <div key={h} style={{ fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</div>
                        ))}
                      </div>

                      {ep!.params.map((p, i) => (
                        <motion.div
                          key={p.name}
                          className="param-row"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * .06, duration: .4 }}
                        >
                          <code style={{ fontFamily: "'DM Mono', monospace", color: 'var(--accent)', fontSize: '.7rem', wordBreak: 'break-all' }}>
                            {p.name}
                          </code>
                          <span style={{ color: 'var(--muted)', fontSize: '.67rem' }}>{p.type}</span>
                          <span style={{
                            fontSize: '.58rem', padding: '.2rem .45rem',
                            background: p.required ? 'rgba(239,68,68,.1)' : 'rgba(107,104,117,.1)',
                            color:      p.required ? '#f87171' : 'var(--muted)',
                            border:     `1px solid ${p.required ? 'rgba(239,68,68,.2)' : 'var(--border)'}`,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            alignSelf: 'flex-start',
                          }}>
                            {p.required ? 'required' : 'optional'}
                          </span>
                          <span className="param-desc" style={{ color: 'var(--muted)', fontSize: '.7rem', lineHeight: 1.6 }}>{p.description}</span>
                          <span className="param-desc-mobile">{p.description}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.section>

                {/* example request */}
                <motion.section variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
                  <div className="section-title">Example Request</div>
                  <div style={{
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* top bar */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '.5rem .75rem', borderBottom: '1px solid var(--border)',
                      gap: '.5rem',
                    }}>
                      <span style={{ fontSize: '.58rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                        curl
                      </span>
                      <button className="copy-btn" onClick={copy}>
                        {copied ? (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            copied
                          </>
                        ) : (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            copy
                          </>
                        )}
                      </button>
                    </div>
                    <div style={{ padding: '1rem', overflowX: 'auto' }}>
                      <code style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 'clamp(.63rem, 2vw, .72rem)',
                        color: 'var(--muted)', whiteSpace: 'pre', display: 'block',
                      }}>
                        <span style={{ color: 'var(--accent)', opacity: .7 }}>$</span>{' '}
                        <span style={{ color: '#60a5fa' }}>curl</span>{' '}
                        <span style={{ color: 'var(--text)' }}>&quot;{exampleUrl}&quot;</span>
                      </code>
                    </div>
                  </div>
                </motion.section>

                {/* try it */}
                <motion.section variants={fadeUp}>
                  <div className="section-title">Try It</div>
                  <PlaygroundInline endpoint={ep!} apiBase={apiBase} />
                </motion.section>

              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
