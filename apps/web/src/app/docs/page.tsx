'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'


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

  const copy = () => {
    navigator.clipboard.writeText(apiBase)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

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
              Panduan
            </div>

            <a href="#top" className="sidebar-link active">
              <span style={{ flex: 1 }}>Cara Pakai API Key</span>
            </a>
            <Link href="/docs/integration" className="sidebar-link">
              <span style={{ flex: 1 }}>Panduan Integrasi</span>
            </Link>
            <Link href="/models" className="sidebar-link">
              <span style={{ flex: 1 }}>Semua Endpoint</span>
            </Link>

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

              </motion.div>
            </div>

            {/* getting started / auth guide */}
            <div style={{ padding: '0 clamp(1rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>
              <div style={{
                border: '1px solid var(--border)', background: 'var(--surface)',
                padding: 'clamp(1.2rem, 3vw, 1.8rem)',
              }}>
                <h2 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: '1.1rem', marginBottom: '.5rem',
                }}>
                  Cara Pakai API Key
                </h2>
                <p style={{ fontSize: '.74rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.2rem', maxWidth: 640 }}>
                  Semua endpoint butuh API key. Tanpa key, kamu tetap bisa coba tapi limitnya
                  cuma <b style={{ color: 'var(--text)' }}>20 request/menit</b>. Pakai key gratis,
                  limit naik jadi <b style={{ color: 'var(--text)' }}>100 request/menit</b>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Step n={1} title="Login & buat key">
                    Buka <Link href="/login" style={{ color: 'var(--accent)' }}>halaman login</Link>,
                    masuk pakai email atau Google, terus generate API key gratis di{' '}
                    <Link href="/dashboard" style={{ color: 'var(--accent)' }}>dashboard</Link>.
                    Key cuma ditampilin sekali pas dibuat — langsung disalin & disimpan.
                  </Step>

                  <Step n={2} title="Tempelin di header x-api-key">
                    Kirim key itu di setiap request lewat header <code style={inlineCode}>x-api-key</code>.
                    <div style={{ marginTop: '.6rem' }}>
                      <CodeBlock label="cURL">
{`curl "${apiBase}/api/ai-chat/lumina?query=halo" \\
  -H "x-api-key: lumina-xxxxxxxxxxxx"`}
                      </CodeBlock>
                    </div>
                    <div style={{ marginTop: '.6rem' }}>
                      <CodeBlock label="JavaScript (fetch)">
{`fetch("${apiBase}/api/ai-chat/lumina?query=halo", {
  headers: { "x-api-key": "lumina-xxxxxxxxxxxx" }
})
  .then(res => res.json())
  .then(console.log)`}
                      </CodeBlock>
                    </div>
                  </Step>

                  <Step n={3} title="Browsing di web Lumina sendiri">
                    Khusus di Playground & tombol "Try It" di halaman ini — kalau kamu udah{' '}
                    <Link href="/login" style={{ color: 'var(--accent)' }}>login</Link>, key-nya
                    otomatis terpasang, gak perlu copy-paste manual. API key cuma wajib ditempel
                    manual kalau manggil dari luar web ini (curl, aplikasi sendiri, bot, dst).
                  </Step>
                </div>

                <div style={{
                  display: 'flex', gap: '.8rem', flexWrap: 'wrap', marginTop: '1.6rem',
                  paddingTop: '1.2rem', borderTop: '1px solid var(--border)',
                }}>
                  <Link href="/docs/integration" className="btn-ghost" style={{ fontSize: '.68rem', padding: '.55rem 1rem' }}>
                    <span>Panduan Integrasi Lengkap →</span>
                  </Link>
                  <Link href="/models" className="btn-ghost" style={{ fontSize: '.68rem', padding: '.55rem 1rem' }}>
                    <span>Lihat Semua Endpoint →</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '.9rem' }}>
      <div style={{
        flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
        border: '1px solid var(--accent)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.68rem', fontFamily: "'DM Mono', monospace", fontWeight: 700,
      }}>
        {n}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '.8rem', fontWeight: 600, marginBottom: '.35rem' }}>{title}</p>
        <div style={{ fontSize: '.74rem', color: 'var(--muted)', lineHeight: 1.7 }}>{children}</div>
      </div>
    </div>
  )
}

function CodeBlock({ label, children }: { label: string; children: string }) {
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div style={{
        padding: '.4rem .8rem', fontSize: '.6rem', textTransform: 'uppercase',
        letterSpacing: '.08em', color: 'var(--muted)', borderBottom: '1px solid var(--border)',
      }}>
        {label}
      </div>
      <pre style={{
        margin: 0, padding: '.8rem', fontSize: '.68rem', fontFamily: "'DM Mono', monospace",
        color: 'var(--text)', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6,
      }}>
        {children}
      </pre>
    </div>
  )
}

const inlineCode: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace", fontSize: '.7rem',
  background: 'var(--bg2)', border: '1px solid var(--border)',
  padding: '.1rem .4rem',
}
