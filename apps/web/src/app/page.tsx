'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ENDPOINTS, CATEGORIES } from '@/lib/endpoints'

/* ─────────────────────────────────── icons ── */
const IconDoc = () => (
  <svg style={{ width: 13, height: 13, position: 'relative', zIndex: 1 }}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
)
const IconPlay = () => (
  <svg style={{ width: 13, height: 13, position: 'relative', zIndex: 1 }}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const IconArrow = () => (
  <svg style={{ width: 20, height: 20 }}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 17L17 7M17 7H7M17 7v10"/>
  </svg>
)

/* ─────────────────────────────── cat icons ── */
const CAT_ICONS: Record<string, React.ReactNode> = {
  'AI CHAT': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M9.5 9h.01M12.5 9h.01M15.5 9h.01" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'DOWNLOADER': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 3v13M7 11l5 5 5-5"/>
      <path d="M3 18h18v3H3z"/>
    </svg>
  ),
  'TOOLS': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="3" width="20" height="18" rx="2"/>
      <path d="M7 9l3 3-3 3M13 15h4"/>
    </svg>
  ),
  'ANIME': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="10"/>
      <path d="M10 8l6 4-6 4V8z"/>
      <path d="M2 12h3M19 12h3" strokeWidth="1.2" opacity=".5"/>
    </svg>
  ),
}

/* ───────────────────────────── ticker items ── */
const TICKERS = [
  'AI Chat · Lumina & Deepseek',
  'TikTok Downloader',
  'YouTube Downloader',
  'Anime Search & Schedule',
  'Screenshot Web',
  'Genius Lyrics',
  'No Registration',
  '60 req/min Free',
]

