import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 开发代理：前端请求 /api/xxx 时自动转发到后端 3001
    // 生产环境（EdgeOne）API 前缀是 /express，本地也统一用 /express 保持一致
    // 代理会剥离 /express 前缀转发到后端（与 EdgeOne 行为一致）
    proxy: {
      '/express': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/express/, ''),
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
