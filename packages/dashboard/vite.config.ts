import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

const proxyTarget = process.env.BARTOOLS_API_PROXY_TARGET?.trim()

export default defineConfig({
  plugins: react(),
  resolve: {
    alias: {
      '@bartools/types': fileURLToPath(
        new URL('../types/src/index.ts', import.meta.url),
      ),
    },
  },
  server: proxyTarget
    ? {
        proxy: {
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/u, ''),
          },
        },
      }
    : undefined,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
