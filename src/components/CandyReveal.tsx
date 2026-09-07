import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { CandyOut } from '../api/client'
import { Candy } from './Candy'
import { useReducedMotion } from '../lib/motion'

interface Props {
  candy: CandyOut
  /** 이미 깐 사탕이면 바로 내용을 보여준다 */
  alreadyOpened: boolean
  /** 아직 안 깐 사탕이 남아 있으면 "다음 사탕 까기"로 이어 간다 */
  hasNext: boolean
  onRevealed: () => void
  onNext: () => void
  onClose: () => void
}

const KIND = {
  letter: { label: '마니또의 편지', named: '편지', bg: 'var(--letter-bg)', l: 'var(--letter-l)', t: 'var(--letter-t)' },
  curse: { label: '마니또의 저주', named: '저주', bg: 'var(--curse-bg)', l: 'var(--curse-l)', t: 'var(--curse-t)' },
  plain: { label: '말 없는 마니또', named: '사탕', bg: 'var(--plain-bg)', l: 'var(--plain-l)', t: 'var(--plain-t)' },
} as const

const BURST = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2
  return { x: Math.cos(a) * 64, y: Math.sin(a) * 64, d: i * 0.02 }
})

/** 사탕 하나 까기. 하단 시트로 올라오고, 껍질이 흔들리다 터지고, 안에 든 것이 나온다. */
export function CandyReveal({ candy, alreadyOpened, hasNext, onRevealed, onNext, onClose }: Props) {
  const reduced = useReducedMotion()
  const [stage, setStage] = useState<'wrapped' | 'unwrapping' | 'revealed'>(alreadyOpened ? 'revealed' : 'wrapped')
  const k = KIND[candy.kind]

  useEffect(() => {
    if (stage !== 'unwrapping') return
    const t = window.setTimeout(() => setStage('revealed'), reduced ? 50 : 720)
    return () => window.clearTimeout(t)
  }, [stage, reduced])

  useEffect(() => {
    if (stage === 'revealed' && !alreadyOpened) onRevealed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  const revealed = stage === 'revealed'

  return (
    <motion.div
      className="sheet"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
      initial={{ y: '100%' }}
      animate={{ y: 0, background: revealed ? k.bg : 'var(--panel)' }}
      exit={{ y: '100%', transition: { duration: 0.2, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 320, damping: 30, background: { duration: 0.35 } }}
      style={{ minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <div className="sheet-handle" />

      <div style={{ position: 'relative', height: 116, width: 116, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
        <AnimatePresence>
          {stage !== 'revealed' && (
            <motion.button
              key="shell"
              onClick={() => stage === 'wrapped' && setStage('unwrapping')}
              aria-label="사탕 까기"
              style={{ background: 'none', border: 0, padding: 0, cursor: stage === 'wrapped' ? 'pointer' : 'default' }}
              animate={
                stage === 'unwrapping' && !reduced
                  ? { rotate: [0, -10, 10, -12, 12, -6, 0], scale: [1, 1.05, 1.08, 1.12, 1.18, 1.3, 1.5], opacity: [1, 1, 1, 1, 1, 1, 0] }
                  : reduced
                    ? { scale: 1 }
                    : { scale: [1, 1.04, 1], rotate: [0, -2, 2, 0] }
              }
              transition={
                stage === 'unwrapping'
                  ? { duration: 0.7, times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1], ease: 'easeIn' }
                  : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
              }
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
            >
              <Candy shell={candy.shell} size={104} />
            </motion.button>
          )}
        </AnimatePresence>

        {stage === 'unwrapping' && !reduced &&
          BURST.map((b, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              style={{ position: 'absolute', width: 7, height: 7, borderRadius: 4, background: i % 2 ? k.l : 'var(--cream)', left: 54, top: 54 }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
              animate={{ x: b.x, y: b.y, opacity: [0, 1, 0], scale: [0.6, 1, 0.4] }}
              transition={{ duration: 0.55, delay: 0.45 + b.d, ease: 'easeOut' }}
            />
          ))}

        {revealed && (
          <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
            <Candy shell={candy.shell} size={68} />
          </motion.div>
        )}
      </div>

      {stage !== 'revealed' && (
        <motion.p className="lead" style={{ marginTop: 12, minHeight: 88 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          사탕을 눌러서 까봐
        </motion.p>
      )}

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.08 }}
          style={{ width: '100%' }}
        >
          <p className="pop-l" style={{ color: k.l }}>{candy.sender ? k.named : k.label}</p>
          <p className="pop-b" style={{ color: k.t }}>
            {candy.kind === 'letter' && candy.content}
            {candy.kind === 'curse' && candy.curse && (
              <>
                {candy.curse.text}
                <br />
                <span style={{ fontSize: 14, color: k.l }}>({candy.curse.duration})</span>
              </>
            )}
            {candy.kind === 'plain' && (
              <>
                아무 말 없이
                <br />
                사탕만 두고 갔어
              </>
            )}
          </p>
          {candy.sender && (
            <p className="muted" style={{ marginTop: 10, color: k.l, opacity: 0.85 }}>
              — {candy.sender}
            </p>
          )}
          <div className="stack" style={{ marginTop: 20 }}>
            {hasNext ? (
              <button className="btn" onClick={onNext}>
                다음 사탕 까기
              </button>
            ) : (
              <button className="btn ghost" style={{ color: k.t, borderColor: k.l }} onClick={onClose}>
                닫기
              </button>
            )}
            {hasNext && (
              <button className="btn link" style={{ color: k.l }} onClick={onClose}>
                닫기
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
