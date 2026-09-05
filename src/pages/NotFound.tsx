import { Link } from 'react-router-dom'
import { Pumpkin } from '../components/Pumpkin'

export default function NotFound({ message = '그런 바구니는 없어' }: { message?: string }) {
  return (
    <main className="screen">
      <div className="screen-body screen-center center">
        <Pumpkin shells={[]} width={180} style={{ margin: '0 auto', opacity: 0.6 }} />
        <div>
          <h1>{message}</h1>
          <p className="lead mt4">주소를 다시 확인해봐</p>
        </div>
      </div>
      <div className="bar">
        <Link to="/" className="btn ghost">
          내 바구니 만들기
        </Link>
      </div>
    </main>
  )
}
