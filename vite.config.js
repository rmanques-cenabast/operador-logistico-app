import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/operador-logistico-app/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/operador-logistico-api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/operador-logistico-api/, ''),
        changeOrigin: true
      }
    }
  }
})
