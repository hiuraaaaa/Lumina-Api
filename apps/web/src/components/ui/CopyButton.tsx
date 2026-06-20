'use client'

import { useState } from 'react'

interface Props { text: string }

export default function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      onClick={copy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '.4rem',
        padding: '.3rem .6rem', border: '1px solid var(--border)',
        background: 'transparent',
        color: copied ? 'var(--accent)' : 'var(--muted)',
        borderColor: copied ? 'var(--accent)' : 'var(--border)',
        cursor: 'pointer',
        fontFamily: "'DM Mono', monospace", fontSize: '.6rem',
        letterSpacing: '.08em', textTransform: 'uppercase',
        transition: 'border-color .2s, color .2s',
        minHeight: 30, flexShrink: 0,
      }}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          copied
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          copy
        </>
      )}
    </button>
  )
}

