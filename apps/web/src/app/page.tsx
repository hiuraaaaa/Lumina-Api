'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ENDPOINTS, CATEGORIES } from '@/lib/endpoints'
import { ProviderIcon } from '@/components/ui/ProviderIcon'
import { useAuth } from '@/context/AuthContext'

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

// daftar AI chat dari data endpoints, dipakai di ticker hero
const AI_CHAT_ENDPOINTS = ENDPOINTS.filter(e => e.category === 'AI CHAT')

// reusable fade-up variant
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  const curRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const progRef = useRef<HTMLDivElement>(null)
  const navRef  = useRef<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const router = useRouter()

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

    return () => {
      document.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

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

      {/* mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu open"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {!loading && user && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.62rem', color: 'var(--muted)' }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }} />
                {user.email}
              </motion.div>
            )}
            {[
              { href: '#cats', label: 'Endpoints' },
              { href: '/docs', label: 'Docs' },
              { href: '/playground', label: 'Playground' },
              ...(!loading && user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
              ...(!loading && !user ? [{ href: '/login', label: 'Login' }] : []),
            ].map(({ href, label }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 + 0.1 }}
              >
                <Link href={href} onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              </motion.div>
            ))}
            {!loading && user && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <button
                  onClick={() => { setMenuOpen(false); logout().then(() => router.push('/')) }}
                  style={{ background: 'none', border: 'none', font: 'inherit', color: 'inherit', padding: 0, cursor: 'pointer' }}
                >
                  Keluar
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* nav */}
      <nav ref={navRef} id="lnav">
        <Link href="/" className="logo">Lumina<span>.</span></Link>
        <ul className="nav-links">
          <li><a href="#cats">Endpoints</a></li>
          <li><Link href="/docs">Docs</Link></li>
          <li><Link href="/playground">Playground</Link></li>
          {!loading && user && (
            <li style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.66rem', color: 'var(--muted)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }} />
              {user.email}
            </li>
          )}
          {!loading && user && <li><Link href="/dashboard">Dashboard</Link></li>}
          {!loading && !user && <li><Link href="/login">Login</Link></li>}
          {!loading && user && (
            <li>
              <button
                onClick={() => logout().then(() => router.push('/'))}
                style={{ background: 'none', border: 'none', font: 'inherit', color: 'inherit', padding: 0, cursor: 'pointer' }}
              >
                Keluar
              </button>
            </li>
          )}
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
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div className="chip" variants={fadeUp} transition={{ duration: 0.5, ease: 'easeOut' }}>
              <div className="chip-dot" />
              <span className="chip-text"><b>{ENDPOINTS.length}+ endpoints</b> · gratis pakai key</span>
            </motion.div>

            <motion.h1
              className="hero-title"
              variants={fadeUp}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Free<br />
              <span className="serif accent">REST</span><br />
              <span className="dim">API</span>
            </motion.h1>

            <motion.p
              className="hero-sub"
              variants={fadeUp}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              Lumina API — AI Chat, Downloader, Tools, Anime.<br />
              <b>Tanpa registrasi.</b> Langsung pakai. Gratis selamanya.
            </motion.p>

            <motion.div
              className="hero-btns"
              variants={fadeUp}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
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
            </motion.div>

            <motion.div
              className="scroll-hint"
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="scroll-line" />
              scroll
            </motion.div>
          </motion.div>

          {/* info card */}
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="irow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span className="ilabel">base url</span>
              <span className="ival accent">lumina-api-api.vercel.app</span>
            </div>
            <div className="irow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span className="ilabel">rate limit</span>
              <span className="ival">20/min gratis · 100/min dengan key</span>
            </div>
            <div className="irow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span className="ilabel">auth</span>
              <span className="ival">API key (gratis, login dulu)</span>
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
          </motion.div>
        </div>
      </section>

      {/* ticker */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...AI_CHAT_ENDPOINTS, ...AI_CHAT_ENDPOINTS].map((ep, i) => (
            <span key={i} className="tick-item">
              <ProviderIcon slug={ep.slug} size={14} />
              {ep.name}
            </span>
          ))}
        </div>
      </div>

      {/* stats */}
      <section id="stats">
        <motion.div
          className="stats-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {[
            { num: `${ENDPOINTS.length}+`, label: 'Endpoints',   desc: 'AI, downloader, anime, tools' },
            { num: `${CATEGORIES.length}+`, label: 'Kategori',   desc: 'Organized by use case' },
            { num: '60/m',                  label: 'Rate Limit',  desc: 'Per IP, tanpa login' },
          ].map(({ num, label, desc }) => (
            <motion.div
              key={label}
              className="stat-card"
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ backgroundColor: 'var(--surface)' }}
            >
              <div className="stat-num">{num.replace(/\+|\/m/, '')}<b>{num.includes('+') ? '+' : '/m'}</b></div>
              <div className="stat-label">{label}</div>
              <div className="stat-desc">{desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* categories */}
      <section id="cats">
        <RevealSection>
          <p className="sec-eyebrow">Endpoint Categories</p>
          <h2 className="sec-title">Apa yang bisa<br /><span className="dim">kamu pakai</span></h2>
        </RevealSection>

        <motion.div
          className="cats-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {CATEGORIES.map(cat => {
            const count = ENDPOINTS.filter(e => e.category === cat).length
            const slug  = cat.toLowerCase().replace(/\s+/g, '-')
            return (
              <motion.div
                key={cat}
                variants={fadeUp}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={`/docs#${slug}`} className="cat-card" onMouseMove={glow}>
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
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* cta */}
      <section id="cta">
        <div className="cta-orb" />
        <RevealSection>
          <h2 className="cta-title">Mulai<br /><span className="serif">sekarang</span></h2>
          <p className="cta-sub">login gratis. buat api key. langsung request.</p>
          <div className="cta-btns">
            <Link href="/login"      className="btn-primary"><span>Login & Buat Key</span></Link>
            <Link href="/docs"       className="btn-ghost"><span>Baca Dokumentasi</span></Link>
            <Link href="/playground" className="btn-ghost"><span>Coba Playground</span></Link>
          </div>
        </RevealSection>
      </section>

      <footer>
        <span>© 2026 Lumina API — by <a href="https://github.com/hiuraaaaa">Xena</a></span>
        <span>built from termux · shipped on vercel</span>
      </footer>
    </>
  )
}
