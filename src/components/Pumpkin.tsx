import { AnimatePresence, motion, useAnimate } from 'motion/react'
import { useEffect, useRef, type CSSProperties } from 'react'
import { PILE, PILE_MAX } from '../lib/pile'
import { useReducedMotion } from '../lib/motion'

interface Props {
  /** 들어온 순서대로의 껍질 번호 */
  shells: number[]
  /** 얼굴 점등. 새 사탕이 들어올 때, 개봉하는 순간에만 켠다 */
  lit?: boolean
  /** 이 인덱스부터는 입구 위에서 떨어지는 연출을 준다 */
  animateFrom?: number
  /** 빈 바구니 위 점선 자리표시 */
  placeholder?: boolean
  /** 입구 위에 떠서 넣기를 기다리는 사탕 (던지기 화면 미리보기) */
  preview?: number | null
  width?: number | string
  style?: CSSProperties
  className?: string
}

const DROP = { type: 'spring', stiffness: 260, damping: 18, mass: 0.9 } as const
/** 입구 위 대기 위치. 떨어지는 사탕도 여기서 출발한다 */
const HOVER = { x: 130, y: 14 }

/** 호박 통. 얼굴은 기본 상태에 넣지 않는다. */
export function Pumpkin({ shells, lit = false, animateFrom = Infinity, placeholder = false, preview = null, width = '100%', style, className }: Props) {
  const reduced = useReducedMotion()
  const [scope, animate] = useAnimate()
  const prevLen = useRef(shells.length)

  // 사탕이 떨어져 닿을 때 통이 살짝 출렁인다
  useEffect(() => {
    if (shells.length > prevLen.current && !reduced) {
      const t = window.setTimeout(() => {
        animate(scope.current, { scale: [1, 1.035, 0.985, 1] }, { duration: 0.55, ease: 'easeOut' })
      }, 380)
      prevLen.current = shells.length
      return () => window.clearTimeout(t)
    }
    prevLen.current = shells.length
  }, [shells.length, animate, scope, reduced])

  const visible = shells.slice(0, PILE_MAX)
  const overflow = shells.slice(PILE_MAX)
  const showPlaceholder = placeholder && shells.length === 0 && preview === null

  return (
    <motion.div ref={scope} className={className} style={{ width, transformOrigin: '50% 85%', ...style }}>
      <svg viewBox="0 -20 260 232" width="100%" role="img" aria-label={`사탕 ${shells.length}개가 담긴 호박 통`} style={{ display: 'block', overflow: 'visible' }}>
        {/* 켜졌을 때 바깥으로 번지는 빛 */}
        <motion.ellipse
          cx="130" cy="126" rx="150" ry="120" fill="url(#halo)"
          initial={false}
          animate={{ opacity: lit ? 1 : 0 }}
          transition={{ duration: lit ? 0.6 : 1.2 }}
        />

        {showPlaceholder && (
          <motion.g
            opacity={0.3}
            initial={{ y: 0 }}
            animate={reduced ? { y: 0 } : { y: [0, -4, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M104 32 L116 39 L104 46 Z" fill="#7F77DD" />
            <path d="M156 32 L144 39 L156 46 Z" fill="#7F77DD" />
            <ellipse cx="130" cy="39" rx="14" ry="11" fill="none" stroke="#7F77DD" strokeWidth="1.5" strokeDasharray="4 4" />
          </motion.g>
        )}

        <use href="#pkBack" />

        {visible.map((shell, i) => {
          const p = PILE[i]
          const fresh = i >= animateFrom
          return (
            <g key={i} transform={`translate(${p.x} ${p.y})`}>
              <motion.g
                initial={fresh && !reduced ? { x: HOVER.x - p.x, y: HOVER.y - p.y, opacity: 0, rotate: p.r - 30 } : false}
                animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                transition={{ ...DROP, opacity: { duration: 0.12 }, delay: fresh ? (i - animateFrom) * 0.12 : 0 }}
              >
                <use href={`#c${shell}`} transform={`rotate(${p.r}) scale(${p.s}) translate(-30 -30)`} />
              </motion.g>
            </g>
          )
        })}

        {/* 자리가 다 찬 뒤 들어오는 사탕은 입구 위에서 떨어져 더미에 묻힌다 */}
        {overflow.map((shell, j) => {
          const i = PILE_MAX + j
          if (i < animateFrom || reduced) return null
          return (
            <g key={`o${i}`} transform="translate(130 48)">
              <motion.g
                initial={{ y: HOVER.y - 48, opacity: 0 }}
                animate={{ y: [HOVER.y - 48, 0, 4], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.9, times: [0, 0.6, 1], delay: (i - animateFrom) * 0.12 }}
              >
                <use href={`#c${shell}`} transform="scale(0.6) translate(-30 -30)" />
              </motion.g>
            </g>
          )
        })}

        <use href="#pkBody" />
        <use href="#pkLip" />

        {/* 입구 위에 떠서 기다리는 사탕 */}
        <AnimatePresence>
          {preview !== null && (
            <motion.g
              key={preview}
              initial={{ opacity: 0, scale: 0.4, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: reduced ? 0 : [0, -5, 0] }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 320, damping: 18, y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }}
              style={{ transformOrigin: `${HOVER.x}px ${HOVER.y}px` }}
            >
              <ellipse cx="130" cy="82" rx="16" ry="4" fill="#0B0512" opacity=".35" />
              <use href={`#c${preview}`} transform={`translate(${HOVER.x} ${HOVER.y}) rotate(-8) scale(0.82) translate(-30 -30)`} />
            </motion.g>
          )}
        </AnimatePresence>

        {/* 얼굴 — 이벤트 연출용. 도형은 pkFace 한 곳에만 있고 번짐용·선명용으로 두 번 참조한다 */}
        <motion.g
          initial={false}
          animate={lit ? { opacity: reduced ? 1 : [0.7, 1, 0.85, 1] } : { opacity: 0 }}
          transition={lit ? { duration: 2.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } : { duration: 0.5 }}
          style={{ pointerEvents: 'none' }}
        >
          <ellipse cx="130" cy="142" rx="56" ry="40" fill="url(#ig)" />
          <g filter="url(#sf)" opacity=".85" fill="#FFD98A"><use href="#pkFace" /></g>
          <g fill="#FFE9B8"><use href="#pkFace" /></g>
        </motion.g>
      </svg>
    </motion.div>
  )
}
