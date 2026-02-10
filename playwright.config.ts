/**
 * Playwright E2E Test Configuration (Root)
 *
 * Configuration for end-to-end tests with:
 * - Multi-browser support (Chromium, Firefox, WebKit)
 * - Parallelization for faster execution
 * - Test database isolation
 * - Screenshot/video capture on failure
 * - Authentication state reuse
 */

import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Run tests in files in parallel */
  fullyParallel: false, // Disable for now to avoid conflicts

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: 1, // Sequential execution for stability

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Accept downloads */
    acceptDownloads: true,

    /* Locale */
    locale: 'fr-FR',

    /* Timezone */
    timezoneId: 'Europe/Paris',

    /* Longer timeout for complex operations */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Disable auth setup for now - tests will handle auth themselves
    // {
    //   name: 'setup',
    //   testMatch: /.*\.setup\.ts/,
    // },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Tests will authenticate themselves as needed
      },
      // dependencies: ['setup'],
    },

    // Disable other browsers for initial testing
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //   },
    //   dependencies: ['setup'],
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    //   dependencies: ['setup'],
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
