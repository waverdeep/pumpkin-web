import { motion } from 'motion/react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, ApiError, type Me } from '../api/client'
import { isInAppBrowser, startGoogleLogin } from '../lib/login'
import { Loading } from '../components/Loading'
import { Pumpkin } from '../components/Pumpkin'
import { possessive } from '../lib/format'
import { softSpring } from '../lib/motion'

const NAME_MAX = 12

export default function Home() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const loginResult = params.get('login')
  const [me, setMe] = useState<Me | null>(null)
  const [checked, setChecked] = useState(false)
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    api
      .me()
      .then((r) => {
        if (!alive) return
        if (r.basket) nav('/me', { replace: true })
        else {
          setMe(r)
          setChecked(true)
        }
      })
      .catch(() => alive && setChecked(true))
    return () => {
      alive = false
    }
  }, [nav])

  async function submit(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (!n) return setErr('이름을 정해줘')
    setBusy(true)
    try {
      await api.createBasket(n)
      nav('/me', { replace: true, state: { fresh: true } })
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) nav('/me', { replace: true })
      else if (e instanceof ApiError && e.status === 401) startGoogleLogin('/')
      else setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (!checked) return <Loading />

  // 로그인이 필요한데 아직 안 했으면 이름 대신 로그인 버튼
  const needLogin = Boolean(me?.login_required && !me?.user)
  const typed = name.trim()

  return (
    <main className="screen">
      <div className="screen-body screen-center">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={softSpring} className="center">
          <Pumpkin shells={[]} placeholder width={210} style={{ margin: '0 auto' }} />
          {/* 이름을 치면 제목이 바로 바뀐다 */}
          <h1 style={{ fontSize: 27, marginTop: 4, minHeight: '1.35em' }}>{typed ? possessive(typed) : '사탕바구니'}</h1>
          <p className="lead mt8">
            친구들에게 사탕을 받아봐!
            <br />
            달콤한 편지일까, 짓궂은 저주일까?
          </p>
        </motion.div>
      </div>

      <motion.div className="bar" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.1 }}>
        {needLogin ? (
          <>
            <button className="btn" onClick={() => startGoogleLogin('/')} disabled={!me?.google_enabled}>
              구글로 시작하기
            </button>
            {(loginResult || isInAppBrowser()) && (
              <p className="muted center">
                {loginResult === 'cancel' && '로그인을 취소했어. '}
                {loginResult === 'state' && '로그인이 중간에 끊겼어. 다시 해봐. '}
                {isInAppBrowser() && '카톡 안에서는 로그인 창이 바깥 브라우저로 열려.'}
              </p>
            )}
          </>
        ) : (
          <form onSubmit={submit} className="v8">
            <input
              className="input"
              aria-label="바구니에 붙일 이름"
              placeholder="바구니에 붙일 이름"
              value={name}
              maxLength={NAME_MAX}
              autoComplete="off"
              enterKeyHint="done"
              autoFocus={window.matchMedia('(hover: hover) and (pointer: fine)').matches}
              onChange={(e) => {
                setName(e.target.value)
                if (err) setErr('')
              }}
            />
            <p className="err">{err}</p>
            <button className="btn" type="submit" disabled={busy}>
              바구니 만들기
            </button>
          </form>
        )}
      </motion.div>
    </main>
  )
}
