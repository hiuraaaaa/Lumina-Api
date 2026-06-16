import type { MiddlewareHandler } from 'hono'
import { db, fbAdmin } from '../lib/firebase.js'

const SKIP_PATHS = new Set(['/endpoints', '/set', '/stats', '/admin'])

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now()
  await next()

  const path = c.req.path
  if (SKIP_PATHS.has(path) || path.startsWith('/admin') || path.match(/\.(html|css|js|png|ico)$/)) return

  const ip       = c.get('ip') ?? 'unknown'
  const duration = Date.now() - start

  // Non-blocking Firestore log
  db.collection('traffic').add({
    path,
    method:    c.req.method,
    ip,
    status:    c.res.status,
    duration,
    timestamp: fbAdmin.firestore.FieldValue.serverTimestamp(),
    ua:        c.req.header('user-agent') ?? '',
  }).catch(() => {})
}
