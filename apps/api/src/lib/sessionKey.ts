import { randomBytes } from 'crypto'
import { db, fbAdmin } from './firebase'
import { cache } from './cache'

// Cache di memory per warm serverless instance, biar gak query Firestore
// tiap request buat user yang sama berkali-kali.
const sessionKeyMemo = new Map<string, string>()

/**
 * Tiap user yang login punya satu "session key" tersembunyi (auto-dibuat
 * sekali). Ini dipakai pas mereka browsing web Lumina sendiri (Playground,
 * dsb) lewat Firebase ID token — jadi mereka gak perlu copy-paste API key
 * manual. Key ini tetap kebaca normal di dashboard (ditandai isSessionKey).
 */
export async function resolveSessionKey(uid: string): Promise<string> {
  const cached = sessionKeyMemo.get(uid)
  if (cached) return cached

  const existing = await db.collection('apikeys')
    .where('userId', '==', uid)
    .where('isSessionKey', '==', true)
    .limit(1)
    .get()

  let key: string

  if (!existing.empty) {
    key = existing.docs[0].id
  } else {
    key = `lumina-${randomBytes(24).toString('hex')}`
    await db.collection('apikeys').doc(key).set({
      userId:        uid,
      name:          'Browser Session',
      active:        true,
      isSessionKey:  true,
      requestCount:  0,
      lastUsedAt:    null,
      last4:         key.slice(-4),
      createdAt:     fbAdmin.firestore.FieldValue.serverTimestamp(),
    })
  }

  cache.apikeys.add(key)
  sessionKeyMemo.set(uid, key)
  return key
}
