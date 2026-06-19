import { Hono } from 'hono'
import { randomBytes } from 'crypto'
import { db, fbAdmin } from '../../lib/firebase'
import { cache } from '../../lib/cache'
import { userAuthMiddleware } from '../../middleware/userAuth'

const app = new Hono()

const MAX_KEYS_PER_USER = 10

app.use('*', userAuthMiddleware)

function generateKey(): string {
  return `lumina-${randomBytes(24).toString('hex')}`
}

function serializeKey(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    name:         data.name ?? 'Unnamed key',
    masked:       `lumina-${'•'.repeat(10)}${data.last4 ?? '????'}`,
    active:       data.active !== false,
    requestCount: data.requestCount ?? 0,
    createdAt:    data.createdAt?.toDate?.()?.toISOString() ?? null,
    lastUsedAt:   data.lastUsedAt?.toDate?.()?.toISOString() ?? null,
  }
}

// GET /api/account/keys — daftar semua key milik user yang login
app.get('/', async (c) => {
  const uid  = c.get('uid') as string
  const snap = await db.collection('apikeys').where('userId', '==', uid).get()
  const keys = snap.docs
    .map((d) => serializeKey(d.id, d.data()))
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  return c.json({ status: true, statusCode: 200, creator: 'Xena', result: keys })
})

// POST /api/account/keys — buat key baru { name }
app.post('/', async (c) => {
  const uid  = c.get('uid') as string
  const body = await c.req.json().catch(() => ({}))
  const name = typeof body?.name === 'string' && body.name.trim()
    ? body.name.trim().slice(0, 60)
    : 'Unnamed key'

  const existing = await db.collection('apikeys').where('userId', '==', uid).get()
  if (existing.size >= MAX_KEYS_PER_USER) {
    return c.json(
      { status: false, statusCode: 400, creator: 'Xena', error: `Maksimal ${MAX_KEYS_PER_USER} API key per akun.` },
      400,
    )
  }

  const key = generateKey()
  await db.collection('apikeys').doc(key).set({
    userId:       uid,
    name,
    active:       true,
    requestCount: 0,
    lastUsedAt:   null,
    last4:        key.slice(-4),
    createdAt:    fbAdmin.firestore.FieldValue.serverTimestamp(),
  })
  cache.apikeys.add(key)

  // Key plain-text cuma dikirim sekali, saat dibuat.
  return c.json(
    { status: true, statusCode: 201, creator: 'Xena', result: { id: key, key, name } },
    201,
  )
})

// DELETE /api/account/keys/:id — cabut (revoke) key
app.delete('/:id', async (c) => {
  const uid = c.get('uid') as string
  const id  = c.req.param('id')
  const ref = db.collection('apikeys').doc(id)
  const doc = await ref.get()

  if (!doc.exists || doc.data()?.userId !== uid) {
    return c.json({ status: false, statusCode: 404, creator: 'Xena', error: 'API key tidak ditemukan.' }, 404)
  }

  await ref.update({ active: false })
  cache.apikeys.delete(id)

  return c.json({ status: true, statusCode: 200, creator: 'Xena', result: { id, active: false } })
})

export default app

