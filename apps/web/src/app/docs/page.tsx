import type { Metadata } from 'next'
import Link from 'next/link'
import { ENDPOINTS, CATEGORIES } from '@/lib/endpoints'

export const metadata: Metadata = {
  title: 'API Documentation',
  description: 'Dokumentasi lengkap semua endpoint Lumina API. AI Chat, Downloader, Tools, Anime, dan banyak lagi.',
}

const CAT_ICONS: Record<string, string> = {
  'AI CHAT':    'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  'DOWNLOADER': 'M12 3v13M7 11l5 5 5-5M3 18h18',
  'TOOLS':      'M2 3h20v18H2zM7 9l3 3-3 3M13 15h4',
  'ANIME':      'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM10 8l6 4-6 4V8z',
}

export default function DocsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.lumina.vercel.app'

  return (
    <>
      <style>{`
        .docs-ep-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border);
          background: var(--bg);
          text-decoration: none;
          transition: background .25s, border-color .25s;
          position: relative;
          overflow: hidden;
          min-height: 44px;
        }
        .docs-ep-row:hover {
          background: var(--surface);
          border-color: rgba(232,100,58,.3);
        }
        .docs-ep-row:hover .ep-name { color: var(--accent); }
        .docs-ep-row:hover .ep-arrow { opacity: 1; transform: translate(0,0); }
        .ep-arrow {
          opacity: 0;
          transform: translate(-4px,4px);
          transition: opacity .25s, transform .25s;
          color: var(--accent);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .method-get  { background: rgba(74,222,128,.12); color: #4ade80; }
        .method-post { background: rgba(96,165,250,.12); color: #60a5fa; }
        .cat-section { scroll-margin-top: 80px; }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: .5rem;
          padding: .5rem .75rem;
          border-radius: 4px;
          font-size: .68rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--muted);
          text-decoration: none;
          transition: background .2s, color .2s;
          min-height: 36px;
          white-space: nowrap;
        }
        .sidebar-link:hover { background: var(--surface); color: var(--text); }
        .sidebar-link.active { color: var(--accent); }
        .docs-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          max-width: 1280px;
          margin: 0 auto;
          min-height: 100vh;
        }
        @media (min-width: 1024px) {
          .docs-layout {
            grid-template-columns: 220px 1fr;
          }
          .docs-sidebar {
            display: flex !important;
          }
          .docs-content { border-left: 1px solid var(--border); }
        }
        .docs-sidebar {
          display: none;
          flex-direction: column;
          position: sticky;
          top: 60px;
          height: calc(100vh - 60px);
          overflow-y: auto;
          padding: 2rem 1rem;
          border-right: 1px solid var(--border);
          gap: .25rem;
          scrollbar-width: thin;
        }
        .ep-path {
          font-size: .7rem;
          word-break: break-all;
          overflow-wrap: anywhere;
        }
      `}</style>

      <main style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="docs-layout">

          {/* ── Sidebar — desktop only ── */}
          <aside className="docs-sidebar">
            <Link href="/" style={{
              fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase',
              color: 'var(--muted)', textDecoration: 'none', marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '.4rem',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
              Home
            </Link>

            <div style={{ fontSize: '.58rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.75rem', paddingLeft: '.75rem' }}>
              Kategori
            </div>

            {CATEGORIES.map(cat => {
              const catSlug = cat.toLowerCase().replace(/\s+/g, '-')
              const count   = ENDPOINTS.filter(e => e.category === cat).length
              return (
                <a key={cat} href={`#${catSlug}`} className="sidebar-link">
                  <span style={{ flex: 1 }}>{cat}</span>
                  <span style={{ fontSize: '.58rem', color: 'var(--muted)', opacity: .6 }}>{count}</span>
                </a>
              )
            })}

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <Link href="/playground" style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                padding: '.6rem .75rem', background: 'var(--surface)', border: '1px solid var(--border)',
                fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase',
                color: 'var(--accent)', textDecoration: 'none', transition: 'border-color .2s',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Playground
              </Link>
            </div>
          </aside>

          {/* ── Content ── */}
          <div className="docs-content" style={{ minWidth: 0 }}>

            {/* header */}
            <div style={{
              padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 2.5rem)',
              borderBottom: '1px solid var(--border)',
            }}>
              {/* mobile back */}
              <Link href="/" className="lg:hidden" style={{
                fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase',
                color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex',
                alignItems: 'center', gap: '.4rem', marginBottom: '1.5rem',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
                Home
              </Link>

              <p style={{ fontSize: '.62rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '.75rem' }}>
                Reference
              </p>
              <h1 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '-.04em',
                lineHeight: .95, marginBottom: '1rem',
              }}>
                API Docs
              </h1>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '.6rem',
                padding: '.5rem .9rem',
                background: 'var(--surface)', border: '1px solid var(--border)',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Base URL</span>
                <code style={{ fontSize: '.7rem', color: 'var(--accent)', wordBreak: 'break-all' }}>{apiBase}</code>
              </div>

              {/* mobile category jump */}
              <div className="lg:hidden" style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                {CATEGORIES.map(cat => {
                  const catSlug = cat.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <a key={cat} href={`#${catSlug}`} style={{
                      fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase',
                      padding: '.35rem .7rem', border: '1px solid var(--border)',
                      color: 'var(--muted)', textDecoration: 'none', borderRadius: 0,
                      minHeight: 36, display: 'inline-flex', alignItems: 'center',
                      transition: 'border-color .2s, color .2s',
                    }}>
                      {cat}
                    </a>
                  )
                })}
              </div>
            </div>

            {/* categories */}
            <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2.5rem)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {CATEGORIES.map(cat => {
                  const catSlug = cat.toLowerCase().replace(/\s+/g, '-')
                  const eps     = ENDPOINTS.filter(e => e.category === cat)
                  const icon    = CAT_ICONS[cat]
                  return (
                    <section key={cat} id={catSlug} className="cat-section">
                      {/* section header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '.75rem',
                        marginBottom: '1.25rem', flexWrap: 'wrap',
                      }}>
                        {icon && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: 'var(--accent)', flexShrink: 0 }}>
                            <path d={icon}/>
                          </svg>
                        )}
                        <h2 style={{
                          fontFamily: "'Syne', sans-serif", fontWeight: 700,
                          fontSize: 'clamp(.85rem, 2.5vw, 1rem)', letterSpacing: '.06em',
                          textTransform: 'uppercase',
                        }}>{cat}</h2>
                        <span style={{
                          fontSize: '.6rem', letterSpacing: '.1em', padding: '.2rem .5rem',
                          border: '1px solid var(--border)', color: 'var(--muted)',
                        }}>
                          {eps.length} endpoint{eps.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* endpoint list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
                        {eps.map(ep => (
                          <Link
                            key={ep.slug}
                            href={`/docs/${catSlug}/${ep.slug}`}
                            className="docs-ep-row"
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.35rem', flexWrap: 'wrap' }}>
                                <span className={`method-${ep.method.toLowerCase()}`} style={{
                                  fontSize: '.6rem', fontFamily: "'DM Mono', monospace",
                                  fontWeight: 700, padding: '.2rem .45rem', flexShrink: 0,
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
                                fontSize: '.82rem', color: 'var(--text)',
                                transition: 'color .25s', marginBottom: '.2rem',
                              }}>
                                {ep.name}
                              </div>
                              <div style={{ fontSize: '.68rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                                {ep.desc}
                              </div>
                            </div>

                            <div className="ep-arrow" style={{ marginTop: 4 }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7 17L17 7M17 7H7M17 7v10"/>
                              </svg>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
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
