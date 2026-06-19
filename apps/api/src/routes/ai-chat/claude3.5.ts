import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import type { ApiResponse, ChatResponse, RouteDefinition } from '../../lib/types'

export const meta: RouteDefinition = {
  name: 'Claude3.5 Sonnet',
  desc: 'Chat dengan Claude 3.5 Sonnet via Overchat AI. Support session/memory.',
  category: 'AI CHAT',
  params: ['query', 'session'],
  method: 'GET'
}

const API = 'https://api.overchat.ai/v1/chat/completions'
const MODEL = 'claude-haiku-4-5-20251001'
const SESSION_DIR = path.join(process.cwd(), 'overchat-sessions')

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true })
}

const UAS = [
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/147.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 Chrome/149.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 Version/18.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149.0.0.0 Safari/537.36'
]

const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const clean = (t: string) => (t || '')
  .replace(/\*\*/g, '')
  .replace(/\*/g, '')
  .replace(/__/g, '')
  .replace(/_/g, '')
  .replace(/`/g, '')
  .replace(/\\n/g, ' ')
  .replace(/\n+/g, ' ')
  .replace(/\t+/g, ' ')
  .replace(/  +/g, ' ')
  .trim()

function handleSession(name: string = 'default') {
  const file = path.join(SESSION_DIR, `${name}.json`)
  let s: { chatId: string; deviceId: string; messages: any[] }

  try {
    s = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!s.deviceId) s.deviceId = crypto.randomUUID()
    if (!Array.isArray(s.messages)) s.messages = []
  } catch {
    s = { chatId: crypto.randomUUID(), deviceId: crypto.randomUUID(), messages: [] }
    fs.writeFileSync(file, JSON.stringify(s, null, 2))
  }

  return {
    data: s,
    save: (updated: typeof s) => fs.writeFileSync(file, JSON.stringify(updated, null, 2))
  }
}

async function overchat(prompt: string, sessionName: string = 'default'): Promise<string> {
  await sleep(100 + Math.random() * 500)
  const session = handleSession(sessionName)
  
  const messages = [
    ...session.data.messages.slice(-10),
    { id: crypto.randomUUID(), role: 'user', content: prompt },
    { 
      id: crypto.randomUUID(), 
      role: 'system', 
      content: 'Jawab dengan bahasa natural, singkat, dan jelas. Jangan gunakan markdown, asterik, atau formatting apapun. Jangan gunakan emoji.' 
    }
  ]

  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'sec-ch-ua-platform': '"Android"',
      'x-device-uuid': session.data.deviceId,
      'sec-ch-ua': '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
      'sec-ch-ua-mobile': '?1',
      'x-device-language': 'id-ID',
      'x-device-platform': 'web',
      'x-device-version': '1.0.44',
      'user-agent': pick(UAS),
      'accept': '*/*',
      'content-type': 'application/json',
      'origin': 'https://overchat.ai',
      'referer': 'https://overchat.ai/',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8'
    },
    body: JSON.stringify({
      chatId: session.data.chatId,
      model: MODEL,
      messages,
      personaId: 'claude-haiku-4-5-landing',
      frequency_penalty: 0,
      max_tokens: 4000,
      presence_penalty: 0,
      stream: true,
      temperature: 0.5,
      top_p: 0.95
    })
  })

  if (!res.ok) throw new Error(`Target API returned status ${res.status}`)
  
  const reader = res.body?.getReader()
  if (!reader) throw new Error('Gagal membaca response stream.')
  
  const decoder = new TextDecoder()
  let buf = ''
  let answer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() || ''

    for (const line of lines) {
      const l = line.trim()
      if (!l.startsWith('data:')) continue

      const d = l.slice(5).trim()
      if (!d || d === '[DONE]') continue

      try {
        const json = JSON.parse(d)
        const content = json.choices?.[0]?.delta?.content
        if (typeof content === 'string') answer += content
      } catch {}
    }
  }

  answer = clean(answer)
  
  session.data.messages.push(
    { id: crypto.randomUUID(), role: 'user', content: prompt },
    { id: crypto.randomUUID(), role: 'assistant', content: answer }
  )

  if (session.data.messages.length > 20) {
    session.data.messages = session.data.messages.slice(-20)
  }

  session.save(session.data)
  return answer
}

const app = new Hono()

const schema = z.object({
  query: z.string().min(1, 'query tidak boleh kosong'),
  session: z.string().min(1).max(64).optional()
})

app.get('/', zValidator('query', schema), async (c) => {
  const { query, session } = c.req.valid('query')
  
  try {
    const reply = await overchat(query, session)
    
    return c.json({
      status: true,
      statusCode: 200,
      creator: 'Xena',
      result: {
        reply,
        model: 'Claude Haiku 4.5',
        session: session || 'default'
      } as ChatResponse & { session: string }
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

