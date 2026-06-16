import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { fetchJson } from '@lumina/utils'
import type { ApiResponse } from '@lumina/types'

export const meta = {
  name: 'Screenshot Website',
  desc: 'Ambil screenshot dari sebuah website.',
  category: 'TOOLS' as const,
  params: ['url'],
  method: 'GET' as const,
}

const schema = z.object({ url: z.string().url() })

const app = new Hono()

app.get('/', zValidator('query', schema), async (c) => {
  const { url } = c.req.valid('query')
  const apiUrl = `https://api.screenshotone.com/take?url=${encodeURIComponent(url)}&format=jpg&viewport_width=1280&viewport_height=800`

  const result: ApiResponse<{ image_url: string; source_url: string }> = {
    status: true, statusCode: 200, creator: 'Xena',
    result: { image_url: apiUrl, source_url: url },
  }
  return c.json(result)
})

export default app
