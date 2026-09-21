import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const alias = {
  '@': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@tiptap')) return 'tiptap';
            if (id.includes('@radix-ui')) return 'ui';
            if (id.includes('@tanstack')) return 'tanstack';
            if (id.includes('react')) return 'react';
          }
        },
      },
    },
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'date-fns',
      'lucide-react',
    ],
  },
  test: {
    environment: 'jsdom',
    resolve: {
      alias,
    },
  },
})
