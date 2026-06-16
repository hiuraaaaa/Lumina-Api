import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { fetchJson } from '@lumina/utils'
import type { ApiResponse, AnimeResult } from '@lumina/types'

export const meta = {
  name: 'Anime Search',
  desc: 'Cari anime berdasarkan judul via Jikan API (MyAnimeList).',
  category: 'ANIME' as const,
  params: ['query'],
  method: 'GET' as const,
}

const schema = z.object({ query: z.string().min(1) })

const app = new Hono()

app.get('/', zValidator('query', schema), async (c) => {
  const { query } = c.req.valid('query')

  const data = await fetchJson<any>(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`
  )

  const results: AnimeResult[] = (data?.data ?? []).map((a: any) => ({
    title:     a.title ?? '',
    slug:      String(a.mal_id),
    thumbnail: a.images?.jpg?.image_url ?? '',
    score:     String(a.score ?? ''),
    status:    a.status ?? '',
    genres:    (a.genres ?? []).map((g: any) => g.name),
    synopsis:  a.synopsis ?? '',
  }))

  const result: ApiResponse<AnimeResult[]> = {
    status: true, statusCode: 200, creator: 'Xena',
    result: results,
  }
  return c.json(result)
})

export default app
