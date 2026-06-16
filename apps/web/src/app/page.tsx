'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ENDPOINTS, CATEGORIES } from '@/lib/endpoints'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'AI CHAT': (
    <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M9.5 9h.01M12.5 9h.01M15.5 9h.01" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'DOWNLOADER': (
    <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 3v13M7 11l5 5 5-5"/>
      <path d="M3 18h18v3H3z"/>
    </svg>
  ),
  'TOOLS': (
    <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="3" width="20" height="18" rx="2"/>
      <path d="M7 9l3 3-3 3M13 15h4"/>
    </svg>
  ),
  'ANIME': (
    <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="10"/>
      <path d="M10 8l6 4-6 4V8z"/>
      <path d="M2 12h3M19 12h3" strokeWidth="1.2" opacity=".5"/>
    </svg>
  ),
}

const TICKER_ITEMS = [
  'AI Chat · Lumina & Deepseek',
  'TikTok Downloader',
  'YouTube Downloader',
  'Anime Search & Schedule',
  'Screenshot Website',
  'Genius Lyrics',
  'No Registration Required',
  '60 req/min · Free Forever',
]

export default function HomePage() {
  const curRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const progRef = useRef<HTMLDivElement>(null)
  const navRef  = useRef<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const cur  = curRef.current
    const ring = ringRef.current
    if (!cur || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      cur.style.left = mx + 'px'; cur.style.top = my + 'px'
    }
    document.addEventListener('mousemove', onMove)

    let raf: number
    const animRing = () => {
      rx += (mx - rx) * .11; ry += (my - ry) * .11
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px'
      raf = requestAnimationFrame(animRing)
    }
    animRing()

    document.querySelectorAll('a, button, .cat-card, .itag').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cur.style.width = '18px'; cur.style.height = '18px'
        ring.style.width = '50px'; ring.style.height = '50px'
      })
      el.addEventListener('mouseleave', () => {
        cur.style.width = '10px'; cur.style.height = '10px'
        ring.style.width = '34px'; ring.style.height = '34px'
      })
    })

    const onScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100
      if (progRef.current) progRef.current.style.width = pct + '%'
      if (navRef.current) navRef.current.classList.toggle('scrolled', window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll)

    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: .08 }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))

    return () => {
      document.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      obs.disconnect()
    }
  }, [])

  // lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const glow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%')
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%')
  }

  return (
    <>
      <div className="cur" ref={curRef} />
      <div className="cur-ring" ref={ringRef} />
      <div className="prog" ref={progRef} />

      {/* mobile menu overlay */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link href="#cats"       onClick={() => setMenuOpen(false)}>Endpoints</Link>
        <Link href="/docs"       onClick={() => setMenuOpen(false)}>Docs</Link>
        <Link href="/playground" onClick={() => setMenuOpen(false)}>Playground</Link>
      </div>

      {/* nav */}
      <nav ref={navRef} id="lnav">
        <Link href="/" className="logo">Lumina<span>.</span></Link>
        <ul className="nav-links">
          <li><a href="#cats">Endpoints</a></li>
          <li><Link href="/docs">Docs</Link></li>
          <li><Link href="/playground">Playground</Link></li>
        </ul>
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(p => !p)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* hero */}
      <section id="hero">
        <div className="hero-grid" />
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="orb o3" />

        <div className="hero-inner">
          {/* left */}
          <div>
            <div className="chip">
              <div className="chip-dot" />
              <span className="chip-text"><b>{ENDPOINTS.length}+ endpoints</b> · no auth</span>
            </div>

            <h1 className="hero-title">
              Free<br />
              <span className="serif accent">REST</span><br />
              <span className="dim">API</span>
            </h1>

            <p className="hero-sub">
              Lumina API — AI Chat, Downloader, Tools, Anime.<br />
              <b>Tanpa registrasi.</b> Langsung pakai. Gratis selamanya.
            </p>

            <div className="hero-btns">
              <Link href="/docs" className="btn-primary">
                <svg style={{width:13,height:13,position:'relative',zIndex:1}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>Explore Docs</span>
              </Link>
              <Link href="/playground" className="btn-ghost">
                <svg style={{width:13,height:13,position:'relative',zIndex:1}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Try Playground</span>
              </Link>
            </div>

            <div className="scroll-hint">
              <div className="scroll-line" />
              scroll
            </div>
          </div>

          {/* info card — stacks below on mobile, right col on desktop */}
          <div className="info-card">
            <div className="irow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span className="ilabel">base url</span>
              <span className="ival accent">lumina-api-api.vercel.app</span>
            </div>
            <div className="irow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span className="ilabel">rate limit</span>
              <span className="ival">60 req / min</span>
            </div>
            <div className="irow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span className="ilabel">auth</span>
              <span className="ival">tidak perlu</span>
            </div>
            <div className="irow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              <span className="ilabel">format</span>
              <span className="ival">JSON</span>
            </div>
            <div className="irow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span className="ilabel">status</span>
              <span className="ival accent">● online</span>
            </div>
            <div className="idiv" />
            <span className="itag-label">tersedia untuk</span>
            <div className="itags">
              {CATEGORIES.map(c => <span key={c} className="itag">{c}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* ticker */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="tick-item">
              <span className="tick-dot" />{item}
            </span>
          ))}
        </div>
      </div>

      {/* stats */}
      <section id="stats">
        <div className="stats-grid reveal">
          <div className="stat-card">
            <div className="stat-num">{ENDPOINTS.length}<b>+</b></div>
            <div className="stat-label">Endpoints</div>
            <div className="stat-desc">AI, downloader, anime, tools</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{CATEGORIES.length}<b>+</b></div>
            <div className="stat-label">Kategori</div>
            <div className="stat-desc">Organized by use case</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">60<b>/m</b></div>
            <div className="stat-label">Rate Limit</div>
            <div className="stat-desc">Per IP, tanpa login</div>
          </div>
        </div>
      </section>

      {/* categories */}
      <section id="cats">
        <div className="reveal">
          <p className="sec-eyebrow">Endpoint Categories</p>
          <h2 className="sec-title">Apa yang bisa<br /><span className="dim">kamu pakai</span></h2>
        </div>
        <div className="cats-grid reveal">
          {CATEGORIES.map(cat => {
            const count = ENDPOINTS.filter(e => e.category === cat).length
            const slug  = cat.toLowerCase().replace(/\s+/g, '-')
            return (
              <Link key={cat} href={`/docs#${slug}`} className="cat-card" onMouseMove={glow}>
                {CATEGORY_ICONS[cat] ?? (
                  <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                  </svg>
                )}
                <div className="cat-name">{cat}</div>
                <div className="cat-count">{count} endpoint{count > 1 ? 's' : ''}</div>
                <svg className="cat-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </Link>
            )
          })}
        </div>
      </section>

      {/* cta */}
      <section id="cta">
        <div className="cta-orb" />
        <div className="reveal">
          <h2 className="cta-title">Mulai<br /><span className="serif">sekarang</span></h2>
          <p className="cta-sub">tidak perlu daftar. tidak perlu api key. langsung request.</p>
          <div className="cta-btns">
            <Link href="/docs"       className="btn-primary"><span>Baca Dokumentasi</span></Link>
            <Link href="/playground" className="btn-ghost"><span>Coba Playground</span></Link>
          </div>
        </div>
      </section>

      <footer>
        <span>© 2026 Lumina API — by <a href="https://github.com/hiuraaaaa">Xena</a></span>
        <span>built from termux · shipped on vercel</span>
      </footer>
    </>
  )
}
