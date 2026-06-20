import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ENDPOINTS, CATEGORIES, getEndpoint } from '@/lib/endpoints'
import PlaygroundInline from '@/components/ui/PlaygroundInline'
import CopyButton from '@/components/ui/CopyButton'
import EndpointContent from '@/components/ui/EndpointContent'

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

  const apiBase    = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.luminaa.web.id'
  const exampleUrl = `${apiBase}${ep.path}?${ep.params.filter(p => p.required).map(p => `${p.name}=example`).join('&')}`

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
          background: rgba(232,100,58,.06);
          border-left-color: var(--accent);
        }
        .method-get  { background: rgba(74,222,128,.1);  color: #4ade80; border: 1px solid rgba(74,222,128,.2); }
        .method-post { background: rgba(96,165,250,.1);  color: #60a5fa; border: 1px solid rgba(96,165,250,.2); }
        .breadcrumb-link { font-size: .63rem; color: var(--muted); text-decoration: none; transition: color .2s; }
        .breadcrumb-link:hover { color: var(--text); }
      `}</style>

      <main style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="ep-detail-layout">

          {/* ── sidebar ── */}
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

          {/* ── main — delegated to client component for framer-motion ── */}
          <div className="ep-main" style={{ minWidth: 0 }}>
            <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2.5rem)' }}>

              {/* breadcrumb — static, no animation needed */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '.35rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {[
                  { label: 'Home',       href: '/' },
                  { label: 'Docs',       href: '/docs' },
                  { label: ep!.category, href: `/docs#${params.category}` },
                  { label: ep!.name,     href: null },
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

              {/* animated content — client component */}
              <EndpointContent
                ep={ep!}
                exampleUrl={exampleUrl}
                apiBase={apiBase}
              />

            </div>
          </div>

        </div>
      </main>
    </>
  )
}
