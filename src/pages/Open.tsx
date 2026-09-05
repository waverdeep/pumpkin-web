import { AnimatePresence, animate, motion } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError, type CandyOut, type OpenResponse } from '../api/client'
import { Candy, Unknown } from '../components/Candy'
import { CandyReveal } from '../components/CandyReveal'
import { Loading } from '../components/Loading'
import { Pumpkin } from '../components/Pumpkin'
import { formatOpenAt, possessive } from '../lib/format'
import { softSpring, useReducedMotion } from '../lib/motion'

type Phase = 'intro' | 'spill' | 'grid'

function openedKey(slug: string) {
  return `pk_opened_${slug}`
}
function introKey(slug: string) {
  return `pk_intro_${slug}`
}
function loadSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]'))
  } catch {
    return new Set()
  }
}

/** 개봉 화면. 진행 상황을 그리드로 읽는다. 순서는 강제하지 않는다. 다 깐 뒤에는 편지 보관함이 된다. */
export default function Open() {
  const nav = useNavigate()
  const reduced = useReducedMotion()
  const [data, setData] = useState<OpenResponse | null>(null)
  const [locked, setLocked] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [opened, setOpened] = useState<Set<string>>(new Set())
  const [settled, setSettled] = useState(false)
  const [current, setCurrent] = useState<CandyOut | null>(null)
  const miniRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const me = await api.me()
        if (!me.basket) return nav('/', { replace: true })
        const r = await api.open(me.basket.slug)
        if (!alive) return
        setData(r)
        setOpened(loadSet(openedKey(r.slug)))
        if (localStorage.getItem(introKey(r.slug))) {
          setPhase('grid')
          setSettled(true)
        }
      } catch (e) {
        if (!alive) return
        if (e instanceof ApiError && e.status === 423) {
          const at = (e.data as { open_at?: string } | null)?.open_at ?? null
          setLocked(formatOpenAt(at) ?? '개봉일')
        } else setError((e as Error).message)
      }
    })()
    return () => {
      alive = false
    }
  }, [nav])

  // 시트가 열려 있는 동안 뒤 화면은 스크롤하지 않는다
  useEffect(() => {
    document.body.style.overflow = current ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [current])

  const markOpened = useCallback(
    (id: string) => {
      if (!data) return
      setOpened((prev) => {
        const next = new Set(prev)
        next.add(id)
        localStorage.setItem(openedKey(data.slug), JSON.stringify([...next]))
        return next
      })
    },
    [data],
  )

  function startSpill() {
    if (!data) return
    localStorage.setItem(introKey(data.slug), '1')
    setPhase('spill')
    window.setTimeout(() => setPhase('grid'), reduced ? 0 : 650)
  }

  // 그리드가 처음 그려질 때, 사탕이 위쪽 작은 호박에서 날아와 각 칸에 앉는다
  useLayoutEffect(() => {
    if (phase !== 'grid' || settled || !gridRef.current) return
    const cells = Array.from(gridRef.current.querySelectorAll<HTMLElement>('[data-fly]'))
    const m = miniRef.current?.getBoundingClientRect()
    if (!m || reduced) {
      cells.forEach((c) => (c.style.opacity = '1'))
      setSettled(true)
      return
    }
    const origin = { x: m.left + m.width / 2, y: m.top + m.height * 0.4 }
    let last: ReturnType<typeof animate> | undefined
    cells.forEach((el, i) => {
      const r = el.getBoundingClientRect()
      const dx = origin.x - (r.left + r.width / 2)
      const dy = origin.y - (r.top + r.height / 2)
      last = animate(
        el,
        { x: [dx, 0], y: [dy, 0], scale: [0.35, 1], opacity: [0, 1], rotate: [(i % 2 ? 1 : -1) * 40, 0] },
        { type: 'spring', stiffness: 170, damping: 19, delay: Math.min(i * 0.055, 1.4) },
      )
    })
    if (last) last.then(() => window.setTimeout(() => setSettled(true), 500))
    else setSettled(true)
  }, [phase, settled, reduced])

  if (locked) {
    return (
      <main className="screen">
        <div className="screen-body screen-center center">
          <Pumpkin shells={[]} width={200} style={{ margin: '0 auto' }} />
          <div>
            <h1>아직 열 수 없어</h1>
            <p className="lead mt4">{locked}에 열려</p>
          </div>
        </div>
        <div className="bar">
          <Link to="/me" className="btn ghost">
            돌아가기
          </Link>
        </div>
      </main>
    )
  }
  if (error) {
    return (
      <main className="screen">
        <div className="screen-body screen-center center">
          <h1>{error}</h1>
        </div>
        <div className="bar">
          <Link to="/me" className="btn ghost">
            돌아가기
          </Link>
        </div>
      </main>
    )
  }
  if (!data) return <Loading />

  const total = data.candies.length
  const done = data.candies.filter((c) => opened.has(c.id)).length
  const shells = data.candies.map((c) => c.shell)
  const allDone = done === total
  const firstUnopened = data.candies.find((c) => !opened.has(c.id))?.id ?? null

  /** 지금 것 다음으로 안 깐 사탕. 끝에 닿으면 앞에서 다시 찾는다 */
  function nextUnopened(from: CandyOut): CandyOut | null {
    const i = data!.candies.findIndex((c) => c.id === from.id)
    const order = [...data!.candies.slice(i + 1), ...data!.candies.slice(0, i)]
    return order.find((c) => !opened.has(c.id) && c.id !== from.id) ?? null
  }

  if (phase !== 'grid') {
    return (
      <main className="screen">
        <div className="screen-body screen-center center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={softSpring}>
            <h1>{possessive(data.name)}</h1>
            <p className="lead mt4">{total}개의 사탕이 기다리고 있어</p>
          </motion.div>
          <motion.div
            animate={phase === 'spill' && !reduced ? { rotate: [0, -3, 3, -4, 4, -2, 0], scale: [1, 1.04, 1.04, 1.06, 1.06, 1.02, 1] } : {}}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ transformOrigin: '50% 85%' }}
          >
            <Pumpkin shells={phase === 'spill' ? [] : shells} lit width="min(100%, 290px)" style={{ margin: '0 auto' }} />
          </motion.div>
        </div>
        <motion.div className="bar" initial={{ opacity: 0 }} animate={{ opacity: phase === 'intro' ? 1 : 0 }} transition={{ delay: 0.3 }}>
          <button className="btn" onClick={startSpill} disabled={phase !== 'intro'}>
            열기
          </button>
          <p className="muted center">아무거나 눌러서 하나씩 까면 돼</p>
        </motion.div>
      </main>
    )
  }

  const counts = data.candies.reduce(
    (acc, c) => {
      acc[c.kind] += 1
      return acc
    },
    { letter: 0, curse: 0, plain: 0 },
  )

  return (
    <main className="screen">
      <div className="screen-body">
        <header className="center">
          <div ref={miniRef} style={{ width: 120, margin: '0 auto' }}>
            <Pumpkin shells={allDone ? [] : shells.slice(0, Math.max(0, total - done))} lit={allDone} width="100%" />
          </div>
          <h1 className="mt4">{possessive(data.name)}</h1>
          <p className="lead mt4">
            {allDone
              ? `다 깠어 · 편지 ${counts.letter} · 저주 ${counts.curse} · 그냥 ${counts.plain}`
              : `${total}개 중 ${done}개 깠어`}
          </p>
          <div className="progress mt12">
            <i style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
        </header>

        <div className="g3" ref={gridRef}>
          {data.candies.map((c) => {
            const isOpen = opened.has(c.id)
            const pulse = settled && !reduced && c.id === firstUnopened
            return (
              <motion.button
                key={c.id}
                data-fly
                className={`slot ${isOpen ? 'done' : ''}`}
                style={{ opacity: settled ? 1 : 0 }}
                onClick={() => settled && setCurrent(c)}
                aria-label={isOpen ? '깐 사탕 다시 보기' : '안 깐 사탕'}
                whileTap={{ scale: 0.93 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isOpen || !settled ? (
                    <motion.span key="shell" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                      <Candy shell={c.shell} size={48} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="unknown"
                      initial={{ opacity: 0 }}
                      animate={pulse ? { opacity: [0.7, 1, 0.7], scale: [1, 1.12, 1] } : { opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={pulse ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.35 }}
                      style={{ display: 'block' }}
                    >
                      <Unknown size={38} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="bar">
        <Link to="/me" className="btn link">
          바구니로 돌아가기
        </Link>
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            className="overlay bottom"
            onClick={() => setCurrent(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <CandyReveal
              key={current.id}
              candy={current}
              alreadyOpened={opened.has(current.id)}
              hasNext={nextUnopened(current) !== null}
              onRevealed={() => markOpened(current.id)}
              onNext={() => {
                const n = nextUnopened(current)
                if (n) setCurrent(n)
                else setCurrent(null)
              }}
              onClose={() => setCurrent(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
