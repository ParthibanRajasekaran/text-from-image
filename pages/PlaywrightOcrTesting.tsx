import React from 'react';
import { IntegrationDoc } from '../components/IntegrationDoc';
import { ROUTES } from '../router';

export default function PlaywrightOcrTesting() {
  return (
    <IntegrationDoc
      path={ROUTES.PLAYWRIGHT_OCR_TESTING}
      tool="Playwright"
      seoTitle="Playwright OCR Testing: Assert What Users See | RenderCheck"
      seoDescription="Add toShowText to Playwright and fail tests when the rendered text is wrong, too faint, or missing. OCR runs locally in CI. No API key, no upload."
      h1="Playwright OCR testing"
      lead="Assert the text users actually see on screen, not just what is in the DOM, with one extra matcher on Playwright's own expect."
      setup={[
        {
          title: 'Import expect from RenderCheck',
          intro: "It is Playwright's own expect with toShowText added, so existing assertions keep working.",
          filename: 'checkout.spec.ts',
          language: 'typescript',
          code: `import { test } from '@playwright/test';
import { expect } from '@rendercheck/sdk/playwright';`,
        },
      ]}
      usage={[
        {
          title: 'Check text on a page or an element',
          intro: 'toShowText retries until it passes or the timeout (default 5000 ms) runs out, like Playwright assertions.',
          filename: 'checkout.spec.ts',
          language: 'typescript',
          code: `test('checkout shows the right total', async ({ page }) => {
  await page.goto('/checkout');

  await expect(page).toShowText('Total: $14.00', {
    minConfidence: 85,      // OCR confidence of the matched words (default 80)
    minContrastRatio: 4.5,  // WCAG contrast of the matched words (off unless set)
  });

  // One element: also compared with its DOM text.
  await expect(page.locator('#total')).toShowText('Total: $14.00');

  await expect(page).not.toShowText('Total: €14.00');
});`,
        },
        {
          title: 'Prices and dates in the right locale',
          intro: 'The expected text comes from Intl, so separators, symbol position and date order are applied for you.',
          filename: 'locale.spec.ts',
          language: 'typescript',
          code: `await expect(page).toShowCurrency(1234.5, { currency: 'EUR', locale: 'de-DE' }); // "1.234,50 €"
await expect(page).toShowDate('2026-03-04', { locale: 'en-GB' });               // "04/03/2026"`,
        },
      ]}
      gotchas={[
        'Already using expect.extend? Import toShowText from the same path and add it yourself.',
        'Pass region to check part of the screenshot, and fullPage: true to capture the whole scrollable page.',
        'Only English OCR data ships in the package. For other scripts, download the .traineddata file and set langPath.',
        'OCR is probabilistic. Set minConfidence to a level that suits your fonts, and keep text large enough to read.',
        'The SDK is in developer beta and has no public adoption numbers yet.',
      ]}
      faqs={[
        { question: 'Does Playwright OCR testing send screenshots anywhere?', answer: 'No. OCR runs in your Node process using Tesseract.js (WebAssembly). There is no API key and no network call.' },
        { question: 'How is this different from a DOM assertion like toHaveText?', answer: 'toHaveText reads the markup. toShowText reads the rendered pixels, so it fails when text is covered, clipped, the wrong symbol, or too low in contrast to read.' },
        { question: 'Does it work in CI?', answer: 'Yes. There are no native modules (PNG and JPEG decoding is pure JavaScript), and it needs Node 18+ and @playwright/test 1.40 or newer.' },
        { question: 'Can it replace visual regression tools?', answer: 'No. It checks that specific text is visible and legible, not that the whole page looks the same as a baseline. Use it alongside snapshot tools.' },
      ]}
    />
  );
}
