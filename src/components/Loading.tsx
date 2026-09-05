import { motion } from 'motion/react'
import { Pumpkin } from './Pumpkin'

/** 데이터가 오기 전. 빈 화면 대신 호박 실루엣이 옅게 숨쉰다. */
export function Loading() {
  return (
    <main className="screen" aria-busy="true">
      <div className="screen-body screen-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.18, 0.32, 0.18] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Pumpkin shells={[]} width={160} style={{ margin: '0 auto' }} />
        </motion.div>
      </div>
    </main>
  )
}
