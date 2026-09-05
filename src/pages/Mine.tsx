import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, shareUrl, type BasketPublic } from '../api/client'
import { Loading } from '../components/Loading'
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
  const [provider, setProvider] = useState<'anon' | 'google' | null>(null)
  const [lit, setLit] = useState(false)
  const [animateFrom, setAnimateFrom] = useState(Infinity)
  const [showUrl, setShowUrl] = useState(false)
  const litTimer = useRef<number | undefined>(undefined)
  const fresh = Boolean((loc.state as { fresh?: boolean } | null)?.fresh)

  const refresh = useCallback(async () => {
    try {
      const r = await api.me()
      if (!r.basket) return nav('/', { replace: true })
      setProvider(r.user?.provider ?? null)
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

  if (!b) return <Loading />

  const url = shareUrl(b.slug)
  const openText = formatOpenAt(b.open_at)
  const dday = daysUntil(b.open_at, b.server_time)
  const canOpen = b.is_open && b.count > 0

  async function share() {
    const r = await shareLink(url, possessive(b!.name))
    if (r === 'copied') toast('링크를 복사했어')
    else if (r === 'failed') {
      setShowUrl(true)
      toast('아래 주소를 길게 눌러 복사해')
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      toast('링크를 복사했어')
    } catch {
      setShowUrl(true)
      toast('아래 주소를 길게 눌러 복사해')
    }
  }

  return (
    <main className="screen">
      {provider === 'google' && (
        <button
          className="btn link small corner"
          onClick={async () => {
            await api.logout()
            nav('/', { replace: true })
          }}
        >
          로그아웃
        </button>
      )}

      <div className="screen-body">
        <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="center v8" style={{ paddingTop: 4 }}>
          <h1>{possessive(b.name)}</h1>
          <div>
            {b.is_open ? (
              <span className="pill on">{openText ? `${openText}이 지났어 · 지금 열 수 있어` : '지금 열 수 있어'}</span>
            ) : (
              <span className="pill">
                {openText}에 열려{dday !== null && dday > 0 && ` · D-${dday}`}
              </span>
            )}
          </div>
        </motion.header>

        <motion.div
          initial={fresh ? { opacity: 0, scale: 0.85, y: 20 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={softSpring}
        >
          <Pumpkin shells={b.shells} lit={lit} animateFrom={animateFrom} placeholder width="min(100%, 290px)" style={{ margin: '0 auto' }} />
        </motion.div>

        <div className="center" style={{ minHeight: 76 }}>
          <AnimatePresence mode="wait" initial={false}>
            {b.count === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2>아직 비어 있어</h2>
                <p className="lead mt4">링크를 뿌려두면 누군가 사탕을 넣고 갈 거야</p>
              </motion.div>
            ) : (
              <motion.div key="count" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: 21 }}>
                  사탕{' '}
                  <motion.span className="num" key={b.count} initial={{ scale: 1.5, display: 'inline-block' }} animate={{ scale: 1 }} transition={softSpring} style={{ display: 'inline-block', fontSize: 30, lineHeight: 1 }}>
                    {b.count}
                  </motion.span>
                  개가 담겼어
                </h2>
                <p className="muted mt4">누가 넣었는지, 뭐가 들었는지는 열어봐야 알 수 있어</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bar">
        {showUrl && (
          <div className="well" style={{ fontSize: 13, color: 'var(--lav)', userSelect: 'all', wordBreak: 'break-all', textAlign: 'center' }}>
            {url}
          </div>
        )}
        {canOpen ? (
          <>
            <Link to="/me/open" className="btn">
              열어보기
            </Link>
            <button className="btn ghost" onClick={share}>
              링크 뿌리기
            </button>
          </>
        ) : (
          <>
            <button className="btn" onClick={share}>
              링크 뿌리기
            </button>
            <button className="btn link" onClick={copy}>
              링크만 복사하기
            </button>
          </>
        )}
      </div>
    </main>
  )
}
