# RenderCheck

> **Verify what users actually see in AI-generated UI.**

[![npm version](https://img.shields.io/npm/v/@freetextfromimage/rendercheck.svg)](https://www.npmjs.com/package/@freetextfromimage/rendercheck)
[![npm downloads](https://img.shields.io/npm/dw/@freetextfromimage/rendercheck.svg)](https://www.npmjs.com/package/@freetextfromimage/rendercheck)
[![MIT license](https://img.shields.io/npm/l/@freetextfromimage/rendercheck.svg)](LICENSE)

## The Problem

AI coding tools generate UI fast. But your tests pass while users see:
- Wrong currency ($ vs £)
- Broken confirmations (missing order numbers)
- Invisible text (white on white)
- Truncated messages
- Localisation failures (date formats, translated text)

**DOM tests pass. DOM is correct. Logic is correct. But visible text is wrong.**

RenderCheck catches this by comparing rendered-output text against your expectations in Playwright and Cypress tests.

## The Solution

```bash
npm install @freetextfromimage/rendercheck
```

```typescript
import { verify } from '@freetextfromimage/rendercheck';

test('checkout shows correct currency', async ({ page }) => {
  await page.goto('https://example.com/checkout');
  const screenshot = await page.screenshot();

  const result = await verify({
    imageBuffer: screenshot,
    expectedText: 'Total: £99.99',
    apiKey: process.env.FTFI_API_KEY,
  });

  expect(result.outcome).toBe('pass');
});
```

Works with Playwright, Cypress, or any E2E tool that captures screenshots.

## Why This Matters

1. **Catches bugs code tests miss**: Wrong visible text isn't about logic; it's about rendering.
2. **Closes the AI gap**: AI generates fast, but verification can't keep up.
3. **Production-like testing**: Tests what users actually see, not just the DOM.
4. **Developer-friendly**: Works with existing test frameworks; no new tools to learn.

## Documentation

- **Quick Start**: [RenderCheck package README](https://www.npmjs.com/package/@freetextfromimage/rendercheck)
- **Full Docs**: [getrendercheck.com/rendercheck](https://getrendercheck.com/rendercheck)
- **Workflow Examples**: [getrendercheck.com/workflows/ocr-in-ci](https://getrendercheck.com/workflows/ocr-in-ci)
- **Verify Your Team's Debt**: [Verification Debt Score](https://getrendercheck.com/verify-debt-score)

## Dataset

We've published **50 real-world examples** of UI failures where code-level tests pass but visible text is wrong.

Useful for:
- Understanding the gap
- Training test automation engineers
- Researching AI code quality
- Building verification tools

[View the Dataset →](./dataset/ai-ui-verification)

## Privacy

RenderCheck uses the FreeTextFromImage OCR API. No images or extracted text are persisted — they're processed in memory and immediately discarded.

[Privacy Architecture →](https://getrendercheck.com/privacy-architecture)

## License

MIT

---

**Made for teams shipping with AI. Brought to you by FreeTextFromImage.**
