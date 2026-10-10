import { defineConfig } from '@playwright/test';

// No web server, no API keys, no network: the mock checkout page is a local file.
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  use: {
    viewport: { width: 800, height: 560 },
    deviceScaleFactor: 1,
  },
});
