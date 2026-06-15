import React from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CodeBlock } from '../components/ui/CodeBlock';
import { ScrollNav } from '../components/ui/ScrollNav';
import { ROUTES } from '../router';

/**
 * Developers Page: SDK, API reference, quick-start guides
 * - Product state matrix (Live, Beta, Planned)
 * - npm package info
 * - Code examples (npm install, basic usage, Playwright integration)
 * - API reference (VerifyOptions, VerificationResult)
 * - DevFAQ
 */
export default function Developers() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/developers', SITE_URL).toString();

  useSEO({
    title: 'RenderCheck Developers — SDK, API Reference & Quick Start',
    description:
      'RenderCheck SDK documentation, API reference, and examples for Playwright and Cypress. Get started with npm install @freetextfromimage/rendercheck.',
    canonical: canonicalAbsolute,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    name: 'RenderCheck Developer Documentation',
    url: canonicalAbsolute,
    description: 'Developer docs, SDK guide, and API reference for RenderCheck',
  };

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'product-state', label: 'Product State' },
    { id: 'install', label: 'Install' },
    { id: 'quick-start', label: 'Quick Start' },
    { id: 'api-reference', label: 'API Reference' },
    { id: 'examples', label: 'Examples' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <EnterpriseLayout
      sidebar={
        <div className="space-y-4">
          <ScrollNav sections={sections} />

          <div className="border border-border rounded-lg p-4 bg-surface/50 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Quick Info</h3>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                <strong>Package:</strong>
                <br />
                <code className="text-code-text">@freetextfromimage/rendercheck</code>
              </p>
              <p>
                <strong>License:</strong>
                <br />
                MIT
              </p>
              <p>
                <strong>Requires:</strong>
                <br />
                Node ≥18
              </p>
              <p>
                <a
                  href="https://github.com/ParthibanRajasekaran/text-from-image"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  GitHub Repository →
                </a>
              </p>
            </div>
          </div>
        </div>
      }
      breadcrumb={[
        { label: 'Home', href: ROUTES.HOME },
        { label: 'Developers' },
      ]}
      jsonLd={jsonLd}
    >
      {/* Overview */}
      <section id="overview" className="mb-12 scroll-mt-24">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Developer Documentation</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-6">
          RenderCheck is an SDK for verifying rendered UI text in Playwright, Cypress, and any E2E testing framework.
        </p>
        <p className="text-foreground/90">
          Use it to catch bugs where DOM tests pass but visible text is wrong — currency symbols, truncated confirmations,
          locale formatting, missing copy, and invisible text.
        </p>
      </section>

      {/* Product State */}
      <section id="product-state" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Product State</h2>

        <div className="space-y-3">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">Browser OCR</h3>
              <StatusBadge variant="live" />
            </div>
            <p className="text-sm text-muted-foreground">
              Free tool at freetextfromimage.com. Extract text from images in your browser. No signup required.
            </p>
          </div>

          <div className="border border-status-beta/30 rounded-lg p-4 bg-status-beta/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">API OCR</h3>
              <StatusBadge variant="developer-beta" />
            </div>
            <p className="text-sm text-muted-foreground">
              Programmatic access for E2E tests. 1,000 calls/month during beta. Request access on the Access page.
            </p>
          </div>

          <div className="border border-status-beta/30 rounded-lg p-4 bg-status-beta/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">RenderCheck SDK</h3>
              <StatusBadge variant="developer-beta" />
            </div>
            <p className="text-sm text-muted-foreground">
              npm package for Playwright/Cypress. Available now. Browser and API modes supported.
            </p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">CLI Tool</h3>
              <StatusBadge variant="planned" />
            </div>
            <p className="text-sm text-muted-foreground">
              Command-line interface for one-off OCR verification. Coming after developer beta.
            </p>
          </div>
        </div>
      </section>

      {/* Install */}
      <section id="install" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Install</h2>

        <CodeBlock
          code="npm install @freetextfromimage/rendercheck"
          language="bash"
          filename="Terminal"
          className="mb-4"
        />

        <div className="p-4 bg-muted/50 border border-border rounded-lg">
          <p className="text-sm text-foreground/90">
            Compatible with Playwright, Cypress, Vitest, and any testing framework that can execute JavaScript.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quick-start" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Quick Start</h2>

        <p className="text-foreground/90 mb-4">
          Basic usage with Playwright and browser OCR (no API key needed for this example):
        </p>

        <CodeBlock
          code={`import { verify } from '@freetextfromimage/rendercheck';

test('checkout shows correct currency', async ({ page }) => {
  await page.goto('https://example.com/checkout');
  const screenshot = await page.screenshot();

  const result = await verify({
    imageBuffer: screenshot,
    expectedText: 'Total: £99.99',
    // Browser mode - no API key needed
  });

  expect(result.outcome).toBe('pass');
});`}
          language="typescript"
          filename="checkout.spec.ts"
          className="mb-6"
        />

        <p className="text-foreground/90 mb-4">
          To use API mode (more reliable for production), request an API key and pass it:
        </p>

        <CodeBlock
          code={`const result = await verify({
  imageBuffer: screenshot,
  expectedText: 'Total: £99.99',
  apiKey: process.env.RENDERCHECK_API_KEY,
});`}
          language="typescript"
          className="mb-4"
        />
      </section>

      {/* API Reference */}
      <section id="api-reference" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">API Reference</h2>

        <h3 className="text-lg font-semibold text-foreground mb-3">verify(options)</h3>
        <p className="text-foreground/90 mb-4">Main verification function. Compares rendered text against expected output.</p>

        <CodeBlock
          code={`interface VerifyOptions {
  imagePath?: string;           // Path to image file
  imageBuffer?: Buffer;         // Raw image buffer
  expectedText: string;         // Text you expect to find
  apiKey?: string;              // Optional API key for API mode
}

interface VerificationResult {
  outcome: 'pass' | 'fail' | 'partial';
  foundWords: string[];         // Words found in image
  missingWords: string[];       // Words not found
  extractedText: string;        // Full extracted text
  confidence: number;           // OCR confidence (0-1)
  message: string;              // Human-readable result
}`}
          language="typescript"
          className="mb-6"
        />

        <h3 className="text-lg font-semibold text-foreground mb-3">Return Values</h3>
        <ul className="space-y-2 text-foreground/90 mb-6">
          <li>
            <strong>pass:</strong> All expected words found in rendered text
          </li>
          <li>
            <strong>partial:</strong> Some but not all expected words found
          </li>
          <li>
            <strong>fail:</strong> No expected words found or OCR error
          </li>
        </ul>
      </section>

      {/* Examples */}
      <section id="examples" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Examples</h2>

        <h3 className="text-lg font-semibold text-foreground mb-3">Playwright Example</h3>
        <CodeBlock
          code={`import { test, expect } from '@playwright/test';
import { verify } from '@freetextfromimage/rendercheck';

test('order confirmation displays order number', async ({ page }) => {
  await page.goto('/order-confirmation');
  const screenshot = await page.screenshot();

  const result = await verify({
    imageBuffer: screenshot,
    expectedText: 'Order #ABC123456',
    apiKey: process.env.RENDERCHECK_API_KEY,
  });

  expect(result.outcome).not.toBe('fail');
  expect(result.foundWords).toContain('ABC123456');
});`}
          language="typescript"
          filename="order.spec.ts"
          className="mb-6"
        />

        <h3 className="text-lg font-semibold text-foreground mb-3">Cypress Example</h3>
        <CodeBlock
          code={`import { verify } from '@freetextfromimage/rendercheck';

describe('Payment Flow', () => {
  it('shows payment success message', () => {
    cy.visit('/checkout');
    cy.screenshot('payment-success');

    cy.readFile('cypress/screenshots/payment-success.png', 'base64').then(
      (screenshot) => {
        verify({
          imageBuffer: Buffer.from(screenshot, 'base64'),
          expectedText: 'Payment Successful',
          apiKey: Cypress.env('RENDERCHECK_API_KEY'),
        }).then((result) => {
          expect(result.outcome).to.equal('pass');
        });
      }
    );
  });
});`}
          language="typescript"
          className="mb-6"
        />
      </section>

      {/* FAQ */}
      <section id="faq" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked</h2>

        <div className="space-y-3">
          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary">
              Do I need an API key?
            </summary>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>
                No. Browser mode works without a key using in-browser Tesseract.js OCR. API mode requires a key and is
                more reliable for production.
              </p>
            </div>
          </details>

          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary">
              What's the difference between browser mode and API mode?
            </summary>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>
                <strong>Browser:</strong> Uses Tesseract.js WASM in your test runner. Works locally, no key needed.
              </p>
              <p className="mt-2">
                <strong>API:</strong> Sends screenshot to our cloud service. More accurate, requires API key.
              </p>
            </div>
          </details>

          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary">
              Is OCR accuracy guaranteed?
            </summary>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>
                No. OCR accuracy depends on image quality. Best results with high-contrast, clear text. Use for critical
                UI assertions, not pixel-perfect verification.
              </p>
            </div>
          </details>

          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary">
              Can I use this with Cypress?
            </summary>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>Yes. Any framework that can execute JavaScript. See Cypress example above.</p>
            </div>
          </details>

          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary">
              What happens to my screenshots?
            </summary>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>
                <strong>Browser mode:</strong> Never leave your machine.
              </p>
              <p className="mt-2">
                <strong>API mode:</strong> Sent to cloud for OCR, never stored or logged. Processed and discarded.
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t pt-8 mt-12">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Ready to get started?</h3>
          <p className="text-muted-foreground mb-6">
            Request API access on the Access page or start with browser mode (no setup required).
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href={ROUTES.ACCESS}
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-[hsl(220_89%_35%)] transition-colors"
            >
              Request API Key
            </a>
            <a
              href={ROUTES.HOME}
              className="inline-flex px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
            >
              Try Browser OCR
            </a>
          </div>
        </div>
      </section>
    </EnterpriseLayout>
  );
}
