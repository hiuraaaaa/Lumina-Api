import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Lumina API', template: '%s | Lumina API' },
  description: 'Free REST API for AI, Downloader, Tools, Anime, and more. Built by Xena.',
  keywords: ['lumina api', 'free api', 'ai api', 'downloader api', 'anime api', 'indonesia'],
  authors: [{ name: 'Xena', url: 'https://github.com/hiuraaaaa' }],
  openGraph: {
    type:        'website',
    siteName:    'Lumina API',
    title:       'Lumina API — Free REST API',
    description: 'Free REST API for AI, Downloader, Tools, Anime, and more.',
    images:      [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card:  'summary_large_image',
    title: 'Lumina API — Free REST API',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lumina-api.vercel.app'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{ fontFamily: "'DM Mono', monospace", background: 'var(--bg)', color: 'var(--text)' }}
      >
        {children}
      </body>
    </html>
  )
}
