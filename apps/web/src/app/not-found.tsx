import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100svh', textAlign: 'center',
      padding: '1.5rem',
      background: 'var(--bg)',
    }}>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800,
        fontSize: 'clamp(5rem, 20vw, 10rem)',
        lineHeight: 1, letterSpacing: '-.05em',
        background: 'linear-gradient(135deg, var(--accent), var(--a2))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '.5rem',
      }}>
        404
      </div>
      <h1 style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700,
        fontSize: 'clamp(1rem, 3vw, 1.4rem)',
        marginBottom: '.5rem', letterSpacing: '-.02em',
      }}>
        Halaman tidak ditemukan
      </h1>
      <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '2.5rem', maxWidth: 320, lineHeight: 1.7 }}>
        Endpoint atau halaman yang kamu cari tidak ada.
      </p>
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 1.4rem', minHeight: 48,
          background: 'var(--accent)', color: 'var(--bg)',
          fontFamily: "'DM Mono', monospace", fontSize: '.7rem',
          letterSpacing: '.1em', textTransform: 'uppercase',
          textDecoration: 'none', border: '1px solid var(--accent)',
          transition: 'all .25s',
        }}>
          Home
        </Link>
        <Link href="/docs" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 1.4rem', minHeight: 48,
          background: 'transparent', color: 'var(--text)',
          fontFamily: "'DM Mono', monospace", fontSize: '.7rem',
          letterSpacing: '.1em', textTransform: 'uppercase',
          textDecoration: 'none', border: '1px solid var(--border)',
          transition: 'all .25s',
        }}>
          Docs
        </Link>
      </div>
    </main>
  )
}
