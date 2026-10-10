/**
 * RenderCheck example: prices and dates in the locale the user should see.
 *
 * The page formats with the browser's own Intl, like a real app. The assertion builds the expected
 * text from the same locale rules, so "1.234,50 €" is expected for de-DE and "€1,234.50" is a bug.
 */
import { expect, test } from '../../src/playwright';

const page$ = (locale: string, currency: string, date: string) => `
  <body style="margin:0;padding:24px;font:32px Arial;color:#111;background:#fff">
    <div id="price"></div><div id="due"></div>
    <script>
      document.getElementById('price').textContent = 'Total ' + new Intl.NumberFormat('${locale}', { style: 'currency', currency: '${currency}' }).format(1234.5);
      document.getElementById('due').textContent = 'Due ' + new Intl.DateTimeFormat('${locale}', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date('${date}T12:00:00Z'));
    </script>
  </body>`;

test.describe('locale rules', () => {
  test('a German page shows the German price and date', async ({ page }) => {
    await page.setContent(page$('de-DE', 'EUR', '2026-03-04'));
    await expect(page).toShowCurrency(1234.5, { currency: 'EUR', locale: 'de-DE' });
    await expect(page).toShowDate('2026-03-04', { locale: 'de-DE' });
  });

  test('a British page shows pounds and day-first dates', async ({ page }) => {
    await page.setContent(page$('en-GB', 'GBP', '2026-03-04'));
    await expect(page).toShowCurrency(1234.5, { currency: 'GBP', locale: 'en-GB' });
    await expect(page).toShowDate('2026-03-04', { locale: 'en-GB' });
  });

  test('says what is wrong when the page uses the wrong locale', async ({ page }) => {
    await page.setContent(page$('en-US', 'EUR', '2026-03-04'));
    const price = await expect(page).toShowCurrency(1234.5, { currency: 'EUR', locale: 'de-DE', timeout: 0 }).then(
      () => '',
      (e: Error) => e.message
    );
    expect(price).toContain('formatted for en-US');
    const due = await expect(page).toShowDate('2026-03-04', { locale: 'en-GB', timeout: 0 }).then(
      () => '',
      (e: Error) => e.message
    );
    expect(due).toContain('formatted for en-US (03/04/2026)');
  });
});
