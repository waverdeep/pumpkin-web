import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// /api/* 는 개발 중 FastAPI로 프록시. 배포 시에는 Workers가 같은 역할을 해서 CORS가 없다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: false },
    },
  },
})
