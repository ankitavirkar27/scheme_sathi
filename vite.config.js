import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force every page and dependency to use the same React instance.
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/firebase')) return 'firebase-bundle';
          if (id.includes('node_modules/lucide-react')) return 'vendor-lucide';
          if (id.includes('node_modules/react')) return 'vendor-react';
        },
      }
    },
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    reportCompressedSize: false,
    sourcemap: false,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    // Never cache source or HMR modules in development; stale modules can look like a blank app.
    headers: {
      'Cache-Control': 'no-store',
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    }
  },
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
    // Spline is optional and lazy; keeping it out of the dev optimizer prevents a second React runtime.
    exclude: ['@splinetool/react-spline', '@splinetool/runtime'],
  }
})
