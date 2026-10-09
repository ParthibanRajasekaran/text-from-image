import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { record, cspViolations, waitForNewRun } from './helpers';

const here = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE = path.join(here, '..', 'public', 'demo', 'checkout-sample.png');
const OCR_TIMEOUT = 90_000;

test.describe('RenderCheck hero demo', () => {
  test('reads the sample, flags the low-contrast line, and proves nothing was uploaded', async ({ page, context, baseURL }) => {
    const rec = await record(context, page);
    await page.goto('/rendercheck');
    await page.waitForLoadState('networkidle');
    const demo = page.getByTestId('hero-demo');
    await expect(demo).toBeVisible();

    await waitForNewRun(page, () => page.getByTestId('hero-demo-sample').click(), OCR_TIMEOUT);

    const boxes = page.getByTestId('hero-demo-box');
    expect(await boxes.count()).toBeGreaterThanOrEqual(15);
    const statuses = await boxes.evaluateAll((els) => els.map((e) => [e.getAttribute('data-text'), e.getAttribute('data-status'), e.getAttribute('data-reason')]));
    test.info().annotations.push({ type: 'words', description: JSON.stringify(statuses) });

    // The pale "Free returns within 30 days" line is the contrast failure.
    const pale = statuses.filter(([t]) => /returns|within|days|Free/i.test(t ?? ''));
    expect(pale.length).toBeGreaterThan(0);
    expect(pale.some(([, s, r]) => s === 'fail' && r === 'contrast')).toBe(true);
    // Ordinary dark text passes.
    expect(statuses.some(([t, s]) => /Subtotal|Shipping|summary/i.test(t ?? '') && s === 'pass')).toBe(true);

    // Colours.
    const colours = await boxes.evaluateAll((els) => els.map((e) => [e.getAttribute('data-status'), e.getAttribute('stroke')]));
    for (const [s, c] of colours) {
      expect(c).toBe(s === 'pass' ? '#4ADE80' : s === 'low-confidence' ? '#FBBF24' : '#FB7185');
    }

    // Network audit: nothing uploaded.
    await expect(page.getByTestId('hero-demo-verified')).toContainText('0 bytes uploaded');
    await expect(page.getByTestId('hero-demo-bytes')).toHaveText('0 B');

    // Real traffic, seen from outside the page: only same-origin GETs.
    const origin = new URL(baseURL as string).origin;
    const real = rec.requests.filter((r) => /^https?:/.test(r.url) && !/fonts\.(googleapis|gstatic)\.com/.test(r.url));
    expect(real.filter((r) => new URL(r.url).origin !== origin).map((r) => r.url)).toEqual([]);
    expect(real.filter((r) => r.method !== 'GET').map((r) => `${r.method} ${r.url}`)).toEqual([]);

    // Snippet.
    await expect(page.getByTestId('snippet-export')).toContainText('toShowText(');
    expect(await cspViolations(page)).toEqual([]);
    expect(rec.problems).toEqual([]);
  });

  test('shows the expected-vs-read difference when the text does not match', async ({ page, context }) => {
    const rec = await record(context, page);
    await page.goto('/rendercheck');
    await waitForNewRun(page, () => page.getByTestId('hero-demo-sample').click(), OCR_TIMEOUT);

    await page.getByTestId('hero-demo-expected').fill('Total: $14.00');
    const status = page.getByTestId('hero-demo-status');
    await expect(status).toContainText('Expected to find text "Total: $14.00" but OCR read');
    test.info().annotations.push({ type: 'status', description: (await status.innerText()) });
    const mismatches = await page.locator('[data-testid="hero-demo-box"][data-reason="mismatch"]').count();
    expect(mismatches).toBeGreaterThan(0);
    await expect(page.getByTestId('snippet-export')).toContainText("toShowText('Total: $14.00'");

    // A text that is on screen passes.
    await page.getByTestId('hero-demo-expected').fill('Order summary');
    await expect(page.locator('[data-testid="hero-demo-box"][data-reason="mismatch"]')).toHaveCount(0);
    expect(rec.problems).toEqual([]);
  });

  test('scan line uses a 700ms cubic-bezier(.2,.8,.2,1) transition', async ({ page, context }) => {
    await record(context, page);
    await page.goto('/rendercheck');
    await waitForNewRun(page, () => page.getByTestId('hero-demo-sample').click(), OCR_TIMEOUT);
    const t = await page.getByTestId('hero-demo-scanline').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { d: cs.transitionDuration, f: cs.transitionTimingFunction };
    });
    expect(t.d).toContain('0.7s');
    expect(t.f).toContain('cubic-bezier(0.2, 0.8, 0.2, 1)');
  });

  test('works with the browser really offline once the engine is loaded', async ({ page, context }) => {
    const rec = await record(context, page);
    await page.goto('/rendercheck');
    await page.waitForLoadState('networkidle');

    // Warm-up: this run loads the engine.
    await waitForNewRun(page, () => page.getByTestId('hero-demo-input').setInputFiles(SAMPLE), OCR_TIMEOUT);

    await context.setOffline(true);
    await page.getByTestId('hero-demo-offline-toggle').check();
    await waitForNewRun(page, () => page.getByTestId('hero-demo-input-again').setInputFiles(SAMPLE), 30_000);
    expect(await page.getByTestId('hero-demo-box').count()).toBeGreaterThanOrEqual(15);
    await expect(page.getByTestId('hero-demo-verified')).toContainText('0 bytes uploaded');
    await context.setOffline(false);
    expect(await cspViolations(page)).toEqual([]);
    expect(rec.problems).toEqual([]);
  });
});
