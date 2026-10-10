/**
 * RenderCheck example: assertions on a mock checkout page.
 *
 *   npm run test:example        (from packages/rendercheck; needs `npx playwright install chromium` once)
 *
 * Everything here runs on your machine. There is no API key and no network call: the page is a
 * local file and the OCR runs in-process.
 *
 * In your own project, import from the published package instead of the source:
 *   import { expect, test } from '@freetextfromimage/rendercheck/playwright';
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from '../../src/playwright';

const checkout = (variant?: string) =>
  pathToFileURL(path.join(__dirname, 'checkout.html')).href + (variant ? `?variant=${variant}` : '');

test.describe('mock checkout', () => {
  test('shows the right total, legibly', async ({ page }) => {
    await page.goto(checkout());
    await expect(page).toShowText('Total: $14.00', { minConfidence: 85, minContrastRatio: 4.5 });
    // Light text on a coloured button reads best when OCR looks at the button alone. On a whole
    // page, Tesseract can skip it. Scope the assertion to the element (or a `region`).
    await expect(page.locator('#pay')).toShowText('Pay now');
  });

  test('an element, with a region, checked against its DOM text', async ({ page }) => {
    await page.goto(checkout());
    await expect(page.locator('#total')).toShowText('Total: $14.00', { minConfidence: 85 });
    // Only look at the top-left of the page.
    await expect(page).toShowText('Order summary', { region: { x: 120, y: 40, width: 400, height: 70 } });
  });

  test('.not: the wrong currency is not on screen', async ({ page }) => {
    await page.goto(checkout());
    await expect(page).not.toShowText('Total: €14.00', { timeout: 0 });
  });

  test('catches a wrong currency', async ({ page }) => {
    await page.goto(checkout('euro'));
    // The failure message says what was read, and how it differs.
    await expect(expect(page).toShowText('Total: $14.00', { timeout: 0 })).rejects.toThrow(
      /Expected to find text "\[Total: \$14\.00\]" but OCR read "\[Total: €14\.00\]" \(Confidence: \d+%\)/
    );
    await expect(expect(page).toShowText('Total: $14.00', { timeout: 0 })).rejects.toThrow(/Diff: Total: \[\$\]14\.00 {2}→ {2}Total: \[€\]14\.00/);
  });

  test('catches low-contrast text that a DOM assertion accepts', async ({ page }) => {
    await page.goto(checkout('low-contrast'));
    await expect(page.locator('#total')).toHaveText('Total: $14.00'); // the DOM is fine
    await expect(page.locator('#total')).toBeVisible(); // and Playwright says it is visible
    await expect(
      expect(page).toShowText('Total: $14.00', { minContrastRatio: 4.5, timeout: 0 })
    ).rejects.toThrow(/not legible: contrast must be at least 4\.5:1/);
  });

  test('white text on #FEFEFE fails, though the DOM says it is there', async ({ page }) => {
    await page.goto(checkout('white-on-white'));
    await expect(page.locator('#total')).toHaveText('Total: $14.00'); // DOM: fine
    // On screen it is about 1.01:1. Depending on the image, OCR either cannot read it (reported as
    // "in the DOM but not visible") or reads it and the contrast check rejects it ("not legible").
    // Either way the assertion fails. (__tests__/verify.spec.ts covers the "read, then rejected" path.)
    await expect(
      expect(page.locator('#total')).toShowText('Total: $14.00', { minContrastRatio: 4.5, timeout: 0 })
    ).rejects.toThrow(/not visible in the rendered pixels|not legible: contrast must be at least 4\.5:1/);
  });

  test('catches text that is in the DOM but covered on screen', async ({ page }) => {
    await page.goto(checkout('cover'));
    await expect(page.locator('#total')).toHaveText('Total: $14.00'); // still in the DOM
    await expect(
      expect(page.locator('#total')).toShowText('Total: $14.00', { timeout: 0 })
    ).rejects.toThrow(/not visible in the rendered pixels/);
  });
});
