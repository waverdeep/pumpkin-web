import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, shareUrl, type BasketPublic } from '../api/client'
import { Pumpkin } from '../components/Pumpkin'
import { useToast } from '../components/Toast'
import { daysUntil, formatOpenAt, possessive } from '../lib/format'
import { softSpring } from '../lib/motion'
import { shareLink } from '../lib/share'

const POLL_MS = 8000

/** 대기 화면. 자랑하고 링크 뿌리기. 사탕은 더미로 보여준다. */
export default function Mine() {
  const nav = useNavigate()
  const loc = useLocation()
  const toast = useToast()
  const [b, setB] = useState<BasketPublic | null>(null)
  const [lit, setLit] = useState(false)
  const [animateFrom, setAnimateFrom] = useState(Infinity)
  const litTimer = useRef<number | undefined>(undefined)
  const fresh = Boolean((loc.state as { fresh?: boolean } | null)?.fresh)

  const refresh = useCallback(async () => {
    try {
      const r = await api.me()
      if (!r.basket) return nav('/', { replace: true })
      setB((prev) => {
        if (prev && r.basket && r.basket.count > prev.count) {
          setAnimateFrom(prev.count)
          setLit(true)
          window.clearTimeout(litTimer.current)
          litTimer.current = window.setTimeout(() => setLit(false), 2800 + (r.basket.count - prev.count) * 120)
        }
        return r.basket
      })
    } catch {
      /* 잠깐 끊긴 것. 다음 폴링에서 다시 */
    }
  }, [nav])

  useEffect(() => {
    refresh()
    const id = window.setInterval(() => document.visibilityState === 'visible' && refresh(), POLL_MS)
    const onVis = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('focus', onVis)
      window.clearTimeout(litTimer.current)
    }
  }, [refresh])

  if (!b) return <main className="screen" />

  const url = shareUrl(b.slug)
  const openText = formatOpenAt(b.open_at)
  const dday = daysUntil(b.open_at, b.server_time)

  async function share() {
    const r = await shareLink(url, possessive(b!.name))
    if (r === 'copied') toast('링크를 복사했어')
    else if (r === 'failed') toast('아래 주소를 길게 눌러 복사해')
  }

  return (
    <main className="screen">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="center" style={{ paddingTop: 6 }}>
        <h1>{possessive(b.name)}</h1>
      </motion.header>

      <motion.div
        initial={fresh ? { opacity: 0, scale: 0.85, y: 20 } : false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={softSpring}
      >
        <Pumpkin shells={b.shells} lit={lit} animateFrom={animateFrom} placeholder width="min(100%, 300px)" style={{ margin: '0 auto' }} />
      </motion.div>

      <div className="center" style={{ minHeight: 92 }}>
        <AnimatePresence mode="wait" initial={false}>
          {b.count === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 style={{ fontSize: 21 }}>아직 비어 있어</h2>
              <p className="lead" style={{ marginTop: 4 }}>
                링크를 뿌려두면
                <br />
                누군가 사탕을 넣고 갈 거야
              </p>
            </motion.div>
          ) : (
            <motion.div key="count" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <motion.p className="num" key={b.count} initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={softSpring} style={{ margin: 0 }}>
                {b.count}
              </motion.p>
              <p className="lead" style={{ marginTop: 6 }}>
                개의 사탕이 담겼어
                <br />
                <span className="muted">누가 넣었는지, 뭐가 들었는지는 열어봐야 알 수 있어</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="stack">
        <button className="btn" onClick={share}>
          링크 뿌리기
        </button>
        <div className="well" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--lav)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, userSelect: 'all' }}>
            {url}
          </span>
          <button
            className="btn link"
            style={{ width: 'auto', padding: '4px 6px', flex: 'none' }}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url)
                toast('링크를 복사했어')
              } catch {
                toast('주소를 길게 눌러 복사해')
              }
            }}
          >
            복사
          </button>
        </div>
      </div>

      <div className="grow" />

      <div className="center stack">
        {b.is_open ? (
          <>
            <p className="muted">{openText ? `${openText}이 지나서 열 수 있어` : '지금 열 수 있어'}</p>
            {b.count > 0 ? (
              <Link to="/me/open" className="btn ghost" style={{ display: 'block', textAlign: 'center' }}>
                열어보기
              </Link>
            ) : (
              <button className="btn ghost" disabled>
                아직 열 게 없어
              </button>
            )}
          </>
        ) : (
          <p className="muted">
            {openText}에 열려
            {dday !== null && dday > 0 && <> · D-{dday}</>}
          </p>
        )}
      </div>
    </main>
  )
}
