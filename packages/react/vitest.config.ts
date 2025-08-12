import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: path.resolve(__dirname, 'src/tests/setup.ts'),
  },
  resolve: {
    alias: {
      '@smartqr/core': path.resolve(__dirname, '../core/src/index.ts'),
    },
  },
})
