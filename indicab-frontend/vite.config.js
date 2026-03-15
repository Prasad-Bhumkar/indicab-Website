import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    global: 'window',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
  },
  assetsInclude: ['**/*.webp', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
        pathRewrite: {
          '^/api': '/api', // Keep /api prefix in the request path
        },
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/ws': '/ws', // Keep /ws prefix in the request path
        },
      },
    },
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws',
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    middlewareMode: false,
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-ui': ['bootstrap', 'react-icons', 'framer-motion'],
          'vendor-http': ['axios'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
        },
      },
    },
    // Optimize chunk sizes
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true,
    // Asset size limits
    assetsInlineLimit: 4096, // 4KB - inline smaller assets
  },
  // Image optimization settings
  envPrefix: 'VITE_',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  }
})
