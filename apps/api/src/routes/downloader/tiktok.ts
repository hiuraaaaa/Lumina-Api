import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { fetchJson } from '@lumina/utils'
import type { ApiResponse, DownloadResult } from '@lumina/types'

export const meta = {
  name: 'TikTok Downloader',
  desc: 'Download video TikTok tanpa watermark.',
  category: 'DOWNLOADER' as const,
  params: ['url'],
  method: 'GET' as const,
}

const schema = z.object({
  url: z.string().url('URL tidak valid').refine(u => u.includes('tiktok.com'), 'Harus URL TikTok'),
})

const app = new Hono()

app.get('/', zValidator('query', schema), async (c) => {
  const { url } = c.req.valid('query')

  const data = await fetchJson<any>(
    `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`
  )

  const result: ApiResponse<DownloadResult> = {
    status: true, statusCode: 200, creator: 'Xena',
    result: {
      title:     data?.video?.title ?? '',
      author:    data?.author?.name ?? '',
      thumbnail: data?.video?.cover ?? '',
      url: [
        { quality: 'No Watermark', url: data?.video?.noWatermark ?? '', type: 'video' },
        { quality: 'Audio Only',   url: data?.video?.music ?? '',       type: 'audio' },
      ],
    },
  }
  return c.json(result)
})

export default app
