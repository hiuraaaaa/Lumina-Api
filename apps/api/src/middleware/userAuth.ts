import type { MiddlewareHandler } from 'hono'
import { cache } from '../lib/cache'
import { db, fbAdmin } from '../lib/firebase'

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const path = c.req.path.replace(/^\/api/, '')
  if (!cache.requireKeyEndpoints.has(path)) return next()
  const apikey = c.req.header('x-api-key') ?? c.req.query('apikey') ?? c.req.query('key')
  if (!apikey || !cache.apikeys.has(apikey)) {
    return c.json({ status: false, statusCode: 401, creator: 'Xena', error: 'API key required or invalid.' }, 401)
  }
  // Catat pemakaian key, fire-and-forget biar gak nambah latency.
  db.collection('apikeys').doc(apikey).update({
    requestCount: fbAdmin.firestore.FieldValue.increment(1),
    lastUsedAt:   fbAdmin.firestore.FieldValue.serverTimestamp(),
  }).catch(() => {})
  await next()
}

