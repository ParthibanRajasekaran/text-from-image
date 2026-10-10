import { test, expect, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function axeViolations(page: Page) {
  await page.evaluate(AXE_SOURCE);
  return page.evaluate(async () => {
    // @ts-expect-error axe is injected above
    const r = await window.axe.run(document, { resultTypes: ['violations'] });
    return r.violations
      .filter((v: { impact?: string }) => v.impact === 'serious' || v.impact === 'critical')
      .map((v: { id: string; nodes: { target: unknown[] }[] }) => ({ id: v.id, nodes: v.nodes.slice(0, 3).map((n) => String(n.target)) }));
  });
}

async function play(page: Page, title: string) {
  await page.goto('/ocr-challenge-lab');
  await page.locator('li', { hasText: title }).getByRole('button', { name: /^Play$|^Playing$/ }).click();
}

test.describe('OCR Challenge Lab', () => {
  test('grades the Swiss receipt for real, and the result is shareable', async ({ page }) => {
    await play(page, 'A Swiss receipt in German');
    await page.getByTestId('challenge-pick-date-order').check();
    await page.getByTestId('challenge-pick-currency-mix').check();
    await page.getByTestId('challenge-pick-math').check();
    await page.getByTestId('challenge-answer').fill('Datum: 15.06.2026 19:45\nMwSt 7.7% CHF 6.31');
    await page.getByTestId('challenge-check').click();
    await expect(page.getByTestId('challenge-score')).toHaveText('100');

    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download result image' }).click()]);
    const buf = readFileSync((await download.path())!);
    expect(buf.subarray(1, 4).toString()).toBe('PNG');
    expect(buf.readUInt32BE(16)).toBe(1200);
    expect(buf.readUInt32BE(20)).toBe(630);
  });

  test('a half-right answer loses points and says what it missed', async ({ page }) => {
    await play(page, 'The invoice for a US customer');
    await page.getByTestId('challenge-pick-currency-symbol').check();
    await page.getByTestId('challenge-pick-contrast').check();
    await page.getByTestId('challenge-answer').fill('Total €1,234.56');
    await page.getByTestId('challenge-check').click();
    await expect(page.getByTestId('challenge-score')).not.toHaveText('100');
    await expect(page.getByText(/Not a bug here/)).toBeVisible();
    await expect(page.getByTestId('challenge-result-currency-symbol')).toContainText('$1,234.56');
  });

  test('the best score survives a reload', async ({ page }) => {
    await play(page, 'The invoice for a US customer');
    await page.getByTestId('challenge-pick-currency-symbol').check();
    await page.getByTestId('challenge-answer').fill('$1,234.56');
    await page.getByTestId('challenge-check').click();
    await expect(page.getByText('Your best on this challenge: 100')).toBeVisible();
    await page.reload();
    await play(page, 'The invoice for a US customer');
    await page.getByTestId('challenge-check').click();
    await expect(page.getByText('Your best on this challenge: 100')).toBeVisible();
  });

  for (const scheme of ['light', 'dark'] as const) {
    test(`the graded view has no serious accessibility violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await play(page, 'A Swiss receipt in German');
      await page.getByTestId('challenge-pick-date-order').check();
      await page.getByTestId('challenge-check').click();
      await expect(page.getByTestId('challenge-result')).toBeVisible();
      await page.waitForTimeout(800);
      expect(await axeViolations(page)).toEqual([]);
    });
  }
});
