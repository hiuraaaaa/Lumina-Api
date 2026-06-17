'use client'

import { motion } from 'framer-motion'
import PlaygroundInline from '@/components/ui/PlaygroundInline'
import CopyButton from '@/components/ui/CopyButton'
import type { EndpointDoc } from '@lumina/types'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: .6, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
}

interface Props {
  ep:         EndpointDoc
  exampleUrl: string
  apiBase:    string
}

export default function EndpointContent({ ep, exampleUrl, apiBase }: Props) {
  return (
    <>
      <style>{`
        .param-row {
          display: grid;
          grid-template-columns: minmax(80px,1fr) 60px 85px;
          gap: .5rem; padding: .9rem 1rem;
          border-bottom: 1px solid var(--border);
          align-items: start; font-size: .72rem;
        }
        .param-row:last-child { border-bottom: none; }
        @media (min-width: 640px) {
          .param-row { grid-template-columns: minmax(100px,1fr) 80px 90px 1fr; }
        }
        .sm-grid { display: none; }
        @media (min-width: 640px) {
          .sm-grid { display: grid !important; }
          .param-desc { display: block !important; }
          .param-desc-mobile { display: none !important; }
        }
        .param-desc { display: none; }
        .param-desc-mobile {
          grid-column: 1 / -1; font-size: .67rem;
          color: var(--muted); padding-top: .3rem; line-height: 1.5;
        }
        .method-get  { background: rgba(74,222,128,.1);  color: #4ade80; border: 1px solid rgba(74,222,128,.2); }
        .method-post { background: rgba(96,165,250,.1);  color: #60a5fa; border: 1px solid rgba(96,165,250,.2); }
        .section-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: .72rem; letter-spacing: .18em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 1rem;
          display: flex; align-items: center; gap: .5rem;
        }
        .section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }
      `}</style>

      {/* endpoint header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .65, ease: [0.22, 1, 0.36, 1] }}
        style={{
          marginBottom: '2.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '2rem',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* orb */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,100,58,.12), transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.9rem', flexWrap: 'wrap' }}>
          <span className={`method-${ep.method.toLowerCase()}`} style={{
            fontSize: '.63rem', fontFamily: "'DM Mono', monospace",
            fontWeight: 700, padding: '.28rem .6rem', letterSpacing: '.08em',
          }}>
            {ep.method}
          </span>
          <code style={{
            fontSize: 'clamp(.68rem, 2vw, .82rem)',
            fontFamily: "'DM Mono', monospace",
            color: 'var(--accent)', wordBreak: 'break-all',
          }}>
            {ep.path}
          </code>
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
          letterSpacing: '-.04em', lineHeight: 1.05, marginBottom: '.65rem',
        }}>
          {ep.name}
        </h1>
        <p style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.75, maxWidth: 520 }}>
          {ep.desc}
        </p>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show">

        {/* parameters */}
        <motion.section variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
          <div className="section-title">Parameters</div>

          {ep.params.length === 0 ? (
            <div style={{
              padding: '1.2rem', border: '1px solid var(--border)',
              fontSize: '.72rem', color: 'var(--muted)',
              background: 'var(--surface)',
            }}>
              No parameters required.
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border)' }}>
              <div
                className="sm-grid"
                style={{
                  gridTemplateColumns: 'minmax(100px,1fr) 80px 90px 1fr',
                  gap: '.5rem', padding: '.6rem 1rem',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--surface)',
                }}
              >
                {['Name', 'Type', 'Required', 'Description'].map(h => (
                  <div key={h} style={{ fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</div>
                ))}
              </div>

              {ep.params.map((p, i) => (
                <motion.div
                  key={p.name}
                  className="param-row"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * .06, duration: .4 }}
                >
                  <code style={{ fontFamily: "'DM Mono', monospace", color: 'var(--accent)', fontSize: '.7rem', wordBreak: 'break-all' }}>
                    {p.name}
                  </code>
                  <span style={{ color: 'var(--muted)', fontSize: '.67rem' }}>{p.type}</span>
                  <span style={{
                    fontSize: '.58rem', padding: '.2rem .45rem',
                    background: p.required ? 'rgba(239,68,68,.1)' : 'rgba(107,104,117,.1)',
                    color:      p.required ? '#f87171' : 'var(--muted)',
                    border:     `1px solid ${p.required ? 'rgba(239,68,68,.2)' : 'var(--border)'}`,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    alignSelf: 'flex-start',
                  }}>
                    {p.required ? 'required' : 'optional'}
                  </span>
                  <span className="param-desc" style={{ color: 'var(--muted)', fontSize: '.7rem', lineHeight: 1.6 }}>{p.description}</span>
                  <span className="param-desc-mobile">{p.description}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* example request */}
        <motion.section variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
          <div className="section-title">Example Request</div>
          <div style={{
            border: '1px solid var(--border)', background: 'var(--surface)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '.5rem .75rem', borderBottom: '1px solid var(--border)', gap: '.5rem',
            }}>
              <span style={{ fontSize: '.58rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                curl
              </span>
              <CopyButton text={exampleUrl} />
            </div>
            <div style={{ padding: '1rem', overflowX: 'auto' }}>
              <code style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 'clamp(.63rem, 2vw, .72rem)',
                color: 'var(--muted)', whiteSpace: 'pre', display: 'block',
              }}>
                <span style={{ color: 'var(--accent)', opacity: .7 }}>$</span>{' '}
                <span style={{ color: '#60a5fa' }}>curl</span>{' '}
                <span style={{ color: 'var(--text)' }}>&quot;{exampleUrl}&quot;</span>
              </code>
            </div>
          </div>
        </motion.section>

        {/* try it */}
        <motion.section variants={fadeUp}>
          <div className="section-title">Try It</div>
          <PlaygroundInline endpoint={ep} apiBase={apiBase} />
        </motion.section>

      </motion.div>
    </>
  )
}

