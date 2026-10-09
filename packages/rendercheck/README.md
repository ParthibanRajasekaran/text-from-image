# RenderCheck

Assert what users actually **see**, not just what is in the DOM. RenderCheck takes a screenshot, reads
it with OCR **on your machine**, and fails your Playwright or Cypress test with a clear message when the
rendered text is wrong, too faint to read, or not there at all.

- **Local only.** OCR runs in-process (Tesseract.js, WebAssembly). No API key, no upload, no network
  calls. The English language data ships in the package.
- **Catches what DOM tests cannot:** a `€` where a `$` should be, text covered by another element,
  low-contrast text, text the DOM has but the screen does not show.
- **Plays well with CI.** No native modules (pure-JS PNG/JPEG decoding), no browser-side code.

```
Expected to find text "[Total: $14.00]" but OCR read "[Total: €14.00]" (Confidence: 96%)
  Diff: Total: [$]14.00  →  Total: [€]14.00
```

## Install

```bash
npm install --save-dev @freetextfromimage/rendercheck
```

Requires Node 18+, and `@playwright/test` (≥ 1.40) or `cypress` (≥ 12).

## Playwright

```ts
import { test } from '@playwright/test';
import { expect } from '@freetextfromimage/rendercheck/playwright'; // Playwright's expect + toShowText

test('checkout shows the right total', async ({ page }) => {
  await page.goto('/checkout');

  await expect(page).toShowText('Total: $14.00', {
    minConfidence: 85,      // OCR confidence of the matched words (default 80)
    minContrastRatio: 4.5,  // WCAG contrast of the matched words (off unless set)
  });

  // One element: also compared with its DOM text (innerText).
  await expect(page.locator('#total')).toShowText('Total: $14.00');

  // Only part of the screenshot (CSS pixels from its top-left corner).
  await expect(page).toShowText('Pay now', { region: { x: 120, y: 340, width: 200, height: 40 } });

  await expect(page).not.toShowText('Total: €14.00');
});
```

Like Playwright's own assertions, `toShowText` retries until it passes or `timeout` (default 5000 ms) runs out.
Already using `expect.extend`? Import `toShowText` from the same path and add it yourself.

## Cypress

```ts
// cypress.config.ts
import { defineConfig } from 'cypress';
import { registerRenderCheck } from '@freetextfromimage/rendercheck/cypress/plugin';

export default defineConfig({
  e2e: { setupNodeEvents(on) { registerRenderCheck(on); } },
});

// cypress/support/e2e.ts
import '@freetextfromimage/rendercheck/cypress';

// in a test
cy.visit('/checkout');
cy.matchText('Total: $14.00', { minConfidence: 85, minContrastRatio: 4.5 });
cy.get('#total').matchText('Total: $14.00');
```

> Tested in a real Cypress (13.17, Electron, Linux): `examples/cypress` runs 5 specs against the mock
> checkout page, including the failing cases. Other Cypress versions and browsers are untested.
> Run it with `npm run build && npx cypress@13 run --project examples/cypress` (add `--browser electron`).

## Core

```ts
import { verifyText } from '@freetextfromimage/rendercheck/core';

const report = await verifyText({
  image: fs.readFileSync('screenshot.png'), // PNG or JPEG
  expected: 'Total: $14.00',
  options: { minContrastRatio: 4.5 },
});
if (!report.pass) console.error(report.message);
```

`recognize(image, { region })` gives the raw OCR result (`words`, `lines`, boxes in image pixels), and
`analyzeWordContrast` the WCAG contrast math, if you want to build your own assertions.

## Options

| Option | Default | |
| --- | --- | --- |
| `region` | whole screenshot | `{ x, y, width, height }` in screenshot pixels |
| `minConfidence` | `80` | minimum OCR confidence (0-100) of the matched words |
| `minContrastRatio` | off | minimum WCAG contrast ratio, e.g. `4.5` (normal text) or `3` (large text) |
| `exact` | `false` | the region's text must equal the expected text, not just contain it |
| `ignoreCase` | `false` | `PAY NOW` is not `Pay now` unless you say so |
| `dom` | `true` | with a Locator, compare with the element's DOM text too |
| `timeout` / `interval` | `5000` / `250` | Playwright: retry window and pause between attempts (ms) |
| `fullPage` | `false` | Playwright: capture the whole scrollable page |
| `lang` / `langPath` | `eng` / bundled | other Tesseract languages: point `langPath` at the folder with `<lang>.traineddata.gz` |

## What it can and cannot do

- **OCR is not perfect.** It can misread `l`/`I`/`1` and `O`/`0`, and it can skip text. Light text on a
  coloured background is often missed on a busy page: scope the assertion to the element
  (`page.locator('#pay')`) or a `region`. Very faint text, which is exactly what a contrast check
  looks for, may not be read at all. Then the assertion still fails, reported as "in the DOM but not
  visible in the rendered pixels".
- **Contrast is measured on pixels** (text colour vs the colour around it, by k-means), not from CSS.
  Gradients, images behind text and anti-aliasing make it an estimate.
- It verifies **visible text**. It does not check layout, spacing or colour beyond contrast; use it with
  visual-regression tooling, not instead of it.
- English only out of the box.

## Network

No code in this package makes a network request. Tesseract's own cache is switched off, so nothing is
written to your project either. To check it yourself on Linux: `npm run test:offline` runs the tests in a
network-less namespace (`unshare -rn`).

## Example

`examples/playwright/` is a Playwright suite against a mock checkout page (a local HTML file), including
the failing cases: wrong currency, low contrast, text covered by another element.

```bash
npx playwright install chromium   # once
npm run test:example
```

[`examples/github-actions.yml`](examples/github-actions.yml) shows it in CI.

## License

MIT
