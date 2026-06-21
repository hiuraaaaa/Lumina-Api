'use client'

import { useEffect, useRef, useState } from 'react'
import { ProviderIcon } from './ProviderIcon'
import type { EndpointDoc } from '@lumina/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  error?: boolean
}

interface Props {
  endpoint: EndpointDoc
  apiBase:  string
  getToken: () => Promise<string | null>
  loggedIn: boolean
}

function randomSessionId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function ChatPanel({ endpoint, apiBase, getToken, loggedIn }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [sessionId, setSessionId] = useState(randomSessionId)
  const bottomRef = useRef<HTMLDivElement>(null)

  const supportsSession = endpoint.params.some(p => p.name === 'session')

  // Reset chat tiap kali ganti provider
  useEffect(() => {
    setMessages([])
    setSessionId(randomSessionId())
    setInput('')
  }, [endpoint.slug, endpoint.category])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setSending(true)

    try {
      const params = new URLSearchParams({ query: text })
      if (supportsSession) params.set('session', sessionId)

      const headers: Record<string, string> = {}
      if (loggedIn) {
        const token = await getToken()
        if (token) headers.Authorization = `Bearer ${token}`
      }

      const res  = await fetch(`${apiBase}${endpoint.path}?${params.toString()}`, { headers })
      const data = await res.json()

      if (!data.status) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error ?? 'Terjadi kesalahan.', error: true }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.result?.reply ?? JSON.stringify(data.result) }])
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: e.message ?? 'Gagal menghubungi server.', error: true }])
    } finally {
      setSending(false)
    }
  }

  function handleNewChat() {
    setMessages([])
    setSessionId(randomSessionId())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem', flexWrap: 'wrap', gap: '.6rem',
      }}>
        <span style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
          {supportsSession ? `Session: ${sessionId}` : 'Tanpa memory percakapan'}
        </span>
        <button
          onClick={handleNewChat}
          style={{
            background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
            padding: '.4rem .8rem', fontSize: '.62rem', textTransform: 'uppercase',
            letterSpacing: '.06em', cursor: 'pointer', fontFamily: "'DM Mono', monospace",
          }}
        >
          + Chat Baru
        </button>
      </div>

      <div style={{
        flex: 1, minHeight: 280, maxHeight: 480, overflowY: 'auto',
        border: '1px solid var(--border)', background: 'var(--bg2)',
        padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.85rem',
        marginBottom: '1rem',
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '.6rem', color: 'var(--muted)', fontSize: '.72rem', textAlign: 'center',
          }}>
            <ProviderIcon slug={endpoint.slug} size={28} />
            <span>Mulai ngobrol sama {endpoint.name}</span>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', gap: '.6rem',
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
          }}>
            <div style={{ flexShrink: 0, marginTop: '.1rem' }}>
              {m.role === 'assistant'
                ? <ProviderIcon slug={endpoint.slug} size={20} />
                : <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.6rem', fontWeight: 700, color: 'var(--bg)',
                  }}>U</div>}
            </div>
            <div style={{
              maxWidth: '78%', padding: '.6rem .85rem', fontSize: '.76rem', lineHeight: 1.6,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface)',
              color:      m.role === 'user' ? 'var(--bg)' : (m.error ? '#f87171' : 'var(--text)'),
              border: m.role === 'user' ? 'none' : '1px solid var(--border)',
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <ProviderIcon slug={endpoint.slug} size={20} />
            <div style={{
              padding: '.6rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)',
              fontSize: '.76rem', color: 'var(--muted)',
            }}>
              mengetik...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: '.6rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Ketik pesan..."
          disabled={sending}
          style={{
            flex: 1, boxSizing: 'border-box', background: 'rgba(255,255,255,.04)',
            border: '1px solid var(--border)', padding: '.75rem .9rem',
            fontFamily: "'DM Mono', monospace", fontSize: '.74rem', color: 'var(--text)',
            outline: 'none', minHeight: 46,
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          style={{
            flexShrink: 0, minHeight: 46, padding: '0 1.2rem',
            background: sending || !input.trim() ? 'var(--surface)' : 'var(--accent)',
            color:      sending || !input.trim() ? 'var(--muted)' : 'var(--bg)',
            border: '1px solid ' + (sending || !input.trim() ? 'var(--border)' : 'var(--accent)'),
            fontFamily: "'DM Mono', monospace", fontSize: '.7rem', textTransform: 'uppercase',
            letterSpacing: '.06em', cursor: sending || !input.trim() ? 'default' : 'pointer',
          }}
        >
          Kirim
        </button>
      </div>
    </div>
  )
}
