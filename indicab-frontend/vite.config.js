
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to repo name for GitHub Pages deployment
export default defineConfig({
  base: '/indicab-Website/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true
    }
  },
  build: {
    sourcemap: false
  }
})
