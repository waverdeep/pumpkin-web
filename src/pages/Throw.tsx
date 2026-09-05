import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError, type BasketPublic, type CandyKind, type CurseCard } from '../api/client'
import { SHELL_COUNT } from '../assets/CandyDefs'
import { Candy } from '../components/Candy'
import { Loading } from '../components/Loading'
import { Pumpkin } from '../components/Pumpkin'
import { formatOpenAt, possessive } from '../lib/format'
import { softSpring } from '../lib/motion'
import NotFound from './NotFound'

const LETTER_MAX = 200
const SENDER_MAX = 12
const CURSE_HAND = 5
const SHELLS = Array.from({ length: SHELL_COUNT }, (_, i) => i)

/** 씨앗으로 섞어서 앞의 몇 장만 손에 쥔다. "다른 저주 뽑기"는 씨앗만 바꾼다. */
function hand(cards: CurseCard[], seed: number): CurseCard[] {
  if (cards.length <= CURSE_HAND) return cards
  let s = seed * 2654435761 + 1
  const rnd = () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 10000) / 10000
  }
  const a = [...cards]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, CURSE_HAND)
}

/** 사탕 넣는 화면. 신규 유저가 이 서비스를 처음 만나는 지점. 로그인 없음. */
export default function Throw() {
  const { slug = '' } = useParams()
  const [b, setB] = useState<BasketPublic | null>(null)
  const [curses, setCurses] = useState<CurseCard[]>([])
  const [missing, setMissing] = useState(false)

  const [shell, setShell] = useState<number | null>(null)
  const [kind, setKind] = useState<CandyKind>('letter')
  const [content, setContent] = useState('')
  const [curseId, setCurseId] = useState<number | null>(null)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e6))
  const [sender, setSender] = useState('')
  const [senderOpen, setSenderOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState<{ index: number } | null>(null)
  const [lit, setLit] = useState(false)
  const chipsRef = useRef<HTMLDivElement>(null)

  async function load() {
    try {
      const [basket, cards] = await Promise.all([api.basket(slug), api.curses(slug)])
      setB(basket)
      setCurses(cards)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setMissing(true)
    }
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const shown = useMemo(() => hand(curses, seed), [curses, seed])

  const valid = useMemo(() => {
    if (shell === null) return false
    if (kind === 'letter') return content.trim().length > 0
    if (kind === 'curse') return curseId !== null
    return true
  }, [shell, kind, content, curseId])

  function pickShell(s: number) {
    setShell(s)
    chipsRef.current?.children[s]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }

  async function submit() {
    if (!b || shell === null || !valid) return
    setBusy(true)
    setErr('')
    try {
      const index = b.shells.length
      const r = await api.throw(slug, {
        shell,
        kind,
        content: kind === 'letter' ? content.trim() : undefined,
        curse_id: kind === 'curse' ? curseId! : undefined,
        sender: sender.trim() || undefined,
      })
      // 떠 있던 사탕이 사라지고 같은 자리에서 떨어진다
      setShell(null)
      setB({ ...b, count: r.count, shells: [...b.shells, r.shell] })
      setDone({ index })
      setLit(true)
      window.setTimeout(() => setLit(false), 3200)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      const msg = (e as Error).message
      setErr(msg)
      if (e instanceof ApiError && e.status === 409) {
        setCurseId(null)
        api.curses(slug).then(setCurses)
      }
    } finally {
      setBusy(false)
    }
  }

  // 보낸이는 유지한다. 하나 더 넣을 때 다시 적게 하지 않는다
  function reset() {
    setDone(null)
    setLit(false)
    setContent('')
    setCurseId(null)
    setErr('')
    api.curses(slug).then(setCurses)
  }

  if (missing) return <NotFound />
  if (!b) return <Loading />

  const openText = formatOpenAt(b.open_at)

  return (
    <main className="screen">
      <div className={`screen-body ${done ? 'screen-center' : ''}`}>
        <motion.header layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={softSpring} className="center">
          <Pumpkin
            shells={b.shells}
            preview={done ? null : shell}
            lit={lit}
            animateFrom={done ? done.index : Infinity}
            width="min(100%, 210px)"
            style={{ margin: '0 auto' }}
          />
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ ...softSpring, delay: 0.5 }}>
                <h1>{b.name}의 바구니에 담겼어</h1>
                <p className="lead mt4">{openText ? `${openText}에 열려. 그때까진 아무도 몰라` : '열어보기 전까진 아무도 몰라'}</p>
              </motion.div>
            ) : (
              <motion.div key="head" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                <h1>{possessive(b.name)}</h1>
                <p className="lead mt4">
                  {b.count === 0 ? '아직 비어 있어. 첫 사탕을 넣어봐' : `사탕 ${b.count}개가 담겨 있어`}
                  {openText && <span className="muted"> · {openText}에 열려</span>}
                </p>
                {b.is_owner && (
                  <p className="muted mt4">
                    이건 내 바구니야 ·{' '}
                    <Link to="/me" style={{ color: 'var(--lav)', textDecoration: 'underline' }}>
                      바구니 보기
                    </Link>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {!done && (
          <motion.div className="v16" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.08 }}>
            <section>
              <p className="label">{shell === null ? '사탕을 골라' : '이 사탕으로 넣을게'}</p>
              <div className="chips" ref={chipsRef} role="radiogroup" aria-label="사탕 고르기">
                {SHELLS.map((s) => (
                  <motion.button
                    key={s}
                    role="radio"
                    aria-checked={shell === s}
                    className={`slot chip ${shell === s ? 'sel' : ''}`}
                    onClick={() => pickShell(s)}
                    whileTap={{ scale: 0.93 }}
                  >
                    <motion.span animate={{ scale: shell === s ? 1.1 : 1, rotate: shell === s ? -6 : 0 }} transition={softSpring} style={{ display: 'block' }}>
                      <Candy shell={s} size={40} />
                    </motion.span>
                  </motion.button>
                ))}
              </div>
            </section>

            <section>
              <div className="seg" role="tablist" aria-label="안에 넣을 것">
                {(['letter', 'curse', 'plain'] as const).map((k) => (
                  <button key={k} role="tab" aria-selected={kind === k} className={kind === k ? 'on' : ''} onClick={() => { setKind(k); setErr('') }}>
                    {k === 'letter' ? '편지' : k === 'curse' ? '저주' : '그냥'}
                  </button>
                ))}
              </div>

              <div className="mt12">
                <AnimatePresence mode="wait" initial={false}>
                  {kind === 'letter' && (
                    <motion.div key="letter" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                      <textarea
                        className="textarea"
                        placeholder="올해도 고생 많았어. 사탕 하나 두고 간다."
                        value={content}
                        maxLength={LETTER_MAX}
                        aria-label="편지"
                        onChange={(e) => {
                          setContent(e.target.value)
                          if (err) setErr('')
                        }}
                      />
                      <div className="row mt4" style={{ justifyContent: 'space-between' }}>
                        <p className="muted">열어보는 사람만 읽어</p>
                        <p className="muted">
                          {content.length}/{LETTER_MAX}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {kind === 'curse' && (
                    <motion.div key="curse" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                      {curses.length === 0 ? (
                        <div className="well center" style={{ padding: '22px 14px' }}>
                          <p style={{ margin: 0 }}>이 바구니엔 저주가 다 걸렸어</p>
                          <p className="muted mt4">편지를 남겨봐</p>
                        </div>
                      ) : (
                        <div className="v8">
                          <div className="curse-list">
                            <AnimatePresence initial={false} mode="popLayout">
                              {shown.map((c) => (
                                <motion.button
                                  key={c.id}
                                  layout
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.96 }}
                                  transition={{ duration: 0.18 }}
                                  className={`curse-card ${curseId === c.id ? 'sel' : ''}`}
                                  onClick={() => setCurseId(c.id)}
                                  aria-pressed={curseId === c.id}
                                >
                                  <span>{c.text}</span>
                                  <span className="dur">{c.duration}</span>
                                </motion.button>
                              ))}
                            </AnimatePresence>
                          </div>
                          {curses.length > CURSE_HAND && (
                            <button className="btn link" onClick={() => { setSeed((s) => s + 1); setCurseId(null) }}>
                              다른 저주 뽑기
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                  {kind === 'plain' && (
                    <motion.div key="plain" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                      <div className="well center" style={{ padding: '22px 14px' }}>
                        <p style={{ margin: 0, color: 'var(--plain-t)' }}>아무 말 없이 사탕만 두고 가</p>
                        <p className="muted mt4">그것도 하나의 표현이야</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            <section>
              {senderOpen || sender ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                  <label className="label" htmlFor="sender">
                    보낸 사람 <span style={{ color: 'var(--dim)' }}>· 안 적어도 돼</span>
                  </label>
                  <input
                    id="sender"
                    className="input"
                    placeholder="익명"
                    value={sender}
                    maxLength={SENDER_MAX}
                    autoComplete="off"
                    autoFocus={!sender}
                    onChange={(e) => setSender(e.target.value)}
                  />
                  <p className="muted mt4">열어볼 때만 보여</p>
                </motion.div>
              ) : (
                <button className="btn link" style={{ justifyContent: 'flex-start', padding: 0 }} onClick={() => setSenderOpen(true)}>
                  + 이름 남기기 <span style={{ color: 'var(--dim)' }}>(선택)</span>
                </button>
              )}
            </section>
          </motion.div>
        )}
      </div>

      <div className="bar">
        {done ? (
          <motion.div className="stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            <Link to="/" className="btn">
              나도 바구니 만들기
            </Link>
            <button className="btn ghost" onClick={reset}>
              하나 더 넣기
            </button>
          </motion.div>
        ) : (
          <>
            <p className="err center">{err}</p>
            <button className="btn" onClick={submit} disabled={!valid || busy}>
              {shell === null ? '사탕을 먼저 골라' : kind === 'letter' && !content.trim() ? '편지를 적어줘' : kind === 'curse' && curseId === null ? '저주를 골라' : '바구니에 넣기'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
