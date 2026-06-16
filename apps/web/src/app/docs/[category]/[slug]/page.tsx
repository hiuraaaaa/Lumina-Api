import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ENDPOINTS, CATEGORIES } from '@/lib/endpoints'
import { getEndpoint } from '@/lib/endpoints'
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ep = getEndpoint(params.category, params.slug)
  if (!ep) return {}
  return {
    title:       `${ep.name} — Lumina API`,
    description: ep.desc,
    openGraph:   { title: ep.name, description: ep.desc },
  }
}

export default function EndpointPage({ params }: Props) {
  const ep = getEndpoint(params.category, params.slug)
  if (!ep) notFound()

  const apiBase    = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.lumina.vercel.app'
  const exampleUrl = `${apiBase}${ep.path}?${ep.params.filter(p => p.required).map(p => `${p.name}=example`).join('&')}`

  return (
    <>
      <style>{`
        .ep-detail-layout {
          display: grid;
          grid-template-columns: 1fr;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (min-width: 1024px) {
          .ep-detail-layout {
            grid-template-columns: 220px 1fr;
          }
          .ep-sidebar { display: flex !important; }
          .ep-main { border-left: 1px solid var(--border); }
        }
        .ep-sidebar {
          display: none;
          flex-direction: column;
          position: sticky;
          top: 60px;
          height: calc(100vh - 60px);
          overflow-y: auto;
          padding: 2rem 1rem;
          gap: .2rem;
          scrollbar-width: thin;
          border-right: 1px solid var(--border);
        }
        .sidebar-ep-btn {
          display: flex;
          align-items: flex-start;
          gap: .5rem;
          padding: .5rem .75rem;
          font-size: .68rem;
          color: var(--muted);
          text-decoration: none;
          transition: background .2s, color .2s;
          min-height: 36px;
          line-height: 1.4;
        }
        .sidebar-ep-btn:hover { background: var(--surface); color: var(--text); }
        .sidebar-ep-btn.active { color: var(--accent); background: rgba(232,100,58,.06); }
        .param-row {
          display: grid;
          grid-template-columns: minmax(80px, 1fr) 60px 80px;
          gap: .5rem;
          padding: .85rem 1rem;
          border-bottom: 1px solid var(--border);
          align-items: start;
          font-size: .72rem;
        }
        .param-row:last-child { border-bottom: none; }
        @media (min-width: 640px) {
          .param-row {
            grid-template-columns: minmax(100px, 1fr) 80px 90px 1fr;
          }
        }
        .param-desc { display: none; }
        @media (min-width: 640px) { .param-desc { display: block; } }
        .param-desc-mobile {
          grid-column: 1 / -1;
          font-size: .68rem;
          color: var(--muted);
          padding-top: .3rem;
          line-height: 1.5;
        }
        @media (min-width: 640px) { .param-desc-mobile { display: none; } }
        .method-get  { background: rgba(74,222,128,.12);  color: #4ade80; }
        .method-post { background: rgba(96,165,250,.12);  color: #60a5fa; }
      `}</style>

      <main style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="ep-detail-layout">

          {/* ── Sidebar ── */}
          <aside className="ep-sidebar">
            <Link href="/docs" style={{
              fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase',
              color: 'var(--muted)', textDecoration: 'none', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '.4rem',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
              All Docs
            </Link>

            {CATEGORIES.map(cat => {
              const catSlug = cat.toLowerCase().replace(/\s+/g, '-')
              const eps     = ENDPOINTS.filter(e => e.category === cat)
              return (
                <div key={cat}>
                  <div style={{
                    fontSize: '.58rem', letterSpacing: '.18em', textTransform: 'uppercase',
                    color: 'var(--muted)', padding: '.75rem .75rem .35rem', opacity: .6,
                  }}>
                    {cat}
                  </div>
                  {eps.map(e => {
                    const eSlug = e.category.toLowerCase().replace(/\s+/g, '-')
                    const isActive = e.slug === ep?.slug && eSlug === params.category
                    return (
                      <Link
                        key={e.slug}
                        href={`/docs/${eSlug}/${e.slug}`}
                        className={`sidebar-ep-btn ${isActive ? 'active' : ''}`}
                      >
                        <span style={{
                          fontSize: '.58rem', fontFamily: "'DM Mono', monospace",
                          fontWeight: 700, flexShrink: 0, paddingTop: 1,
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

          {/* ── Main ── */}
          <div className="ep-main" style={{ minWidth: 0 }}>
            <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2.5rem)' }}>

              {/* breadcrumb */}
              <nav style={{
                display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap',
                marginBottom: '2rem',
              }}>
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Docs', href: '/docs' },
                  { label: ep!.category, href: `/docs#${params.category}` },
                  { label: ep!.name, href: null },
                ].map((b, i, arr) => (
                  <span key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    {i > 0 && <span style={{ color: 'var(--muted)', fontSize: '.65rem' }}>/</span>}
                    {b.href ? (
                      <Link href={b.href} style={{
                        fontSize: '.65rem', color: 'var(--muted)', textDecoration: 'none',
                        transition: 'color .2s',
                      }}
                        className="hover:text-[var(--text)]"
                      >
                        {b.label}
                      </Link>
                    ) : (
                      <span style={{ fontSize: '.65rem', color: 'var(--text)' }}>{b.label}</span>
                    )}
                  </span>
                ))}
              </nav>

              {/* header */}
              <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.85rem', flexWrap: 'wrap' }}>
                  <span className={`method-${ep!.method.toLowerCase()}`} style={{
                    fontSize: '.65rem', fontFamily: "'DM Mono', monospace",
                    fontWeight: 700, padding: '.3rem .6rem', letterSpacing: '.08em',
                  }}>
                    {ep!.method}
                  </span>
                  <code style={{
                    fontSize: 'clamp(.7rem, 2vw, .85rem)',
                    fontFamily: "'DM Mono', monospace",
                    color: 'var(--accent)', wordBreak: 'break-all',
                  }}>
                    {ep!.path}
                  </code>
                </div>
                <h1 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
                  letterSpacing: '-.04em', lineHeight: 1, marginBottom: '.6rem',
                }}>
                  {ep!.name}
                </h1>
                <p style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                  {ep!.desc}
                </p>
              </div>

              {/* parameters */}
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase',
                  color: 'var(--muted)', marginBottom: '1rem',
                }}>
                  Parameters
                </h2>

                {ep!.params.length === 0 ? (
                  <div style={{
                    padding: '1.2rem', border: '1px solid var(--border)',
                    fontSize: '.72rem', color: 'var(--muted)',
                  }}>
                    No parameters required.
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--border)' }}>
                    {/* header row — desktop */}
                    <div className="hidden sm:grid" style={{
                      gridTemplateColumns: 'minmax(100px, 1fr) 80px 90px 1fr',
                      gap: '.5rem', padding: '.65rem 1rem',
                      borderBottom: '1px solid var(--border)',
                      background: 'var(--surface)',
                    }}>
                      {['Name', 'Type', 'Required', 'Description'].map(h => (
                        <div key={h} style={{ fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</div>
                      ))}
                    </div>

                    {ep!.params.map(p => (
                      <div key={p.name} className="param-row">
                        <code style={{ fontFamily: "'DM Mono', monospace", color: 'var(--accent)', fontSize: '.7rem', wordBreak: 'break-all' }}>
                          {p.name}
                        </code>
                        <span style={{ color: 'var(--muted)', fontSize: '.68rem' }}>{p.type}</span>
                        <span style={{
                          fontSize: '.6rem', padding: '.2rem .45rem',
                          background: p.required ? 'rgba(239,68,68,.12)' : 'rgba(107,104,117,.12)',
                          color:      p.required ? '#f87171' : 'var(--muted)',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          alignSelf: 'flex-start',
                        }}>
                          {p.required ? 'required' : 'optional'}
                        </span>
                        <span className="param-desc" style={{ color: 'var(--muted)', fontSize: '.7rem', lineHeight: 1.5 }}>{p.description}</span>
                        {/* mobile description */}
                        <span className="param-desc-mobile">{p.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* example request */}
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase',
                  color: 'var(--muted)', marginBottom: '1rem',
                }}>
                  Example Request
                </h2>
                <div style={{
                  padding: '1rem', border: '1px solid var(--border)',
                  background: 'var(--surface)', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <code style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 'clamp(.65rem, 2vw, .72rem)',
                      color: 'var(--muted)', whiteSpace: 'pre', display: 'block',
                    }}>
                      <span style={{ color: 'var(--accent)' }}>GET </span>{exampleUrl}
                    </code>
                  </div>
                </div>
              </section>

              {/* playground */}
              <section>
                <h2 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase',
                  color: 'var(--muted)', marginBottom: '1rem',
                }}>
                  Try It
                </h2>
                <PlaygroundInline endpoint={ep!} apiBase={apiBase} />
              </section>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}
