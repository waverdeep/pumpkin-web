import type { CSSProperties } from 'react'
import { SHELL_NAMES } from '../assets/CandyDefs'

interface Props {
  shell: number
  size?: number
  style?: CSSProperties
  className?: string
}

/** 사탕 하나. viewBox 0 0 60 60 고정. */
export function Candy({ shell, size = 38, style, className }: Props) {
  return (
    <svg
      viewBox="0 0 60 60"
      width={size}
      height={size}
      role="img"
      aria-label={SHELL_NAMES[shell] ?? '사탕'}
      style={{ display: 'block', overflow: 'visible', ...style }}
      className={className}
    >
      <use href={`#c${shell}`} />
    </svg>
  )
}

/** 안 깐 자리. 점선 원이 "아직 모른다"의 유일한 표현이다. */
export function Unknown({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-label="아직 안 깐 사탕" role="img" style={{ display: 'block' }}>
      <circle cx="30" cy="30" r="15" fill="none" stroke="#6B5A85" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  )
}
