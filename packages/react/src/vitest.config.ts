import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const isCI = process.env.CI === 'true';
const isCoverage = process.argv.includes('--coverage');

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setupTests.ts'],
    globals: true,

    // Avoid cross-file DOM interference under coverage
    isolate: true,
    sequence: { concurrent: false },

    // Coverage slows things down: relax timeouts only when needed
    testTimeout: (isCI || isCoverage) ? 15000 : 5000,
    hookTimeout: (isCI || isCoverage) ? 15000 : 5000,

    environmentOptions: {
      jsdom: {
        resources: 'usable',
        pretendToBeVisual: true,
      },
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      all: true,
      exclude: [
        '**/dist/**',
        '**/node_modules/**',
        '**/*.d.ts',
        '**/vite.config.*',
        '**/vitest.config.*',
      ],
    },
  },
});
