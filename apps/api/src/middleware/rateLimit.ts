import type { Context, MiddlewareHandler } from 'hono'
import { cache } from '../lib/cache'
import { db, fbAdmin } from '../lib/firebase'

const rateMap = new Map<string, { count: number; resetAt: number }>()

const RATE_WINDOW  = 60_000
const ANON_LIMIT    = 20   // tanpa API key, dihitung per IP
const KEYED_LIMIT   = 100  // pakai API key valid, dihitung per key

const MAX_LOGS_PER_KEY = 50 // batas activity log yang disimpan per key

setInterval(() => {
  const now = Date.now()
  for (const [id, entry] of rateMap.entries()) {
    if (now > entry.resetAt) rateMap.delete(id)
  }
}, 5 * 60_000)

function checkRateLimit(id: string, limit: number): { ok: boolean; remaining: number; resetAt: number } {
  const now   = Date.now()
  const entry = rateMap.get(id)
  if (!entry || now > entry.resetAt) {
    const resetAt = now + RATE_WINDOW
    rateMap.set(id, { count: 1, resetAt })
    return { ok: true, remaining: limit - 1, resetAt }
  }
  entry.count++
  return { ok: entry.count <= limit, remaining: Math.max(limit - entry.count, 0), resetAt: entry.resetAt }
}

// Catat pemakaian key: counter + activity log (fire-and-forget, gak nambah latency).
// Log dibatasi MAX_LOGS_PER_KEY entri terbaru per key biar gak numpuk di Firestore.
function trackKeyUsage(apikey: string, c: Context) {
  const keyRef = db.collection('apikeys').doc(apikey)

  keyRef.update({
    requestCount: fbAdmin.firestore.FieldValue.increment(1),
    lastUsedAt:   fbAdmin.firestore.FieldValue.serverTimestamp(),
  }).catch(() => {})

  const logsRef = keyRef.collection('logs')
  logsRef.add({
    path:      c.req.path,
    method:    c.req.method,
    ip:        c.get('ip') ?? null,
    timestamp: fbAdmin.firestore.FieldValue.serverTimestamp(),
  }).then(async () => {
    const snap = await logsRef.orderBy('timestamp', 'desc').offset(MAX_LOGS_PER_KEY).limit(20).get()
    if (!snap.empty) {
      const batch = db.batch()
      snap.docs.forEach((d) => batch.delete(d.ref))
      await batch.commit()
    }
  }).catch(() => {})
}

// Request dengan x-api-key valid dihitung per-key dengan limit lebih besar +
// dicatat ke activity log. Request tanpa key (atau key invalid) dihitung
// per-IP dengan limit lebih kecil dan gak dicatat.
export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const apikey      = c.get('resolvedKey') as string | null
  const hasValidKey = !!apikey && cache.apikeys.has(apikey)

  const id    = hasValidKey ? `key:${apikey}` : `ip:${c.get('ip') ?? 'unknown'}`
  const limit = hasValidKey ? KEYED_LIMIT : ANON_LIMIT

  const { ok, remaining, resetAt } = checkRateLimit(id, limit)

  c.header('X-RateLimit-Limit', String(limit))
  c.header('X-RateLimit-Remaining', String(remaining))

  if (!ok) {
    return c.json(
      {
        status: false, statusCode: 429, creator: 'Xena',
        error: hasValidKey
          ? 'Limit API key tercapai (100 req/menit). Coba lagi nanti.'
          : 'Limit tanpa API key tercapai (20 req/menit). Buat API key gratis di dashboard buat limit lebih besar.',
        retryAfter: `${Math.ceil((resetAt - Date.now()) / 1000)}s`,
      },
      429,
    )
  }

  if (hasValidKey) trackKeyUsage(apikey!, c)

  await next()
}
