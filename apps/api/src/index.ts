// ══════════════════════════════════════════
//  LUMINA API — Hono Entry Point
// ══════════════════════════════════════════
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { reloadCache } from './lib/cache.js'
import { blacklistMiddleware } from './middleware/blacklist.js'
import { rateLimitMiddleware } from './middleware/rateLimit.js'
import { authMiddleware } from './middleware/auth.js'
import { loggerMiddleware } from './middleware/logger.js'

// ── Routes ──────────────────────────────
import aiLumina    from './routes/ai-chat/lumina.js'
import aiDeepseek  from './routes/ai-chat/deepseek.js'
import dlTiktok    from './routes/downloader/tiktok.js'
import dlYoutube   from './routes/downloader/youtube.js'
import toolsSsweb  from './routes/tools/ssweb.js'
import toolsGenius from './routes/tools/genius.js'
import animeSearch   from './routes/anime/search.js'
import animeSchedule from './routes/anime/schedule.js'

import { meta as metaLumina }    from './routes/ai-chat/lumina.js'
import { meta as metaDeepseek }  from './routes/ai-chat/deepseek.js'
import { meta as metaTiktok }    from './routes/downloader/tiktok.js'
import { meta as metaYoutube }   from './routes/downloader/youtube.js'
import { meta as metaSsweb }     from './routes/tools/ssweb.js'
import { meta as metaGenius }    from './routes/tools/genius.js'
import { meta as metaAnimeSearch }   from './routes/anime/search.js'
import { meta as metaAnimeSchedule } from './routes/anime/schedule.js'

// ── App ─────────────────────────────────
const app = new Hono()

// Global middleware
app.use('*', cors({ origin: '*' }))
app.use('*', prettyJSON())
app.use('/api/*', blacklistMiddleware)
app.use('/api/*', rateLimitMiddleware)
app.use('/api/*', authMiddleware)
app.use('/api/*', loggerMiddleware)

// ── Route mounting ───────────────────────
app.route('/api/ai-chat/lumina',          aiLumina)
app.route('/api/ai-chat/deepseek',        aiDeepseek)
app.route('/api/downloader/tiktok',       dlTiktok)
app.route('/api/downloader/youtube',      dlYoutube)
app.route('/api/tools/ssweb',             toolsSsweb)
app.route('/api/tools/genius',            toolsGenius)
app.route('/api/anime/search',            animeSearch)
app.route('/api/anime/schedule',          animeSchedule)

// ── /endpoints — auto docs dari meta ─────
const ALL_META = [
  { path: '/api/ai-chat/lumina',          ...metaLumina },
  { path: '/api/ai-chat/deepseek',        ...metaDeepseek },
  { path: '/api/downloader/tiktok',       ...metaTiktok },
  { path: '/api/downloader/youtube',      ...metaYoutube },
  { path: '/api/tools/ssweb',             ...metaSsweb },
  { path: '/api/tools/genius',            ...metaGenius },
  { path: '/api/anime/search',            ...metaAnimeSearch },
  { path: '/api/anime/schedule',          ...metaAnimeSchedule },
]

app.get('/endpoints', (c) => {
  const grouped = ALL_META.reduce<Record<string, typeof ALL_META>>((acc, m) => {
    const cat = m.category
    acc[cat] ??= []
    acc[cat].push(m)
    return acc
  }, {})
  return c.json({ status: true, statusCode: 200, creator: 'Xena', result: grouped })
})

// ── Health check ─────────────────────────
app.get('/', (c) =>
  c.json({ status: true, message: 'Lumina API is running 🚀', creator: 'Xena' })
)

// ── 404 fallback ─────────────────────────
app.notFound((c) =>
  c.json({ status: false, statusCode: 404, creator: 'Xena', error: 'Endpoint tidak ditemukan' }, 404)
)

// ── Error handler ────────────────────────
app.onError((err, c) => {
  console.error('[ERROR]', c.req.path, err.message)
  return c.json({ status: false, statusCode: 500, creator: 'Xena', error: err.message }, 500)
})

// ── Bootstrap ────────────────────────────
reloadCache()

// Vercel: export fetch handler langsung
// Local dev: jalanin via `npx tsx src/index.ts`
export default app

// Untuk Vercel Edge/Node runtime
export const GET    = app.fetch
export const POST   = app.fetch
export const PUT    = app.fetch
export const DELETE = app.fetch
export const PATCH  = app.fetch
