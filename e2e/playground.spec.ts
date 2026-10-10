import { test, expect, type Page } from '@playwright/test';
import { record, cspViolations } from './helpers';

const OCR_TIMEOUT = 90_000;

async function run(page: Page) {
  await page.getByTestId('btu-run').click();
  await expect(page.getByTestId('btu-pixels')).toBeVisible({ timeout: OCR_TIMEOUT });
  return {
    dom: await page.getByTestId('btu-dom').getAttribute('data-pass'),
    pixels: await page.getByTestId('btu-pixels').getAttribute('data-pass'),
  };
}

test.describe('Break the UI playground (real Chromium, real OCR)', () => {
  test('an unbroken card passes both checks', async ({ page, context }) => {
    await record(context, page);
    await page.goto('/ai-ui-bug-gallery');
    expect(await run(page)).toEqual({ dom: 'true', pixels: 'true' });
    expect(await cspViolations(page)).toEqual([]);
  });

  for (const bug of ['currency', 'invisible', 'truncated', 'covered']) {
    test(`${bug}: the DOM test passes and the pixel check fails`, async ({ page }) => {
      await page.goto('/ai-ui-bug-gallery');
      await page.getByTestId(`btu-bug-${bug}`).check();
      expect(await run(page)).toEqual({ dom: 'true', pixels: 'false' });
      await expect(page.getByTestId('btu-gap')).toBeVisible();
    });
  }
});
