import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import WebSocket from 'ws'

export const meta = {
  name: 'Microsoft Copilot',
  desc: 'Chat dengan Copilot menggunakan model Default, Think Deeper, atau GPT-5 via WebSocket.',
  category: 'AI CHAT',
  params: ['query', 'model'],
  method: 'GET'
}

const MODELS: Record<string, string> = {
  'default': 'chat',
  'think-deeper': 'reasoning',
  'gpt-5': 'smart'
}

const UA = 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'

interface CopilotResponse {
  text: string
  citations: Array<{ title: string; icon: string; url: string }>
}

async function copilotChat(message: string, modelKey: string = 'default'): Promise<CopilotResponse> {
  const targetMode = MODELS[modelKey] || MODELS['default']

  // 1. Ambil Conversation ID via Fetch HTTP POST
  const convRes = await fetch('https://copilot.microsoft.com/c/api/conversations', {
    method: 'POST',
    headers: {
      'Origin': 'https://copilot.microsoft.com',
      'User-Agent': UA
    }
  })

  if (!convRes.ok) throw new Error(`Gagal menginisialisasi sesi Copilot: ${convRes.status}`)
  const convData = await convRes.json() as { id: string }
  const conversationId = convData.id

  // 2. Jalankan Koneksi WebSocket untuk Ambil Data Stream
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(
      `wss://copilot.microsoft.com/c/api/chat?api-version=2&features=-,ncedge,edgepagecontext&setflight=-,ncedge,edgepagecontext&ncedge=1`,
      {
        headers: {
          'Origin': 'https://copilot.microsoft.com',
          'User-Agent': UA
        }
      }
    )

    const response: CopilotResponse = { text: '', citations: [] }

    ws.on('open', () => {
      // Kirim konfigurasi awal fitur yang didukung
      ws.send(JSON.stringify({
        event: 'setOptions',
        supportedFeatures: ['partial-generated-images'],
        supportedCards: ['weather', 'local', 'image', 'sports', 'video', 'ads', 'safetyHelpline', 'quiz', 'finance', 'recipe'],
        ads: { supportedTypes: ['text', 'product', 'multimedia', 'tourActivity', 'propertyPromotion'] }
      }))

      // Kirim pesan teks utama
      ws.send(JSON.stringify({
        event: 'send',
        mode: targetMode,
        conversationId: conversationId,
        content: [{ type: 'text', text: message }],
        context: {}
      }))
    })

    ws.on('message', (chunk) => {
      try {
        const parsed = JSON.parse(chunk.toString())

        switch (parsed.event) {
          case 'appendText':
            response.text += parsed.text || ''
            break
          case 'citation':
            response.citations.push({
              title: parsed.title,
              icon: parsed.iconUrl,
              url: parsed.url
            })
            break
          case 'done':
            resolve(response)
            ws.close()
            break
          case 'error':
            reject(new Error(parsed.message))
            ws.close()
            break
        }
      } catch (error) {
        reject(error)
      }
    })

    ws.on('error', reject)
  })
}

const app = new Hono()

const querySchema = z.object({
  query: z.string().min(1, 'query tidak boleh kosong'),
  model: z.enum(['default', 'think-deeper', 'gpt-5']).default('default')
})

app.get('/', zValidator('query', querySchema), async (c) => {
  const { query, model } = c.req.valid('query')

  try {
    const result = await copilotChat(query, model)

    return c.json({
      status: true,
      statusCode: 200,
      creator: 'Xena',
      result: {
        model: model,
        reply: result.text.trim(),
        citations: result.citations
      }
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

