import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end smoke tests. They run against the production build, served by
 * e2e/server.mjs so that the headers in vercel.json (including the CSP) are enforced.
 *
 *   npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && node e2e/server.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // index.tsx renders the router UI only when VITE_UX_V2 is true; production sets it. Without
    // it the build serves the legacy single-page App and none of the routes exist.
    env: { VITE_UX_V2: 'true', VITE_SITE_URL: 'https://freetextfromimage.com' },
  },
});
