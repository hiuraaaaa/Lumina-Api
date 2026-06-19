'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { loginEmail, registerEmail, loginGoogle } = useAuth()

  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [busy, setBusy]       = useState(false)

  function friendlyError(code: string): string {
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
      return 'Email atau password salah.'
    if (code.includes('email-already-in-use')) return 'Email sudah terdaftar, coba login.'
    if (code.includes('weak-password')) return 'Password minimal 6 karakter.'
    if (code.includes('invalid-email')) return 'Format email tidak valid.'
    if (code.includes('popup-closed')) return 'Login dibatalkan.'
    return 'Terjadi kesalahan, coba lagi.'
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') await loginEmail(email, password)
      else await registerEmail(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(friendlyError(err?.code ?? ''))
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setBusy(true)
    try {
      await loginGoogle()
      router.push('/dashboard')
    } catch (err: any) {
      setError(friendlyError(err?.code ?? ''))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 380,
          background: 'var(--surface)', border: '1px solid var(--border)',
          padding: '2.2rem 1.75rem',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.8rem', textDecoration: 'none', color: 'var(--text)', fontWeight: 700 }}>
          <span style={{ color: 'var(--accent)' }}>⚡</span>
          <span>Lumina<span style={{ color: 'var(--accent)' }}>API</span></span>
        </Link>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: '.4rem' }}>
          {mode === 'login' ? 'Masuk ke akun' : 'Buat akun baru'}
        </h1>
        <p style={{ fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.6rem' }}>
          {mode === 'login' ? 'Kelola API key kamu di dashboard.' : 'Daftar buat dapat API key sendiri.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
          <input
            type="email" required placeholder="email@kamu.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" required placeholder="password" minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {error && (
            <p style={{ fontSize: '.68rem', color: '#ff6b6b', lineHeight: 1.6 }}>{error}</p>
          )}

          <button type="submit" disabled={busy} className="btn-primary" style={{ justifyContent: 'center', marginTop: '.4rem', opacity: busy ? 0.6 : 1, cursor: busy ? 'default' : 'pointer' }}>
            <span>{busy ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}</span>
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', margin: '1.4rem 0', fontSize: '.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          atau
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <button onClick={handleGoogle} disabled={busy} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', opacity: busy ? 0.6 : 1, cursor: busy ? 'default' : 'pointer' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '.55rem' }}>
            <GoogleIcon />
            Lanjut dengan Google
          </span>
        </button>

        <p style={{ fontSize: '.68rem', color: 'var(--muted)', textAlign: 'center', marginTop: '1.6rem' }}>
          {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}
          >
            {mode === 'login' ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '.75rem .9rem',
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontFamily: "'DM Mono', monospace",
  fontSize: '.78rem',
  outline: 'none',
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.4C29.5 35.4 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.2 5.5l6.5 5.4C40.9 35.9 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  )
}

