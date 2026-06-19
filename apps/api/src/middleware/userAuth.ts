import type { MiddlewareHandler } from 'hono'
import { fbAdmin } from '../lib/firebase'

/**
 * Memverifikasi Firebase ID token (dikirim user lewat header
 * `Authorization: Bearer <idToken>` setelah login di web).
 * Beda dengan authMiddleware (auth.ts) yang memverifikasi x-api-key
 * untuk akses endpoint publik — middleware ini khusus untuk
 * endpoint manajemen akun (/api/account/*).
 */
export const userAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const header = c.req.header('authorization') ?? ''
  const token  = header.startsWith('Bearer ') ? header.slice(7).trim() : null

  if (!token) {
    return c.json({ status: false, statusCode: 401, creator: 'Xena', error: 'Login diperlukan.' }, 401)
  }

  try {
    const decoded = await fbAdmin.auth().verifyIdToken(token)
    c.set('uid', decoded.uid)
    c.set('email', decoded.email ?? null)
    await next()
  } catch {
    return c.json({ status: false, statusCode: 401, creator: 'Xena', error: 'Sesi tidak valid atau sudah berakhir.' }, 401)
  }
}
