// ══════════════════════════════════════════
//  LUMINA API — Gemini AI Chat
//  Scraper Gemini tanpa API key, support session/memory
// ══════════════════════════════════════════
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { sleep } from '@lumina/utils'
import type { ApiResponse, ChatResponse } from '@lumina/types'
import crypto from 'crypto'

export const meta = {
  name:     'Gemini AI',
  desc:     'Chat dengan Google Gemini AI tanpa API key. Support session/memory percakapan.',
  category: 'AI CHAT' as const,
  params:   ['query', 'session'],
  method:   'GET' as const,
}

// ── Constants ────────────────────────────
const UA_POOL = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
]

const HOME     = 'https://gemini.google.com/app'
const ENDPOINT = 'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate'

// ── In-memory session store ───────────────
// Key = sessionName, Value = session data
const sessionStore = new Map<string, GeminiSession>()

interface GeminiSession {
  cookie: string
  bl:     string
  fsid:   string
  uid:    string
  resume?: [string, string, string]
}

// ── Helpers ───────────────────────────────
const hex    = (n: number) => crypto.randomBytes(n).toString('hex')
const uuid   = () => crypto.randomUUID().toUpperCase()
const rUA    = () => UA_POOL[Math.floor(Math.random() * UA_POOL.length)]
const reqid  = () => Math.floor(Math.random() * 900000) + 100000

function cleanText(txt: string): string {
  return txt.replace(/\*\*/g, '').replace(/\n/g, ' ').replace(/  +/g, ' ').trim()
}

// ── Bootstrap: ambil cookie + token dari homepage ──
async function bootstrap(): Promise<GeminiSession> {
  await sleep(1000 + Math.random() * 2000)

  const res = await fetch(HOME, {
    headers: { 'user-agent': rUA(), 'accept-language': 'en-US,en;q=0.9' },
  })

  const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : []
  const cookie    = setCookie.map((c: string) => c.split(';')[0]).join('; ')
  const html      = await res.text()

  const blMatch   = html.match(/"cfb2h":"(.*?)"/)
  const fsidMatch = html.match(/"FdrFJe":"(.*?)"/)

  if (!blMatch || !fsidMatch) throw new Error('Gagal mengambil token Gemini. Coba lagi.')

  return { cookie, bl: blMatch[1], fsid: fsidMatch[1], uid: uuid() }
}

// ── Build request payload ─────────────────
function buildPayload(message: string, resume: string[], uid: string): string {
  const inner = [
    [message, 0, null, null, null, null, 0],
    ['en-US'],
    resume,
    '',
    hex(16),
    null, [1], 1, null, null, 1, 0, null, null, null, null, null,
    [[0]], 0, null, null, null, null, null, null, null, null, 1, null, null, [4],
    null, null, null, null, null, null, null, null, null, null, [2],
    null, null, null, null, null, null, null, null, null, null, null, 0,
    null, null, null, null, null, uid, null, [], null, null, null, null, null, null, 2,
    null, null, null, null, null, null, null, null, null, null, 1,
  ]
  return 'f.req=' + encodeURIComponent(JSON.stringify([null, JSON.stringify(inner)])) + '&'
}

// ── Parse streaming response ──────────────
interface ParsedReply {
  text:           string
  conversationId: string | null
  responseId:     string | null
  replyId:        string | null
}

function parseReply(raw: string): ParsedReply {
  const out: ParsedReply = { text: '', conversationId: null, responseId: null, replyId: null }

  for (const line of raw.split('\n')) {
    const s = line.trim()
    if (!s.startsWith('[["wrb.fr"')) continue

    let outer: any
    try { outer = JSON.parse(s) } catch { continue }

    for (const seg of outer) {
      if (!Array.isArray(seg) || seg[0] !== 'wrb.fr' || typeof seg[2] !== 'string') continue

      let body: any
      try { body = JSON.parse(seg[2]) } catch { continue }

      const ids = body[1]
      if (Array.isArray(ids)) {
        if (ids[0]?.startsWith('c_')) out.conversationId = ids[0]
        if (ids[1]?.startsWith('r_')) out.responseId     = ids[1]
      }

      const msgArr = body[4]
      if (Array.isArray(msgArr) && msgArr.length > 0 && Array.isArray(msgArr[0])) {
        const rId   = msgArr[0][0]
        const parts = msgArr[0][1]
        if (Array.isArray(parts)) {
          const txt = parts.join('')
          if (txt.length > out.text.length) { out.text = txt; out.replyId = rId }
        }
      }
    }
  }

  return out
}

// ── Main chat logic ───────────────────────
async function geminiChat(message: string, sessionName?: string) {
  // Load atau buat session baru
  let session: GeminiSession = sessionName
    ? (sessionStore.get(sessionName) ?? await bootstrap())
    : await bootstrap()

  const resume = session.resume
    ? [session.resume[0], session.resume[1], session.resume[2], null, null, null, null, null, null, '']
    : ['', '', '', null, null, null, null, null, null, '']

  const url = `${ENDPOINT}?bl=${encodeURIComponent(session.bl)}&f.sid=${encodeURIComponent(session.fsid)}&hl=en-US&_reqid=${reqid()}&rt=c`

  await sleep(800 + Math.random() * 1500)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type':                   'application/x-www-form-urlencoded;charset=UTF-8',
      'user-agent':                     rUA(),
      'origin':                         'https://gemini.google.com',
      'referer':                        'https://gemini.google.com/',
      'x-same-domain':                  '1',
      'x-goog-ext-525001261-jspb':      JSON.stringify([1, null, null, null, hex(4), null, null, 0, [4, 6], null, null, 1, null, null, 1, null, uuid()]),
      'x-goog-ext-525005358-jspb':      JSON.stringify([session.uid, 1]),
      'x-goog-ext-73010990-jspb':       '[0,0,0]',
      'x-goog-ext-73010989-jspb':       '[0]',
      cookie:                           session.cookie,
    },
    body: buildPayload(String(message), resume as string[], session.uid),
  })

  const raw   = await res.text()
  const reply = parseReply(raw)

  // Update session memory kalau ada session name
  if (reply.conversationId && reply.responseId && reply.replyId && sessionName) {
    session.resume = [reply.conversationId, reply.responseId, reply.replyId]
    sessionStore.set(sessionName, session)
  } else if (sessionName && !session.resume) {
    // Simpan session baru meski belum ada resume (supaya reuse cookie)
    sessionStore.set(sessionName, session)
  }

  if (!reply.text) throw new Error('Gemini tidak memberikan respons. Silakan coba lagi.')

  return {
    reply:   cleanText(reply.text),
    session: sessionName ?? null,
  }
}

// ── Route ─────────────────────────────────
const schema = z.object({
  query:   z.string().min(1, 'query tidak boleh kosong'),
  session: z.string().min(1).max(64).optional(),
})

const app = new Hono()

app.get('/', zValidator('query', schema), async (c) => {
  const { query, session } = c.req.valid('query')

  const { reply, session: activeSession } = await geminiChat(query, session)

  const result: ApiResponse<ChatResponse & { session: string | null }> = {
    status:     true,
    statusCode: 200,
    creator:    'Xena',
    result: {
      reply,
      model:   'Google Gemini',
      session: activeSession,
    },
  }

  return c.json(result)
})

export default app
