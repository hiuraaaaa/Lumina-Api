'use client'

import { useState } from 'react'

// Mapping slug endpoint Lumina -> slug icon di @lobehub/icons-static-svg
// Cek semua slug yang tersedia di https://icons.lobehub.com
const ICON_SLUG: Record<string, string> = {
  deepseek:     'deepseek',
  qwen3:        'qwen',
  gemini:       'gemini',
  llama4:       'meta',
  'claude3.5':  'claude',
  copilot:      'copilot',
}

// Provider tanpa brand icon publik (model custom/niche) — pakai emoji.
const FALLBACK_EMOJI: Record<string, string> = {
  lumina: '⚡',
  gita:   '🕉️',
}

function iconUrl(iconSlug: string) {
  return `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${iconSlug}-color.svg`
}

export function ProviderIcon({ slug, size = 20 }: { slug: string; size?: number }) {
  const iconSlug       = ICON_SLUG[slug]
  const [failed, setFailed] = useState(false)

  if (!iconSlug || failed) {
    return (
      <span style={{ fontSize: size * 0.85, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        {FALLBACK_EMOJI[slug] ?? '🤖'}
      </span>
    )
  }

  return (
    <img
      src={iconUrl(iconSlug)}
      width={size}
      height={size}
      alt={`${slug} icon`}
      onError={() => setFailed(true)}
      style={{ display: 'inline-block', borderRadius: 4, flexShrink: 0 }}
    />
  )
}
