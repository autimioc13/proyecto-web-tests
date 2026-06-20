import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E + visual regression config.
 *
 * - Tests live in ./e2e (kept separate from Vitest unit tests in ./tests).
 * - By default runs against a local dev server (auto-started below).
 * - Override the target with PLAYWRIGHT_BASE_URL to test a deployed URL, e.g.:
 *     $env:PLAYWRIGHT_BASE_URL="https://proyecto-web-tests.vercel.app"; npm run test:e2e
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const isLocal = baseURL.includes('localhost');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    // Allow tiny rendering differences (anti-aliasing, fonts) in screenshots
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: isLocal
    ? {
        // Use the production build (next start) — the dev server (Turbopack)
        // has a proxy runtime bug. This also matches what Vercel deploys.
        command: 'npm run build && npm run start',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
      }
    : undefined,
});
