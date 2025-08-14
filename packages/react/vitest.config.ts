import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const isCI = process.env.CI === 'true';
const isCov = process.argv.includes('--coverage');

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/tests/setupTests.ts'],
    globals: true,
    isolate: true,
    sequence: { concurrent: false },
    testTimeout: (isCI || isCov) ? 15000 : 5000,
    hookTimeout: (isCI || isCov) ? 15000 : 5000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      all: true,
      exclude: ['**/dist/**','**/node_modules/**','**/*.d.ts','**/vite.config.*','**/vitest.config.*']
    }
  }
});
