'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ENDPOINTS, CATEGORIES } from '@/lib/endpoints'
import { ProviderIcon } from '@/components/ui/ProviderIcon'

const CAT_ICONS: Record<string, React.ReactNode> = {
  'AI CHAT': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M9.5 9h.01M12.5 9h.01M15.5 9h.01" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'DOWNLOADER': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3v13M7 11l5 5 5-5"/><path d="M3 18h18v3H3z"/>
    </svg>
  ),
  'TOOLS': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>
    </svg>
  ),
  'ANIME': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4V8z"/>
    </svg>
  ),
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
}

export default function DocsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.luminaa.web.id'
  const [copied, setCopied] = useState(false)
  const [activecat, setActivecat] = useState(CATEGORIES[0])

  const copy = () => {
    navigator.clipboard.writeText(apiBase)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  // active category on scroll
  useEffect(() => {
    const sections = CATEGORIES.map(cat => ({
      cat,
      el: document.getElementById(cat.toLowerCase().replace(/\s+/g, '-'))
    }))
    const onScroll = () => {
      const scrollY = window.scrollY + 120
      for (let i = sections.length - 1; i >= 0; i--) {
        const { cat, el } = sections[i]
        if (el && el.offsetTop <= scrollY) { setActivecat(cat); break }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        .docs-ep-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 1rem; padding: 1.1rem 1.25rem;
          background: var(--bg); text-decoration: none;
          transition: background .25s, border-left-color .25s;
          position: relative; overflow: hidden; min-height: 44px;
          border-left: 2px solid transparent;
        }
        .docs-ep-row::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(167,139,250,.06), transparent 60%);
          opacity: 0; transition: opacity .3s;
        }
        .docs-ep-row:hover { background: var(--surface); border-left-color: var(--accent); }
        .docs-ep-row:hover::before { opacity: 1; }
        .docs-ep-row:hover .ep-name { color: var(--accent); }
        .docs-ep-row:hover .ep-arrow { opacity: 1; transform: translate(0,0); }
        .ep-arrow {
          opacity: 0; transform: translate(-4px,4px);
          transition: opacity .25s, transform .25s;
          color: var(--accent); flex-shrink: 0; margin-top: 2px;
        }
        .method-get  { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.2); }
        .method-post { background: rgba(96,165,250,.1); color: #60a5fa; border: 1px solid rgba(96,165,250,.2); }
        .cat-section { scroll-margin-top: 80px; }
        .sidebar-link {
          display: flex; align-items: center; gap: .5rem;
          padding: .5rem .75rem; border-radius: 2px;
          font-size: .65rem; letter-spacing: .1em; text-transform: uppercase;
          color: var(--muted); text-decoration: none;
          transition: background .2s, color .2s, border-left-color .2s;
          min-height: 36px; white-space: nowrap;
          border-left: 2px solid transparent;
        }
        .sidebar-link:hover { background: var(--surface); color: var(--text); }
        .sidebar-link.active { color: var(--accent); border-left-color: var(--accent); background: rgba(167,139,250,.06); }
        .docs-layout {
          display: grid; grid-template-columns: 1fr;
          max-width: 1280px; margin: 0 auto; min-height: 100vh;
        }
        @media (min-width: 1024px) {
          .docs-layout { grid-template-columns: 220px 1fr; }
          .docs-sidebar { display: flex !important; }
          .docs-content { border-left: 1px solid var(--border); }
        }
        .docs-sidebar {
          display: none; flex-direction: column;
          position: sticky; top: 60px; height: calc(100vh - 60px);
          overflow-y: auto; padding: 2rem 1rem;
          gap: .2rem; scrollbar-width: thin;
        }
        .ep-path { font-size: .68rem; word-break: break-all; overflow-wrap: anywhere; }
        .copy-btn {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .3rem .6rem; border: 1px solid var(--border);
          background: transparent; color: var(--muted); cursor: pointer;
          font-family: 'DM Mono', monospace; font-size: .6rem;
          letter-spacing: .08em; text-transform: uppercase;
          transition: border-color .2s, color .2s; min-height: 30px;
          flex-shrink: 0;
        }
        .copy-btn:hover { border-color: var(--accent); color: var(--accent); }
        .cat-jump {
          display: inline-flex; align-items: center;
          padding: .35rem .8rem; border: 1px solid var(--border);
          color: var(--muted); text-decoration: none;
          font-size: .6rem; letter-spacing: .1em; text-transform: uppercase;
          min-height: 36px; transition: border-color .2s, color .2s;
        }
        .cat-jump:hover { border-color: var(--accent); color: var(--accent); }
      `}</style>

      <main style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="docs-layout">

          {/* sidebar */}
          <aside className="docs-sidebar">
            <Link href="/" style={{
              fontSize: '.58rem', letterSpacing: '.15em', textTransform: 'uppercase',
              color: 'var(--muted)', textDecoration: 'none', marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '.4rem',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
              </svg>
              Home
            </Link>

            <div style={{ fontSize: '.55rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.75rem', paddingLeft: '.75rem', opacity: .6 }}>
              Kategori
            </div>

            {CATEGORIES.map(cat => {
              const catSlug = cat.toLowerCase().replace(/\s+/g, '-')
              const count   = ENDPOINTS.filter(e => e.category === cat).length
              const icon    = CAT_ICONS[cat]
              return (
                <a key={cat} href={`#${catSlug}`} className={`sidebar-link ${activecat === cat ? 'active' : ''}`}>
                  <span style={{ color: 'var(--accent)', opacity: .7, flexShrink: 0 }}>{icon}</span>
                  <span style={{ flex: 1 }}>{cat}</span>
                  <span style={{ fontSize: '.55rem', opacity: .5 }}>{count}</span>
                </a>
              )
            })}

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <Link href="/playground" style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                padding: '.65rem .75rem', background: 'rgba(167,139,250,.08)',
                border: '1px solid rgba(167,139,250,.2)',
                fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase',
                color: 'var(--accent)', textDecoration: 'none', transition: 'background .2s',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Try Playground
              </Link>
            </div>
          </aside>

          {/* content */}
          <div className="docs-content" style={{ minWidth: 0 }}>

            {/* header */}
            <div style={{
              padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 2.5rem)',
              borderBottom: '1px solid var(--border)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* subtle orb */}
              <div style={{
                position: 'absolute', top: -80, right: -80,
                width: 300, height: 300, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(167,139,250,.1), transparent 70%)',
                filter: 'blur(40px)', pointerEvents: 'none',
              }} />

              <Link href="/" style={{
                fontSize: '.58rem', letterSpacing: '.15em', textTransform: 'uppercase',
                color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex',
                alignItems: 'center', gap: '.4rem', marginBottom: '1.5rem',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
                </svg>
                Home
              </Link>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
                <p style={{ fontSize: '.62rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '.75rem' }}>
                  Reference
                </p>
                <h1 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '-.04em',
                  lineHeight: .95, marginBottom: '1.25rem',
                }}>
                  API Docs
                </h1>

                {/* base url */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem',
                  padding: '.6rem 1rem', background: 'var(--surface)',
                  border: '1px solid var(--border)', flexWrap: 'wrap',
                  marginBottom: '1.5rem', maxWidth: '100%',
                }}>
                  <span style={{ fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', flexShrink: 0 }}>Base URL</span>
                  <code style={{ fontSize: '.72rem', color: 'var(--accent)', flex: 1, wordBreak: 'break-all' }}>{apiBase}</code>
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

                {/* mobile category jump */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                  {CATEGORIES.map(cat => (
                    <a key={cat} href={`#${cat.toLowerCase().replace(/\s+/g, '-')}`} className="cat-jump">
                      {cat}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* endpoint sections */}
            <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2.5rem)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {CATEGORIES.map((cat, ci) => {
                  const catSlug = cat.toLowerCase().replace(/\s+/g, '-')
                  const eps     = ENDPOINTS.filter(e => e.category === cat)
                  return (
                    <motion.section
                      key={cat}
                      id={catSlug}
                      className="cat-section"
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: .6, delay: ci * .05, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {/* section header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '.75rem',
                        marginBottom: '1rem', flexWrap: 'wrap',
                        paddingBottom: '.75rem', borderBottom: '1px solid var(--border)',
                      }}>
                        <span style={{ color: 'var(--accent)' }}>{CAT_ICONS[cat]}</span>
                        <h2 style={{
                          fontFamily: "'Syne', sans-serif", fontWeight: 700,
                          fontSize: 'clamp(.85rem, 2.5vw, 1rem)', letterSpacing: '.06em',
                          textTransform: 'uppercase',
                        }}>{cat}</h2>
                        <span style={{
                          fontSize: '.58rem', letterSpacing: '.1em', padding: '.2rem .55rem',
                          background: 'rgba(167,139,250,.08)', border: '1px solid rgba(167,139,250,.18)',
                          color: 'var(--accent)',
                        }}>
                          {eps.length} endpoint{eps.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* endpoint list */}
                      <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-40px' }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}
                      >
                        {eps.map(ep => (
                          <motion.div key={ep.slug} variants={fadeUp} transition={{ duration: .45, ease: [0.22,1,0.36,1] }}>
                            <Link
                              href={`/docs/${catSlug}/${ep.slug}`}
                              className="docs-ep-row"
                              onMouseMove={e => {
                                const r = e.currentTarget.getBoundingClientRect()
                                e.currentTarget.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100).toFixed(1)+'%')
                                e.currentTarget.style.setProperty('--my', ((e.clientY-r.top)/r.height*100).toFixed(1)+'%')
                              }}
                            >
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.4rem', flexWrap: 'wrap' }}>
                                  <span className={`method-${ep.method.toLowerCase()}`} style={{
                                    fontSize: '.58rem', fontFamily: "'DM Mono', monospace",
                                    fontWeight: 700, padding: '.2rem .5rem', flexShrink: 0,
                                    letterSpacing: '.06em',
                                  }}>
                                    {ep.method}
                                  </span>
                                  <code className="ep-path" style={{ color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>
                                    {ep.path}
                                  </code>
                                </div>
                                <div className="ep-name" style={{
                                  fontFamily: "'Syne', sans-serif", fontWeight: 600,
                                  fontSize: '.85rem', color: 'var(--text)',
                                  transition: 'color .25s', marginBottom: '.2rem',
                                  display: 'flex', alignItems: 'center', gap: '.4rem',
                                }}>
                                  {ep.category === 'AI CHAT' && <ProviderIcon slug={ep.slug} size={15} />}
                                  {ep.name}
                                </div>
                                <div style={{ fontSize: '.68rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                                  {ep.desc}
                                </div>
                              </div>
                              <div className="ep-arrow">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                                </svg>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.section>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
