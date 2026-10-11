# RenderCheck

Assert what users actually **see**, not just what is in the DOM. RenderCheck takes a screenshot, reads
it with OCR **on your machine**, and fails your Playwright or Cypress test with a clear message when the
rendered text is wrong, too faint to read, or not there at all.

> **Renamed.** Up to 0.4.1 this package was published as `@freetextfromimage/rendercheck`. From 0.5.0 it is
> `@rendercheck/sdk`; the API is unchanged. See the [CHANGELOG](CHANGELOG.md) for migration steps.

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
npm install --save-dev @rendercheck/sdk
```

Requires Node 18+, and `@playwright/test` (≥ 1.40) or `cypress` (≥ 12).

## Playwright

```ts
import { test } from '@playwright/test';
import { expect } from '@rendercheck/sdk/playwright'; // Playwright's expect + toShowText

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

### Prices and dates in the right locale

```ts
await expect(page).toShowCurrency(1234.5, { currency: 'EUR', locale: 'de-DE' }); // expects "1.234,50 €"
await expect(page).toShowDate('2026-03-04', { locale: 'en-GB' });               // expects "04/03/2026"
await expect(page).toShowDate('2026-03-04', { locale: 'en-GB', format: { day: 'numeric', month: 'long', year: 'numeric' } });
```

The expected text comes from `Intl`, so each locale's separators, symbol position and date order are
applied for you. When the screen shows something else, the failure says what it is:
`The screen shows USD ($14.00), not GBP (£14.00).` or
`The date is formatted for en-US (03/04/2026), but en-GB should show 04/03/2026.`
Dates use UTC unless you pass `dateTimeZone`, so they are the same on every CI machine.

Cypress has the same checks: `cy.matchCurrency(1234.5, { currency: 'EUR', locale: 'de-DE' })` and
`cy.matchDate('2026-03-04', { locale: 'en-GB' })`. In other tools, `expectedCurrency` and `expectedDate`
(from the package root) give you the text to pass to `toShowText`.

**Right-to-left and other scripts.** Direction marks and non-breaking spaces are ignored in every
comparison, so Intl output and DOM text match what OCR reads. Only English OCR data ships with the package.
For Arabic, Hebrew, Japanese and the like, download the `.traineddata` file and set `langPath`; the language
is then picked from the locale (`ar-EG` uses `ara`), or set `lang` yourself. Arabic locales use Arabic-Indic
digits, so a page that shows `14.00` where `١٤٫٠٠` belongs fails, which is usually what you want.


## Cypress

```ts
// cypress.config.ts
import { defineConfig } from 'cypress';
import { registerRenderCheck } from '@rendercheck/sdk/cypress/plugin';

export default defineConfig({
  e2e: { setupNodeEvents(on) { registerRenderCheck(on); } },
});

// cypress/support/e2e.ts
import '@rendercheck/sdk/cypress';

// in a test
cy.visit('/checkout');
cy.matchText('Total: $14.00', { minConfidence: 85, minContrastRatio: 4.5 });
cy.get('#total').matchText('Total: $14.00');
```

> Tested in a real Cypress (13.17, Electron, Linux): `examples/cypress` runs 5 specs against the mock
> checkout page, including the failing cases. Other Cypress versions and browsers are untested.
> Run it with `npm run build && npx cypress@13 run --project examples/cypress` (add `--browser electron`).

## Command line and AI agents

Check a screenshot from a terminal, a script or an AI coding agent. Same local, offline OCR.

```bash
npx @rendercheck/sdk verify screenshot.png --expect "Total: $14.00" --min-contrast 4.5
npx @rendercheck/sdk read screenshot.png --json
```

Exit code `0` means pass, `1` the assertion failed, `2` an error. `--json` prints `{ pass, failure, read, confidence, box, message }`.

### MCP server

`rendercheck mcp` is a [Model Context Protocol](https://modelcontextprotocol.io) server over stdio with two tools:
`verify_text` (is this text really visible, legible and readable?) and `read_text` (what does a user see?).

```json
{
  "mcpServers": {
    "rendercheck": { "command": "npx", "args": ["-y", "@rendercheck/sdk", "mcp"] }
  }
}
```

Claude Code: `claude mcp add rendercheck -- npx -y @rendercheck/sdk mcp`.

Set up every agent in a repo in one step:

```bash
npx @rendercheck/sdk init            # Claude Code, Codex/AGENTS.md, Cursor, Copilot
npx @rendercheck/sdk init --agents claude,cursor --dry-run
```

It adds a short instruction ("after changing UI, verify the pixels with `verify_text`") and the MCP server entry. Re-running
is safe: only the marked RenderCheck block is updated.

Runs are counted in `~/.rendercheck/usage.jsonl` on your machine only, so `rendercheck stats` can show them to you.
Screenshot text is never recorded and nothing is sent anywhere. Set `RENDERCHECK_NO_USAGE_LOG=1` to turn it off.

## Core

```ts
import { verifyText } from '@rendercheck/sdk/core';

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

## Pull request annotations (GitHub Actions)

When an assertion fails, RenderCheck can leave a record for CI: a JSON file and a copy of the screenshot with
the failing text outlined in red. The GitHub Action in [`action/`](./action) turns those into pull request
annotations on the failing test line ("Expected `Total: $14.00`, OCR read `Total: €14.00`, failing region
x=140, y=244, 219×24 px"), a job summary table, and a downloadable report with the outlined screenshots.

```yaml
env:
  RENDERCHECK_REPORT_DIR: rendercheck-report      # on GitHub Actions this is already the default
steps:
  - run: npx playwright test                       # or cypress run
  - uses: ParthibanRajasekaran/text-from-image/packages/rendercheck/action@<ref>
    if: always()
```

Records are off outside GitHub Actions unless you set `RENDERCHECK_REPORT_DIR` (set it to an empty string to
switch them off there). A failure is recorded once, after the last retry, and a retry that passes removes it.
GitHub annotations attach to source lines, not screen coordinates, so the region is written in the message and
drawn on the screenshot. Everything stays in your workflow: no service, no token, no network call.

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
written to your project either. (Failure records are the one exception, and only when you turn them on: see above.) To check it yourself on Linux: `npm run test:offline` runs the tests in a
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

## Links

- Documentation: https://getrendercheck.com/developers
- How it stays local (architecture and threat model): https://getrendercheck.com/security
- Issues and feature requests: https://github.com/ParthibanRajasekaran/text-from-image/issues
- Security reports: see [SECURITY.md](https://github.com/ParthibanRajasekaran/text-from-image/blob/main/SECURITY.md)
