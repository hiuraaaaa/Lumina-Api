import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { fetchJson } from '@lumina/utils'
import type { ApiResponse, DownloadResult } from '@lumina/types'

export const meta = {
  name: 'YouTube Downloader',
  desc: 'Download video/audio dari YouTube.',
  category: 'DOWNLOADER' as const,
  params: ['url', 'quality'],
  method: 'GET' as const,
}

const schema = z.object({
  url:     z.string().url().refine(u => u.includes('youtube.com') || u.includes('youtu.be')),
  quality: z.enum(['360p', '480p', '720p', '1080p', 'audio']).default('720p'),
})

const app = new Hono()

app.get('/', zValidator('query', schema), async (c) => {
  const { url, quality } = c.req.valid('query')

  const data = await fetchJson<any>(
    `https://api.cobalt.tools/api/json`,
    {
      method: 'POST',
      data: { url, vQuality: quality === 'audio' ? '720' : quality, isAudioOnly: quality === 'audio' },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }
  )

  const result: ApiResponse<DownloadResult> = {
    status: true, statusCode: 200, creator: 'Xena',
    result: {
      url: data?.url ?? '',
      title: data?.filename ?? '',
    },
  }
  return c.json(result)
})

export default app
