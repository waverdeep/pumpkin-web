import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError, type BasketPublic, type CandyKind, type CurseCard } from '../api/client'
import { SHELL_COUNT } from '../assets/CandyDefs'
import { Candy } from '../components/Candy'
import { Pumpkin } from '../components/Pumpkin'
import { formatOpenAt, possessive } from '../lib/format'
import { softSpring } from '../lib/motion'
import NotFound from './NotFound'

const LETTER_MAX = 200
const SENDER_MAX = 12
const SHELLS = Array.from({ length: SHELL_COUNT }, (_, i) => i)

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
  const [sender, setSender] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState<{ prevCount: number } | null>(null)
  const [lit, setLit] = useState(false)

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

  const valid = useMemo(() => {
    if (shell === null) return false
    if (kind === 'letter') return content.trim().length > 0
    if (kind === 'curse') return curseId !== null
    return true
  }, [shell, kind, content, curseId])

  async function submit() {
    if (!b || shell === null || !valid) return
    setBusy(true)
    setErr('')
    try {
      const prevCount = b.count
      const r = await api.throw(slug, {
        shell,
        kind,
        content: kind === 'letter' ? content.trim() : undefined,
        curse_id: kind === 'curse' ? curseId! : undefined,
        sender: sender.trim() || undefined,
      })
      setB({ ...b, count: r.count, shells: [...b.shells, r.shell] })
      setDone({ prevCount })
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

  function reset() {
    setDone(null)
    setShell(null)
    setContent('')
    setCurseId(null)
    setErr('')
    api.curses(slug).then(setCurses)
  }  // 보낸이는 유지한다. 하나 더 넣을 때 다시 적게 하지 않는다

  if (missing) return <NotFound />
  if (!b) return <main className="screen" />

  const openText = formatOpenAt(b.open_at)

  if (done) {
    return (
      <main className="screen screen-center center">
        <Pumpkin shells={b.shells} lit={lit} animateFrom={Math.min(done.prevCount, b.shells.length - 1)} width="min(100%, 300px)" style={{ margin: '0 auto' }} />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.7 }}>
          <h1>{b.name}의 바구니에 담겼어</h1>
          <p className="lead" style={{ marginTop: 6 }}>
            {openText ? `${openText}에 열려. 그때까진 아무도 몰라` : '열어보기 전까진 아무도 몰라'}
          </p>
        </motion.div>
        <motion.div className="stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
          <Link to="/" className="btn" style={{ display: 'block', textAlign: 'center' }}>
            나도 바구니 만들기
          </Link>
          <button className="btn ghost" onClick={reset}>
            하나 더 넣기
          </button>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="screen">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={softSpring} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Pumpkin shells={b.shells} width={104} style={{ flex: 'none' }} />
        <div>
          <h1>{possessive(b.name)}</h1>
          <p className="lead" style={{ marginTop: 2, fontSize: 13.5 }}>
            {b.count === 0 ? '아직 비어 있어. 첫 사탕을 넣어봐' : `사탕 ${b.count}개가 담겨 있어`}
          </p>
          {b.is_owner && (
            <p className="muted" style={{ marginTop: 2 }}>
              이건 내 바구니야 · <Link to="/me" style={{ color: 'var(--lav)' }}>바구니 보기</Link>
            </p>
          )}
        </div>
      </motion.header>

      <section>
        <p className="label">1 · 사탕을 골라</p>
        <div className="g4">
          {SHELLS.map((s) => (
            <motion.button
              key={s}
              className={`slot ${shell === s ? 'sel' : ''}`}
              onClick={() => setShell(s)}
              whileTap={{ scale: 0.93 }}
              aria-pressed={shell === s}
            >
              <motion.span animate={{ scale: shell === s ? 1.12 : 1, rotate: shell === s ? -6 : 0 }} transition={softSpring} style={{ display: 'block' }}>
                <Candy shell={s} size={40} />
              </motion.span>
            </motion.button>
          ))}
        </div>
      </section>

      <section>
        <p className="label">2 · 안에 뭘 넣을까</p>
        <div className="seg" role="tablist">
          {(['letter', 'curse', 'plain'] as const).map((k) => (
            <button key={k} role="tab" aria-selected={kind === k} className={kind === k ? 'on' : ''} onClick={() => { setKind(k); setErr('') }}>
              {k === 'letter' ? '편지' : k === 'curse' ? '저주' : '그냥'}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          <AnimatePresence mode="wait" initial={false}>
            {kind === 'letter' && (
              <motion.div key="letter" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                <textarea
                  className="textarea"
                  placeholder="올해도 고생 많았어. 사탕 하나 두고 간다."
                  value={content}
                  maxLength={LETTER_MAX}
                  onChange={(e) => {
                    setContent(e.target.value)
                    if (err) setErr('')
                  }}
                />
                <p className="muted" style={{ textAlign: 'right', marginTop: 4 }}>
                  {content.length}/{LETTER_MAX}
                </p>
                <p className="muted">열어보는 사람만 읽어.</p>
              </motion.div>
            )}
            {kind === 'curse' && (
              <motion.div key="curse" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                {curses.length === 0 ? (
                  <p className="muted">이 바구니엔 저주가 다 걸렸어. 편지를 남겨봐.</p>
                ) : (
                  <div className="curse-list">
                    {curses.map((c) => (
                      <button key={c.id} className={`curse-card ${curseId === c.id ? 'sel' : ''}`} onClick={() => setCurseId(c.id)} aria-pressed={curseId === c.id}>
                        <span>{c.text}</span>
                        <span className="dur">{c.duration}</span>
                      </button>
                    ))}
                  </div>
                )}
                <p className="muted" style={{ marginTop: 8 }}>한 바구니에 같은 저주는 한 번만 걸 수 있어.</p>
              </motion.div>
            )}
            {kind === 'plain' && (
              <motion.div key="plain" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                <div className="well" style={{ textAlign: 'center', padding: '22px 14px' }}>
                  <p style={{ margin: 0, color: 'var(--plain-t)' }}>아무 말 없이 사탕만 두고 가</p>
                  <p className="muted" style={{ marginTop: 4 }}>그것도 하나의 표현이야</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section>
        <p className="label">3 · 보낸 사람 <span style={{ color: 'var(--dim)' }}>· 안 적어도 돼</span></p>
        <input
          className="input"
          placeholder="익명"
          value={sender}
          maxLength={SENDER_MAX}
          autoComplete="off"
          onChange={(e) => setSender(e.target.value)}
        />
        <p className="muted" style={{ marginTop: 6 }}>
          {sender.trim() ? `"${sender.trim()}"이 보낸 걸로 남아. 열어볼 때만 보여.` : '비워두면 익명으로 남아.'}
        </p>
      </section>

      <div className="grow" />

      <div>
        <p className="err">{err}</p>
        <button className="btn" onClick={submit} disabled={!valid || busy}>
          {shell === null ? '사탕을 먼저 골라' : '바구니에 넣기'}
        </button>
        <p className="muted center" style={{ marginTop: 10 }}>
          {openText ? `${openText}에 열려` : '로그인 없이 넣을 수 있어'}
        </p>
      </div>
    </main>
  )
}
