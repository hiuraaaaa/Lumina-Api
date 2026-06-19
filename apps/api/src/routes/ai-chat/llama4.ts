// ══════════════════════════════════════════
//  LUMINA API — Llama 4 Scout AI
//  Scraper Llama 4 Scout via aiconvert.online (Murni Tanpa Session)
// ══════════════════════════════════════════
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { ApiResponse, ChatResponse, RouteDefinition } from '../../lib/types'

export const meta: RouteDefinition = {
  name:     'Llama 4 Scout AI',
  desc:     'Chat dengan Llama 4 Scout 17B tanpa API key.',
  category: 'AI CHAT',
  params:   ['query'], // Session dihapus dari meta
  method:   'GET',
}

// ── Constants ────────────────────────────
const ENDPOINT = 'https://aiconvert.online/api/llama-4-chat'

// ── Main logic ───────────────────────────
async function llamaChat(message: string): Promise<string> {
  // Langsung kirim satu pesan tunggal tanpa history
  const payload = {
    messages: [{ role: 'user', content: message }]
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
      'Accept':       'text/event-stream',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Target API returned status ${res.status}`)
  }

  const reader = res.body?.getReader()
  if (!reader) {
    throw new Error('Gagal membaca response stream dari target.')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let fullResponse = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data: ')) continue

      const dataStr = trimmed.slice(6).trim()
      if (dataStr === '[DONE]') continue

      try {
        const data = JSON.parse(dataStr)
        const content = data.choices?.[0]?.delta?.content
        if (content) {
          fullResponse += content
        }
      } catch (e) {
        // Abaikan chunk JSON yang belum complete
      }
    }
  }

  if (!fullResponse) {
    throw new Error('Llama 4 tidak memberikan respon. Silakan coba lagi.')
  }

  return fullResponse
}

// ── Route ─────────────────────────────────
const schema = z.object({
  query: z.string().min(1, 'query tidak boleh kosong'),
})

const app = new Hono()

app.get('/', zValidator('query', schema), async (c) => {
  const { query } = c.req.valid('query')

  try {
    const reply = await llamaChat(query)

    const result: ApiResponse<ChatResponse> = {
      status:     true,
      statusCode: 200,
      creator:    'Xena',
      result: {
        reply,
        model: 'Llama 4 Scout 17B',
      },
    }

    return c.json(result)
  } catch (error: any) {
    return c.json({
      status:     false,
      statusCode: 500,
      creator:    'Xena',
      error:      error.message || 'Internal Server Error',
    }, 500)
  }
})

export default app

