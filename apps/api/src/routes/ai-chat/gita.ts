import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { postJson } from '../../lib/utils'
import type { ApiResponse, ChatResponse } from '../../lib/types'

export const meta = {
  name: 'Gita AI',
  desc: 'Chat dengan Bhagavad Gita AI Assistant secara gratis.',
  category: 'AI CHAT' as const,
  params: ['query'],
  method: 'GET' as const,
}

const app = new Hono()

app.get('/', zValidator('query', z.object({ query: z.string().min(1) })), async (c) => {
  const { query } = c.req.valid('query')

  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

  const data = await postJson<any>(
    'https://wwgvrumteg.execute-api.us-east-1.amazonaws.com/prod/api/chat',
    {
      message: query,
      userId,
      context: [{ role: 'user', content: query, timestamp: Date.now() }],
      questionCount: 0,
      contextSummary: null,
    }
  )

  const reply = data?.message ?? ''

  const result: ApiResponse<ChatResponse> = {
    status: true,
    statusCode: 200,
    creator: 'Lumina',
    result: { reply, model: 'gita-ai' },
  }

  return c.json(result)
})

export default app

