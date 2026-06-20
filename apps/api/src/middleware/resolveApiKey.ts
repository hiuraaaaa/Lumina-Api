import type { MiddlewareHandler } from 'hono'
import { fbAdmin } from '../lib/firebase'
import { resolveSessionKey } from '../lib/sessionKey'

/**
 * Jalan paling awal di chain /api/* — menentukan "resolvedKey" yang dipakai
 * rateLimitMiddleware & authMiddleware di belakangnya:
 *
 *  1. Kalau ada header x-api-key / ?apikey= / ?key= → dipakai langsung.
 *     Ini jalur buat aplikasi/luar web (curl, app pihak ketiga, dst).
 *  2. Kalau gak ada, tapi ada Authorization: Bearer <Firebase ID token>
 *     yang valid → resolve ke session key otomatis milik user itu.
 *     Ini jalur buat web Lumina sendiri (Playground dkk) pas user login,
 *     jadi gak perlu nempelin key manual di browser.
 *  3. Kalau gak ada keduanya → resolvedKey null (anonim, kena limit kecil
 *     dan ditolak authMiddleware untuk endpoint yang wajib key).
 */
export const resolveApiKeyMiddleware: MiddlewareHandler = async (c, next) => {
  let apikey: string | null =
    c.req.header('x-api-key') ?? c.req.query('apikey') ?? c.req.query('key') ?? null

  if (!apikey) {
    const authHeader = c.req.header('authorization') ?? ''
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
    if (idToken) {
      try {
        const decoded = await fbAdmin.auth().verifyIdToken(idToken)
        apikey = await resolveSessionKey(decoded.uid)
      } catch {
        // Token gak valid/expired — anggap anonim, jangan throw.
      }
    }
  }

  c.set('resolvedKey', apikey)
  await next()
}
