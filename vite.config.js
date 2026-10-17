import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Avoids browser CORS errors in dev by proxying same-origin requests to the backend.
    proxy: {
      '/api': {
        target: 'http://localhost:2027',
        changeOrigin: true
      }
    }
  }
})
