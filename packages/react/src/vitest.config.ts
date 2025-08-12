import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    reporters: 'verbose',
    include: ['src/**/*.{test,spec}.{ts,tsx}']
  },
  resolve: {
    alias: {
      // Point @smartqr/core to source during tests to avoid requiring built dist
      '@smartqr/core': path.resolve(__dirname, '../core/src/index.ts'),
    },
  },
})