export default function HomePage() {
  const curRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const progRef = useRef<HTMLDivElement>(null)
  const navRef  = useRef<HTMLElement>(null)
  const mx = useRef(0); const my = useRef(0)
  const rx = useRef(0); const ry = useRef(0)

  useEffect(() => {
    // cursor
    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX; my.current = e.clientY
      if (curRef.current) {
        curRef.current.style.left = `${e.clientX}px`
        curRef.current.style.top  = `${e.clientY}px`
      }
    }
    document.addEventListener('mousemove', onMove)

    let raf: number
    const animRing = () => {
      rx.current += (mx.current - rx.current) * .11
      ry.current += (my.current - ry.current) * .11
      if (ringRef.current) {
        ringRef.current.style.left = `${rx.current}px`
        ringRef.current.style.top  = `${ry.current}px`
      }
      raf = requestAnimationFrame(animRing)
    }
    raf = requestAnimationFrame(animRing)

    const hoverEls = document.querySelectorAll<HTMLElement>('a, .cat-card, .itag, .btn-primary, .btn-ghost')
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (curRef.current)  { curRef.current.style.width  = '18px'; curRef.current.style.height  = '18px' }
        if (ringRef.current) { ringRef.current.style.width = '50px'; ringRef.current.style.height = '50px' }
      })
      el.addEventListener('mouseleave', () => {
        if (curRef.current)  { curRef.current.style.width  = '10px'; curRef.current.style.height  = '10px' }
        if (ringRef.current) { ringRef.current.style.width = '34px'; ringRef.current.style.height = '34px' }
      })
    })

    // scroll
    const onScroll = () => {
      if (progRef.current)
        progRef.current.style.width =
          `${(window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100}%`
      if (navRef.current)
        navRef.current.classList.toggle('scrolled', window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll)

    // reveal
    const obs = new IntersectionObserver(entries =>
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: .1 }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))

    return () => {
      document.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      obs.disconnect()
    }
  }, [])

  /* cat card spotlight glow */
  const onCatMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`)
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top)  / r.height * 100).toFixed(1)}%`)
  }

  return (
    <>
      {/* cursor */}
      <div ref={curRef}  className="cur"     id="cur" />
      <div ref={ringRef} className="cur-ring" id="curRing" />

      {/* scroll progress */}
      <div ref={progRef} className="scroll-prog" />

      {/* ── NAV ── */}
      <nav
        ref={navRef}
        id="nav"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.4rem 3rem',
          background: 'rgba(10,10,15,0)',
          backdropFilter: 'blur(0px)',
          borderBottom: '1px solid transparent',
          transition: 'background .5s, backdrop-filter .5s, border-color .5s',
        }}
        className="[&.scrolled]:bg-[rgba(10,10,15,0.85)] [&.scrolled]:backdrop-blur-xl [&.scrolled]:border-b [&.scrolled]:border-white/[0.07]"
      >
        <Link href="/" style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem',
          letterSpacing: '-.03em', color: 'var(--text)', textDecoration: 'none',
        }}>
          Lumina<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        <ul style={{ display: 'flex', gap: '2.5rem', listStyle: 'none' }}>
          {[
            { label: 'Endpoints', href: '#cats' },
            { label: 'Docs',      href: '/docs' },
            { label: 'Playground',href: '/playground' },
          ].map(l => (
            <li key={l.label}>
              <Link href={l.href} style={{
                fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase',
                color: 'var(--muted)', textDecoration: 'none',
              }}
                className="hover:text-[var(--text)] transition-colors relative
                  after:absolute after:bottom-[-3px] after:left-0 after:w-0 after:h-px
                  after:bg-[var(--accent)] after:transition-all hover:after:w-full"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section
        id="hero"
        style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: '0 3rem 5.5rem',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div className="hero-grid" />
        <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 370px', gap: '4rem', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
          {/* left */}
          <div>
            {/* chip */}
            <div className="anim-up delay-1" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.8rem',
              padding: '.45rem .95rem .45rem .45rem',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 100, marginBottom: '2.5rem',
            }}>
              <div className="chip-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--a3)' }} />
              <span style={{ fontSize: '.68rem', letterSpacing: '.1em', color: 'var(--muted)' }}>
                <b style={{ color: 'var(--text)' }}>{ENDPOINTS.length}+ endpoints</b> · no auth required
              </span>
            </div>

            {/* title */}
            <h1 className="anim-up delay-3" style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 'clamp(3.8rem, 8.5vw, 8rem)',
              lineHeight: .9, letterSpacing: '-.045em', marginBottom: '1.8rem',
            }}>
              Free<br />
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>REST</span><br />
              <span style={{ color: 'var(--muted)' }}>API</span>
            </h1>

            {/* sub */}
            <p className="anim-up delay-5" style={{
              fontSize: '.78rem', lineHeight: 2, color: 'var(--muted)',
              maxWidth: 480, marginBottom: '2.8rem',
            }}>
              Lumina API — AI Chat, Downloader, Tools, Anime.<br />
              <b style={{ color: 'var(--text)' }}>Tanpa registrasi.</b> Langsung pakai. Gratis selamanya.
            </p>

            {/* btns */}
            <div className="anim-up delay-7" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/docs" className="btn-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: '.6rem',
                padding: '.85rem 1.8rem',
                fontFamily: "'DM Mono', monospace", fontSize: '.72rem',
                letterSpacing: '.1em', textTransform: 'uppercase',
                background: 'var(--accent)', color: 'var(--bg)',
                textDecoration: 'none', border: '1px solid var(--accent)',
              }}>
                <IconDoc /><span style={{ position: 'relative', zIndex: 1 }}>Explore Docs</span>
              </Link>
              <Link href="/playground" className="btn-ghost" style={{
                display: 'inline-flex', alignItems: 'center', gap: '.6rem',
                padding: '.85rem 1.8rem',
                fontFamily: "'DM Mono', monospace", fontSize: '.72rem',
                letterSpacing: '.1em', textTransform: 'uppercase',
                background: 'transparent', color: 'var(--text)',
                textDecoration: 'none', border: '1px solid var(--border)',
              }}>
                <IconPlay /><span style={{ position: 'relative', zIndex: 1 }}>Try Playground</span>
              </Link>
            </div>

            {/* scroll hint */}
            <div className="anim-up delay-10" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 7,
              fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase',
              color: 'var(--muted)', marginTop: '2.5rem',
            }}>
              <div className="scroll-line" style={{
                width: 1, height: 44,
                background: 'linear-gradient(to bottom, var(--accent), transparent)',
              }} />
              scroll
            </div>
          </div>

          {/* right — info card */}
          <div className="anim-up delay-5" style={{
            background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.4rem',
          }}>
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13, color: 'var(--muted)' }}>
                    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                ),
                label: 'base url', value: 'lumina-api.vercel.app', accent: true,
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13, color: 'var(--muted)' }}>
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                ),
                label: 'rate limit', value: '60 req / min', accent: false,
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13, color: 'var(--muted)' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                ),
                label: 'auth', value: 'tidak perlu', accent: false,
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13, color: 'var(--muted)' }}>
                    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                  </svg>
                ),
                label: 'format', value: 'JSON', accent: false,
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13, color: 'var(--muted)' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                ),
                label: 'status', value: '● online', accent: true,
              },
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display: 'grid', gridTemplateColumns: '16px 80px 1fr',
                gap: '.7rem', alignItems: 'center',
                padding: '.6rem 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                {row.icon}
                <span style={{ fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{row.label}</span>
                <span style={{ fontSize: '.72rem', color: row.accent ? 'var(--accent)' : 'var(--text)' }}>{row.value}</span>
              </div>
            ))}

            <div style={{ height: 1, background: 'var(--border)', margin: '.85rem 0 .7rem' }} />
            <span style={{ fontSize: '.58rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>
              tersedia untuk
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
              {['AI Chat', 'Downloader', 'Anime', 'Tools'].map(tag => (
                <span key={tag} className="itag" style={{
                  fontSize: '.62rem', padding: '.22rem .55rem',
                  background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)',
                  borderRadius: 100, color: 'var(--muted)',
                  transition: 'all .25s', cursor: 'none',
                }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; (e.target as HTMLElement).style.color = 'var(--accent)' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--muted)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{
        overflow: 'hidden',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', padding: '.75rem 0',
      }}>
        <div className="ticker-inner" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '.7rem',
              fontSize: '.68rem', letterSpacing: '.1em', color: 'var(--muted)',
              padding: '0 2.5rem', flexShrink: 0,
            }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, display: 'inline-block' }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section style={{ padding: '5rem 3rem' }}>
        <div className="reveal" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: 1, background: 'var(--border)',
        }}>
          {[
            { num: `${ENDPOINTS.length}`, suffix: '+', label: 'Endpoints',  desc: 'AI, downloader, anime, tools' },
            { num: `${CATEGORIES.length}`, suffix: '+', label: 'Kategori',   desc: 'Organized by use case' },
            { num: '60',  suffix: '/m',label: 'Rate Limit', desc: 'Per IP, tanpa login' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ background: 'var(--bg)', padding: '2.5rem', transition: 'background .35s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}
            >
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text)' }}>
                {s.num}<b style={{ color: 'var(--accent)' }}>{s.suffix}</b>
              </div>
              <div style={{ fontSize: '.65rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '.5rem' }}>{s.label}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.3rem', opacity: .7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="cats" style={{ padding: '0 3rem 6rem' }}>
        <div className="reveal">
          <p style={{ fontSize: '.62rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '.9rem' }}>
            Endpoint Categories
          </p>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', letterSpacing: '-.03em',
            lineHeight: 1, marginBottom: '3rem',
          }}>
            Apa yang bisa<br /><span style={{ color: 'var(--muted)' }}>kamu pakai</span>
          </h2>
        </div>

        <div className="reveal" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, background: 'var(--border)',
        }}>
          {CATEGORIES.map(cat => {
            const count   = ENDPOINTS.filter(e => e.category === cat).length
            const catSlug = cat.toLowerCase().replace(/\s+/g, '-')
            return (
              <Link
                key={cat}
                href={`/docs#${catSlug}`}
                className="cat-card"
                onMouseMove={onCatMove}
                style={{
                  background: 'var(--bg)', padding: '1.8rem',
                  textDecoration: 'none', position: 'relative', overflow: 'hidden',
                  transition: 'background .3s', cursor: 'none', display: 'block',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}
              >
                <div style={{ width: 32, height: 32, marginBottom: '1rem', color: 'var(--accent)', opacity: .9 }}>
                  {CAT_ICONS[cat] ?? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                    </svg>
                  )}
                </div>
                <div style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: '.85rem', color: 'var(--text)', marginBottom: '.3rem',
                  transition: 'color .3s',
                }}
                  className="group-hover:text-[var(--accent)]"
                >
                  {cat}
                </div>
                <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
                  {count} endpoint{count > 1 ? 's' : ''}
                </div>
                <div style={{
                  position: 'absolute', bottom: '1.2rem', right: '1.2rem',
                  width: 20, height: 20, opacity: 0,
                  transform: 'translate(-4px, 4px)',
                  transition: 'opacity .3s, transform .3s',
                  color: 'var(--accent)',
                }}
                  className="cat-arrow"
                >
                  <IconArrow />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" style={{
        padding: '7rem 3rem', background: 'var(--bg2)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* bg grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)',
          backgroundSize: '72px 72px',
        }} />
        {/* orb */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          filter: 'blur(100px)',
          background: 'radial-gradient(circle,rgba(124,92,252,.14),transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }} />

        <div className="reveal" style={{ position: 'relative' }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(2.8rem, 7vw, 6rem)',
            letterSpacing: '-.045em', lineHeight: .92, marginBottom: '1.5rem',
          }}>
            Mulai<br />
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>
              sekarang
            </span>
          </h2>
          <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '3rem', letterSpacing: '.05em' }}>
            tidak perlu daftar. tidak perlu api key. langsung request.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/docs" className="btn-primary" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.6rem',
              padding: '.85rem 1.8rem',
              fontFamily: "'DM Mono', monospace", fontSize: '.72rem',
              letterSpacing: '.1em', textTransform: 'uppercase',
              background: 'var(--accent)', color: 'var(--bg)',
              textDecoration: 'none', border: '1px solid var(--accent)',
            }}>
              <span style={{ position: 'relative', zIndex: 1 }}>Baca Dokumentasi</span>
            </Link>
            <Link href="/playground" className="btn-ghost" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.6rem',
              padding: '.85rem 1.8rem',
              fontFamily: "'DM Mono', monospace", fontSize: '.72rem',
              letterSpacing: '.1em', textTransform: 'uppercase',
              background: 'transparent', color: 'var(--text)',
              textDecoration: 'none', border: '1px solid var(--border)',
            }}>
              <span style={{ position: 'relative', zIndex: 1 }}>Coba Playground</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '1.4rem 3rem',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '.62rem', color: 'var(--muted)', letterSpacing: '.08em',
      }}>
        <span>© 2026 Lumina API — by <a href="https://github.com/hiuraaaaa" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Xena</a></span>
        <span>built from termux · shipped on vercel</span>
      </footer>
    </>
  )
}
