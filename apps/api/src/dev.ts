// ── Local dev server (hanya untuk development) ──
// Jalankan: npx tsx src/dev.ts
import { serve } from '@hono/node-server'
import app from './index.js'

const PORT = Number(process.env.PORT ?? 3000)
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`🚀 Lumina API (dev) running at http://localhost:${PORT}`)
})
