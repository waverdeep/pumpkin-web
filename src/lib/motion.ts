import { useEffect, useState } from 'react'

/** 모션을 줄이는 설정을 켠 사용자에게는 호박 깜빡임을 멈춘다. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

export const spring = { type: 'spring', stiffness: 380, damping: 26 } as const
export const softSpring = { type: 'spring', stiffness: 220, damping: 22 } as const
