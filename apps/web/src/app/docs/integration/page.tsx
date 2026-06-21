'use client'

import Link from 'next/link'

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.luminaa.web.id'

export default function IntegrationGuidePage() {
  return (
    <main style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 2rem) 5rem' }}>

        <Link href="/docs" style={{
          fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase',
          color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '1.5rem',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M5 12l7-7M5 12l7 7" /></svg>
          Docs
        </Link>

        <p style={{ fontSize: '.65rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '.6rem' }}>Reference</p>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', letterSpacing: '-.03em', marginBottom: '.8rem' }}>
          Panduan Integrasi
        </h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 560 }}>
          Detail teknis buat integrasi Lumina API ke aplikasi kamu — format request/response,
          error handling, rate limit, dan session memory.
        </p>

        <Section title="1. Format Request">
          <P>Semua endpoint dipanggil lewat HTTP GET dengan parameter di query string, ke base URL:</P>
          <CodeBlock label="Base URL">{apiBase}</CodeBlock>
          <P>API key dikirim lewat header <Code>x-api-key</Code>, bukan query param (lebih aman, gak ke-log di URL/history):</P>
          <CodeBlock label="cURL">{`curl "${apiBase}/api/ai-chat/lumina?query=halo" \\\n  -H "x-api-key: lumina-xxxxxxxxxxxx"`}</CodeBlock>
        </Section>

        <Section title="2. Format Response">
          <P>Setiap response selalu JSON dengan field <Code>status</Code> sebagai indikator sukses/gagal.</P>
          <P><b style={{ color: 'var(--text)' }}>Sukses:</b></P>
          <CodeBlock label="200 OK">{`{
  "status": true,
  "statusCode": 200,
  "creator": "Xena",
  "result": {
    "reply": "Halo! Ada yang bisa dibantu?",
    "model": "lumina-1",
    "session": "abc123"
  }
}`}</CodeBlock>
          <P><b style={{ color: 'var(--text)' }}>Gagal:</b> field <Code>result</Code> diganti <Code>error</Code> (string).</P>
          <CodeBlock label="4xx / 5xx">{`{
  "status": false,
  "statusCode": 401,
  "creator": "Xena",
  "error": "API key diperlukan."
}`}</CodeBlock>
          <P>Selalu cek <Code>data.status</Code> dulu sebelum baca <Code>result</Code>:</P>
          <CodeBlock label="JavaScript">{`const data = await res.json()
if (!data.status) {
  console.error(data.error)
} else {
  console.log(data.result.reply)
}`}</CodeBlock>
        </Section>

        <Section title="3. Error Handling">
          <P>Status code yang mungkin dibalikin:</P>
          <Table
            rows={[
              ['200', 'OK', 'Request sukses, cek result'],
              ['400', 'Bad Request', 'Parameter wajib gak diisi / format salah'],
              ['401', 'Unauthorized', 'API key gak ada / gak valid / dicabut'],
              ['404', 'Not Found', 'Endpoint atau resource gak ketemu'],
              ['429', 'Too Many Requests', 'Limit per menit tercapai, lihat header rate limit'],
              ['500', 'Internal Server Error', 'Error di provider AI / server, coba lagi'],
            ]}
          />
          <P style={{ marginTop: '.9rem' }}>
            Untuk <Code>429</Code>, sebaiknya tunggu sesuai field <Code>retryAfter</Code> di body
            response sebelum retry, jangan langsung spam ulang.
          </P>
        </Section>

        <Section title="4. Rate Limit Headers">
          <P>Tiap response (sukses atau gagal) selalu bawa 2 header ini:</P>
          <Table
            rows={[
              ['X-RateLimit-Limit', 'Batas request per menit buat key/IP kamu (20 tanpa key, 100 dengan key)'],
              ['X-RateLimit-Remaining', 'Sisa kuota di window 1 menit saat ini'],
            ]}
            cols={2}
          />
          <P style={{ marginTop: '.9rem' }}>
            Body response pas kena limit juga ngasih estimasi waktu tunggu:
          </P>
          <CodeBlock label="429 Too Many Requests">{`{
  "status": false,
  "statusCode": 429,
  "error": "Limit API key tercapai (100 req/menit). Coba lagi nanti.",
  "retryAfter": "37s"
}`}</CodeBlock>
        </Section>

        <Section title="5. Session / Memory Percakapan">
          <P>
            Sebagian endpoint AI Chat (cek param <Code>session</Code> di{' '}
            <Link href="/models" style={{ color: 'var(--accent)' }}>halaman endpoint</Link>) bisa nyimpen
            riwayat percakapan kalau kamu kirim ID session yang konsisten:
          </P>
          <CodeBlock label="cURL">{`# Pesan pertama
curl "${apiBase}/api/ai-chat/lumina?query=nama%20gw%20budi&session=chat-001" \\
  -H "x-api-key: lumina-xxxxxxxxxxxx"

# Pesan kedua, session sama → AI masih ingat
curl "${apiBase}/api/ai-chat/lumina?query=siapa%20nama%20gw&session=chat-001" \\
  -H "x-api-key: lumina-xxxxxxxxxxxx"`}</CodeBlock>
          <P>ID session bebas string apa aja (UUID, user ID, dst) — asal konsisten per percakapan.</P>
        </Section>

        <Section title="6. Best Practices">
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', paddingLeft: '1.1rem', margin: 0 }}>
            <Li>Jangan hardcode API key di kode client-side publik (frontend yang ke-deploy) — taruh di environment variable server-side.</Li>
            <Li>Tangani status <Code>429</Code> dengan exponential backoff, jangan retry langsung berkali-kali.</Li>
            <Li>Cek <Code>data.status</Code> sebelum proses <Code>result</Code>, jangan asumsi selalu sukses.</Li>
            <Li>Pakai 1 API key per aplikasi/proyek — gampang dicabut individual kalau bocor, gak ganggu aplikasi lain.</Li>
            <Li>Manfaatin <Code>session</Code> buat chatbot biar konteks percakapan gak hilang tiap request.</Li>
          </ul>
        </Section>

        <div style={{
          display: 'flex', gap: '.8rem', flexWrap: 'wrap', marginTop: '2.5rem',
          paddingTop: '1.5rem', borderTop: '1px solid var(--border)',
        }}>
          <Link href="/dashboard/keys" className="btn-primary" style={{ fontSize: '.7rem', padding: '.6rem 1.1rem' }}>
            <span>Buat API Key</span>
          </Link>
          <Link href="/models" className="btn-ghost" style={{ fontSize: '.7rem', padding: '.6rem 1.1rem' }}>
            <span>Lihat Semua Endpoint</span>
          </Link>
          <Link href="/playground" className="btn-ghost" style={{ fontSize: '.7rem', padding: '.6rem 1.1rem' }}>
            <span>Coba di Playground</span>
          </Link>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '2.8rem' }}>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.15rem', marginBottom: '1rem' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>{children}</div>
    </section>
  )
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.75, ...style }}>{children}</p>
}

function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.7 }}>{children}</li>
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontFamily: "'DM Mono', monospace", fontSize: '.74rem',
      background: 'var(--bg2)', border: '1px solid var(--border)',
      padding: '.1rem .4rem', color: 'var(--text)',
    }}>
      {children}
    </code>
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
        margin: 0, padding: '.8rem', fontSize: '.7rem', fontFamily: "'DM Mono', monospace",
        color: 'var(--text)', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.65,
      }}>
        {children}
      </pre>
    </div>
  )
}

function Table({ rows, cols = 3 }: { rows: string[][]; cols?: number }) {
  return (
    <div style={{ border: '1px solid var(--border)', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.72rem' }}>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: '.6rem .8rem', color: j === 0 ? 'var(--accent)' : 'var(--muted)',
                    fontFamily: j === 0 ? "'DM Mono', monospace" : 'inherit',
                    fontWeight: j === 0 ? 700 : 400,
                    whiteSpace: cols <= 2 && j === 0 ? 'nowrap' : 'normal',
                    lineHeight: 1.6,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
