import { test, expect } from '@playwright/test';
import { record, cspViolations } from './helpers';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Smoke tests for the Foundation phase.
 *
 * They run against the production build, served by e2e/server.mjs, which applies the real
 * headers from vercel.json (including the Content-Security-Policy). They fail on:
 *   - any console error or uncaught page error (this includes CSP violations,
 *     which Chromium reports as console errors),
 *   - any `securitypolicyviolation` event,
 *   - during an OCR run: any request to another origin, or any request that is not a
 *     plain GET.
 *
 * The same-origin rule is what the /security page describes. If you change one,
 * change the other.
 */

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures',
  'ocr-sample.png'
);
const EXPECTED_TEXT = 'RenderCheck verifies visible text Total: $14.00';

/** Character similarity in [0, 1]: 1 - editDistance / longerLength, ignoring case and spacing. */
function similarity(a: string, b: string): number {
  const x = a.toLowerCase().replace(/\s+/g, '');
  const y = b.toLowerCase().replace(/\s+/g, '');
  const dp = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)]);
  for (let j = 0; j <= y.length; j++) dp[0][j] = j;
  for (let i = 1; i <= x.length; i++) {
    for (let j = 1; j <= y.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1)
      );
    }
  }
  return 1 - dp[x.length][y.length] / Math.max(x.length, y.length, 1);
}

test.describe('routes', () => {
  test('/ loads with no console, page or CSP errors', async ({ page, context }) => {
    const rec = await record(context, page);
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(await cspViolations(page)).toEqual([]);
    expect(rec.problems).toEqual([]);
  });

  test('/verify-debt-score renders (regression: useTheme was not defined)', async ({ page, context }) => {
    const rec = await record(context, page);
    await page.goto('/verify-debt-score');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByTestId('route-error-boundary')).toHaveCount(0);
    await expect(page.getByText('Unexpected Application Error')).toHaveCount(0);
    await page.waitForLoadState('networkidle');
    expect(await cspViolations(page)).toEqual([]);
    expect(rec.problems).toEqual([]);
  });

  for (const [route, heading] of [
    ['/privacy-policy', /^privacy policy$/i],
    ['/terms', /^terms of service$/i],
    ['/security', /^security$/i],
  ] as const) {
    test(`${route} is served on direct navigation`, async ({ page, context }) => {
      const rec = await record(context, page);
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page.getByTestId('route-error-boundary')).toHaveCount(0);
      expect(await cspViolations(page)).toEqual([]);
      expect(rec.problems).toEqual([]);
    });
  }
});

test.describe('OCR', () => {
  test('recognises a test PNG with self-hosted assets and no off-origin or upload requests', async ({
    page,
    context,
    baseURL,
  }) => {
    const rec = await record(context, page);
    await page.goto('/');
    await expect(page.locator('#ocr-tool')).toBeAttached();
    await page.waitForLoadState('networkidle');

    const origin = new URL(baseURL as string).origin;
    const startedAt = Date.now();
    await page.locator('#ocr-tool input[type="file"]').setInputFiles(FIXTURE);

    // The result card shows the extracted text. The page's own heading also contains
    // "RenderCheck", so wait for words that only the image contains. The first run also
    // loads the engine and the language data, so allow time for it.
    const result = page.locator('#ocr-tool').getByText(/verifies visible/i).first();
    await expect(result).toBeVisible({ timeout: 75_000 });
    const elapsedMs = Date.now() - startedAt;

    // Read the extracted-text block only: the result card also shows a "Catch this in CI" snippet that
    // repeats the first line, which must not count towards the character-similarity score.
    const recognised = (
      await page.locator('#ocr-tool').getByLabel('Extracted text', { exact: true }).innerText()
    ).replace(/\s+/g, ' ');
    const score = similarity(
      EXPECTED_TEXT,
      // keep only the part of the page that came from OCR (from the first expected word on)
      recognised.slice(Math.max(0, recognised.toLowerCase().indexOf('rendercheck verifies')))
        .slice(0, EXPECTED_TEXT.length + 20)
    );
    test.info().annotations.push(
      { type: 'ocr-first-run-ms', description: String(elapsedMs) },
      { type: 'ocr-character-similarity', description: score.toFixed(3) }
    );
    expect(recognised.toLowerCase()).toContain('rendercheck');
    expect(recognised.toLowerCase()).toContain('verifies');
    expect(recognised).toMatch(/14\.00/);
    expect(score).toBeGreaterThan(0.9);

    // 1. No console errors, page errors or CSP violations at any point.
    expect(await cspViolations(page)).toEqual([]);
    expect(rec.problems).toEqual([]);

    // 2. During the OCR run (from the moment the file was chosen), nothing left the origin
    //    and nothing but plain GET requests were made.
    const during = rec.requests.filter((r) => r.at >= startedAt);
    const real = during.filter((r) => {
      const u = new URL(r.url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    });
    const offOrigin = real.filter((r) => new URL(r.url).origin !== origin).map((r) => r.url);
    expect(offOrigin, 'requests to another origin during OCR').toEqual([]);
    const notGet = real.filter((r) => r.method !== 'GET').map((r) => `${r.method} ${r.url}`);
    expect(notGet, 'non-GET requests during OCR').toEqual([]);

    // 3. The engine files were served by this site, not by a CDN.
    const urls = rec.requests.map((r) => r.url);
    const served = (name: string) => urls.some((u) => new URL(u).origin === origin && u.endsWith(name));
    expect(served('/ocr/worker.min.js')).toBe(true);
    expect(served('/ocr/eng.traineddata.gz')).toBe(true);
    expect(
      served('/ocr/tesseract-core-simd-lstm.wasm.js') || served('/ocr/tesseract-core-lstm.wasm.js')
    ).toBe(true);
    expect(urls.some((u) => /jsdelivr|huggingface|projectnaptha|unpkg|cdnjs/i.test(u))).toBe(false);
  });
});
