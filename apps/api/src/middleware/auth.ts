import type { MiddlewareHandler } from 'hono'
import { cache } from '../lib/cache'

// Semua endpoint /api/* sekarang wajib API key (atau session key hasil
// resolveApiKeyMiddleware kalau diakses dari web sendiri pas login).
// Pengecualian: /api/account/* — itu pakai Firebase ID token sendiri lewat
// userAuthMiddleware, bukan x-api-key.
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const path = c.req.path.replace(/^\/api/, '')
  if (path.startsWith('/account/')) return next()

  const apikey = c.get('resolvedKey') as string | null
  if (!apikey || !cache.apikeys.has(apikey)) {
    return c.json(
      {
        status: false, statusCode: 401, creator: 'Xena',
        error: 'API key diperlukan. Login & buat key gratis di dashboard, atau gunakan header x-api-key.',
      },
      401,
    )
  }
  await next()
}
