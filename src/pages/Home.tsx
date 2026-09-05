import { motion } from 'motion/react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, ApiError, type Me } from '../api/client'
import { isInAppBrowser, startGoogleLogin } from '../lib/login'
import { Pumpkin } from '../components/Pumpkin'
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

  if (!checked) return <main className="screen" />

  // 로그인이 필요한데 아직 안 했으면 이름 대신 로그인 버튼
  const needLogin = Boolean(me?.login_required && !me?.user)

  return (
    <main className="screen screen-center">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={softSpring} className="center">
        <Pumpkin shells={[]} placeholder width={230} style={{ margin: '0 auto 6px' }} />
        <h1 style={{ fontSize: 26 }}>사탕바구니</h1>
        <p className="lead" style={{ marginTop: 6 }}>
          링크를 뿌리면 사람들이 익명으로 사탕을 넣어.
          <br />
          누가 넣었는지, 뭐가 들었는지는 열어봐야 알 수 있어.
        </p>
      </motion.div>

      {needLogin ? (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.1 }} className="stack">
          <button className="btn" onClick={() => startGoogleLogin('/')} disabled={!me?.google_enabled}>
            구글로 시작하기
          </button>
          <p className="muted center">
            {loginResult === 'cancel' && '로그인을 취소했어. '}
            {loginResult === 'state' && '로그인이 중간에 끊겼어. 다시 해봐. '}
            바구니를 만드는 사람만 로그인해. 사탕을 넣는 사람은 그냥 넣으면 돼.
          </p>
          {isInAppBrowser() && <p className="muted center">카톡 안에서는 로그인 창이 바깥 브라우저로 열려.</p>}
        </motion.div>
      ) : (
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.1 }}>
        <p className="label">바구니에 붙일 이름</p>
        <input
          className="input"
          placeholder="감자"
          value={name}
          maxLength={NAME_MAX}
          autoComplete="off"
          onChange={(e) => {
            setName(e.target.value)
            if (err) setErr('')
          }}
        />
        <p className="err">{err || (name.trim() ? `${name.trim()}의 사탕바구니` : ' ')}</p>
        <button className="btn" type="submit" disabled={busy} style={{ marginTop: 4 }}>
          바구니 만들기
        </button>
      </motion.form>
      )}
    </main>
  )
}
