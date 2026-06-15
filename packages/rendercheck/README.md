# RenderCheck

Verify that AI-generated UI shows the correct visible text using OCR and assertions.

## Why RenderCheck?

AI coding tools ship UI fast, but existing tests miss a critical class of bugs: **wrong visible text**. Your DOM tests pass, but users see:

- Wrong currency symbols ($ instead of £)
- Broken confirmation messages
- Invisible or truncated text
- Date/time format mismatches
- Localisation failures

RenderCheck catches these by comparing **actual rendered text** (via OCR) against **expected text** in your tests.

## Installation

```bash
npm install @freetextfromimage/rendercheck
```

Requires an API key from [FreeTextFromImage](/beta).

## Quick Start

```typescript
import { verify } from '@freetextfromimage/rendercheck';

const result = await verify({
  imagePath: './screenshot.png',
  expectedText: 'Payment Successful',
  apiKey: process.env.FTFI_API_KEY,
});

console.log(result.outcome); // 'pass' | 'fail' | 'partial'
```

## API Reference

### `verify(options)`

Verifies that a screenshot contains expected visible text.

**Parameters:**

```typescript
interface VerifyOptions {
  imagePath?: string;           // Path to screenshot file
  imageBuffer?: Buffer;         // Or raw image buffer
  expectedText: string;         // Text that should be visible
  apiKey?: string;              // FreeTextFromImage API key (required)
  baseUrl?: string;             // Custom API endpoint (default: https://freetextfromimage.com)
  timeout?: number;             // Request timeout in ms (default: 30000)
}
```

**Returns:**

```typescript
interface VerificationResult {
  outcome: 'pass' | 'fail' | 'partial';
  foundWords: string[];         // Words from expectedText that were found
  missingWords: string[];       // Words from expectedText that were NOT found
  extractedText: string;        // Full OCR output from the screenshot
  confidence: number;           // Ratio of found words to total expected (0–1)
  message: string;              // Human-readable summary
}
```

## Playwright Integration

```typescript
import { test, expect } from '@playwright/test';
import { verify } from '@freetextfromimage/rendercheck';

test('checkout page shows correct total', async ({ page }) => {
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

## Cypress Integration

```typescript
import { verify } from '@freetextfromimage/rendercheck';

describe('Order confirmation', () => {
  it('displays the correct order number', async () => {
    cy.visit('https://example.com/orders/123');
    cy.screenshot('order-page');

    const screenshot = cy.readFile('cypress/screenshots/order-page.png', 'binary');
    const result = await verify({
      imageBuffer: Buffer.from(screenshot),
      expectedText: 'Order #12345 confirmed',
      apiKey: process.env.FTFI_API_KEY,
    });

    expect(result.outcome).toBe('pass');
  });
});
```

## Limitations

- Verifies **visible text only** — does not check layout, colour, or accessibility
- OCR accuracy depends on **image quality** (contrast, focus, resolution)
- Best used with clear, **high-contrast text**
- Requires a FreeTextFromImage API key (free tier available)

## Privacy

Screenshots are sent to the FreeTextFromImage API over HTTPS, processed in memory, and immediately discarded. No images or extracted text are persisted.

See [Privacy Architecture](https://freetextfromimage.com/privacy-architecture) for details.

## Support

- [API Documentation](https://freetextfromimage.com/developer)
- [GitHub Issues](https://github.com/ParthibanRajasekaran/freetextfromimage/issues)

## License

MIT
