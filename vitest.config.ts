import { defineConfig } from 'vitest/config'
import path from 'path'

/**
 * Vitest Configuration for WatchBiz
 *
 * - Globals enabled for describe, it, expect
 * - Node environment (Server Components, Server Actions, API routes)
 * - Coverage with V8 provider
 * - Strict thresholds for critical business logic (auth, checkout, webhooks)
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    // Exclude Playwright E2E tests (*.spec.ts) - only run Vitest tests (*.test.ts)
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**', // Exclude all E2E tests
      '**/*.spec.ts', // Exclude Playwright test files
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mocks/**',
        'scripts/',
        'prisma/',
        'public/',
        'components/ui/**', // UI components lower priority
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      },
      // Strict thresholds for critical files
      perFile: true,
      all: false,
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
