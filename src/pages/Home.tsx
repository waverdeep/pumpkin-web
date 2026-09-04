import { motion } from 'motion/react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { Pumpkin } from '../components/Pumpkin'
import { softSpring } from '../lib/motion'

const NAME_MAX = 12

export default function Home() {
  const nav = useNavigate()
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
        else setChecked(true)
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
      else setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (!checked) return <main className="screen" />

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
    </main>
  )
}
