import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import axios from 'axios'
import type { ApiResponse, ChatResponse } from '../../lib/types'

export const meta = {
  name: 'Qwen3 Coder',
  desc: 'Chat dengan Qwen3 Coder AI secara gratis.',
  category: 'AI CHAT' as const,
  params: ['query'],
  method: 'GET' as const,
}

const app = new Hono()

app.get('/', zValidator('query', z.object({ query: z.string().min(1) })), async (c) => {
  const { query } = c.req.valid('query')

  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

  const res = await axios({
    url: 'https://api.free.ai/v1/chat/',
    method: 'POST',
    responseType: 'stream',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
      'User-Agent': 'Mozilla/5.0',
    },
    data: {
      messages: [{ role: 'user', content: query }],
      model: 'qwen3-coder',
      stream: true,
      lang: 'en',
    },
    timeout: 30000,
  })

  let fullAnswer = ''
  let buffer = ''

  await new Promise<void>((resolve, reject) => {
    res.data.on('data', (chunk: Buffer) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6)
          if (jsonStr === '[DONE]') continue

          try {
            const parsed = JSON.parse(jsonStr)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) fullAnswer += content
          } catch {
            // ignore malformed SSE chunk
          }
        }
      }
    })

    res.data.on('end', () => resolve())
    res.data.on('error', (err: Error) => reject(err))
  })

  const result: ApiResponse<ChatResponse> = {
    status: true,
    statusCode: 200,
    creator: 'Lumina',
    result: { reply: fullAnswer, model: 'qwen3-coder' },
  }

  return c.json(result)
})

export default app

