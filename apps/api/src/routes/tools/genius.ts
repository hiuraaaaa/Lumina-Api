import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { fetchJson } from '@lumina/utils'
import type { ApiResponse } from '@lumina/types'

export const meta = {
  name: 'Genius Lyrics',
  desc: 'Cari lirik lagu dari Genius.',
  category: 'TOOLS' as const,
  params: ['query'],
  method: 'GET' as const,
}

const schema = z.object({ query: z.string().min(1) })

interface LyricsResult {
  title: string
  artist: string
  thumbnail: string
  url: string
  lyrics: string
}

const app = new Hono()

app.get('/', zValidator('query', schema), async (c) => {
  const { query } = c.req.valid('query')

  const search = await fetchJson<any>(
    `https://genius.com/api/search/multi?per_page=1&q=${encodeURIComponent(query)}`
  )

  const hit = search?.response?.sections?.[0]?.hits?.[0]?.result
  if (!hit) return c.json({ status: false, statusCode: 404, creator: 'Xena', error: 'Lagu tidak ditemukan' }, 404)

  const result: ApiResponse<LyricsResult> = {
    status: true, statusCode: 200, creator: 'Xena',
    result: {
      title:     hit.title,
      artist:    hit.primary_artist?.name ?? '',
      thumbnail: hit.song_art_image_url ?? '',
      url:       hit.url,
      lyrics:    '[ Fetch dari URL result.url untuk lirik lengkap ]',
    },
  }
  return c.json(result)
})

export default app
