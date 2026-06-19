import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { https } from 'https'

export const meta = {
  name: 'DeepSeek AI',
  desc: 'Chat dengan DeepSeek V4 Flash atau R1. Support reasoning stream extraction.',
  category: 'AI CHAT',
  params: ['query', 'model'],
  method: 'GET'
}

const BASE = 'https://deep-seek.ai'
const API = `${BASE}/api/chat`

const MODELS: Record<string, string> = {
  'v4-flash': 'deepseek/deepseek-v4-flash',
  'r1': 'deepseek/deepseek-r1',
}

const UA_POOL = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
]

const randomUA = () => UA_POOL[Math.floor(Math.random() * UA_POOL.length)]
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// Custom fetcher menggunakan native HTTPS untuk handle set-cookie array dengan benar
function fetchBuffer(url: string, options: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 15000,
    }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          text: () => Buffer.concat(chunks).toString('utf8'),
          getSetCookie: () => {
            const sc = res.headers['set-cookie']
            return Array.isArray(sc) ? sc : (sc ? [sc] : [])
          },
        })
      })
      res.on('error', reject)
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
    if (options.body) req.write(options.body)
    req.end()
  })
}

async function getSession() {
  const res = await fetchBuffer(BASE, {
    headers: {
      'User-Agent': randomUA(),
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })

  const html = res.text()
  const csrfMatch = html.match(/<meta name="csrf-token" content="([^"]+)"/)
  const csrf = csrfMatch ? csrfMatch[1] : ''

  const setCookies = res.getSetCookie()
  const xsrfCookie = setCookies.find((c: string) => c.includes('XSRF-TOKEN='))
  const sessionCookie = setCookies.find((c: string) => c.includes('deep_seek_session='))

  const xsrfRaw = xsrfCookie ? xsrfCookie.split(';')[0].split('=')[1] : ''
  const xsrfDecoded = decodeURIComponent(xsrfRaw)

  const cookieParts: string[] = []
  if (xsrfCookie) cookieParts.push(xsrfCookie.split(';')[0])
  if (sessionCookie) cookieParts.push(sessionCookie.split(';')[0])

  return { csrf, xsrfToken: xsrfDecoded, cookie: cookieParts.join('; ') }
}

function parseSSEStream(res: any): Promise<{ reasoning: string; content: string }> {
  return new Promise((resolve, reject) => {
    let content = ''
    let reasoning = ''
    let buffer = ''

    res.on('data', (chunk: any) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (raw === '[DONE]') continue

        try {
          const json = JSON.parse(raw)
          const delta = json?.choices?.[0]?.delta || {}
          if (delta.reasoning) reasoning += delta.reasoning
          if (delta.content) content += delta.content
        } catch {}
      }
    })

    res.on('end', () => resolve({ reasoning, content }))
    res.on('error', reject)
  })
}

async function runDeepseek(prompt: string, modelKey: string): Promise<{ reasoning: string; content: string }> {
  const modelId = MODELS[modelKey]
  let session = await getSession()
  const body = JSON.stringify({ model: modelId, messages: [{ role: 'user', content: prompt }] })
  let lastError = null

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await delay(2000 * attempt)
      session = await getSession()
    }

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      'X-CSRF-TOKEN': session.csrf,
      'X-XSRF-TOKEN': session.xsrfToken,
      Cookie: session.cookie,
      Origin: BASE,
      Referer: `${BASE}/`,
      'User-Agent': randomUA(),
      'Content-Length': Buffer.byteLength(body),
    }

    try {
      const res: any = await new Promise((resolve, reject) => {
        const req = https.request(API, { method: 'POST', headers, timeout: 180000 }, resolve)
        req.on('error', reject)
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
        req.write(body)
        req.end()
      })

      if (res.statusCode === 419 || res.statusCode === 401) {
        lastError = `HTTP ${res.statusCode}`
        continue
      }

      if (res.statusCode !== 200) {
        lastError = `HTTP ${res.statusCode}`
        continue
      }

      return await parseSSEStream(res)
    } catch (e: any) {
      lastError = e.message
    }
  }
  throw new Error(lastError || 'Unknown error occurred')
}

const app = new Hono()

const querySchema = z.object({
  query: z.string().min(1, 'query tidak boleh kosong'),
  model: z.enum(['v4-flash', 'r1']).default('v4-flash')
})

app.get('/', zValidator('query', querySchema), async (c) => {
  const { query, model } = c.req.valid('query')

  try {
    const data = await runDeepseek(query, model)

    return c.json({
      status: true,
      statusCode: 200,
      creator: 'Xena',
      result: {
        model: MODELS[model],
        reasoning: data.reasoning || null,
        reply: data.content
      }
    })
  } catch (error: any) {
    return c.json({
      status: false,
      statusCode: 500,
      creator: 'Xena',
      error: error.message || 'Internal Server Error'
    }, 500)
  }
})

export default app
