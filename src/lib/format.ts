/** 개봉 시각 문구. "10월 31일 밤 8시" 처럼 사람이 말하는 형태로. */
export function formatOpenAt(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const month = d.getMonth() + 1
  const day = d.getDate()
  const h = d.getHours()
  const m = d.getMinutes()
  const part = h < 6 ? '새벽' : h < 12 ? '아침' : h < 18 ? '낮' : '밤'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const minute = m === 0 ? '' : ` ${m}분`
  return `${month}월 ${day}일 ${part} ${hour12}시${minute}`
}

export function daysUntil(iso: string | null, now: string): number | null {
  if (!iso) return null
  const target = new Date(iso)
  const base = new Date(now)
  const ms = target.getTime() - base.getTime()
  return Math.ceil(ms / 86_400_000)
}

export function possessive(name: string) {
  return `${name}의 사탕바구니`
}
