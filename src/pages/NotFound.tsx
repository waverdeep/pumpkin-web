import { Link } from 'react-router-dom'
import { Pumpkin } from '../components/Pumpkin'

export default function NotFound({ message = '그런 바구니는 없어' }: { message?: string }) {
  return (
    <main className="screen screen-center center">
      <Pumpkin shells={[]} width={180} style={{ margin: '0 auto', opacity: 0.6 }} />
      <h1>{message}</h1>
      <p className="lead">주소를 다시 확인해봐</p>
      <Link to="/" className="btn ghost" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
        내 바구니 만들기
      </Link>
    </main>
  )
}
