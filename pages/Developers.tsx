import React from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CodeBlock } from '../components/ui/CodeBlock';
import { ScrollNav } from '../components/ui/ScrollNav';
import { ROUTES } from '../router';

/**
 * Developers Page: SDK reference and quick-start guides (local-only; no hosted API)
 * - Product state matrix (Live, Beta, Planned)
 * - npm package info
 * - Code examples (npm install, basic usage, Playwright integration)
 * - Reference (toShowText / cy.matchText options, verifyText report)
 * - DevFAQ
 */
export default function Developers() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/developers', SITE_URL).toString();

  useSEO({
    title: 'RenderCheck Developers — SDK Reference & Quick Start',
    description:
      'RenderCheck SDK documentation and examples for Playwright and Cypress. OCR runs on your machine: no API key, no upload. npm install @freetextfromimage/rendercheck.',
    canonical: canonicalAbsolute,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    name: 'RenderCheck Developer Documentation',
    url: canonicalAbsolute,
    description: 'Developer docs and SDK reference for RenderCheck',
  };

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'product-state', label: 'Product State' },
    { id: 'install', label: 'Install' },
    { id: 'quick-start', label: 'Quick Start' },
    { id: 'reference', label: 'Reference' },
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
              <h3 className="font-semibold text-foreground">RenderCheck SDK</h3>
              <StatusBadge variant="developer-beta" />
            </div>
            <p className="text-sm text-muted-foreground">
              npm package for Playwright and Cypress. OCR runs on your machine: no API key, no upload, no network
              calls. The Cypress integration has not yet been run inside a real Cypress.
            </p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">Hosted API</h3>
              <StatusBadge variant="planned" />
            </div>
            <p className="text-sm text-muted-foreground">
              The hosted API has been retired. There is nothing to sign up for and nothing is sent to our servers.
            </p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">CLI Tool</h3>
              <StatusBadge variant="planned" />
            </div>
            <p className="text-sm text-muted-foreground">
              Command-line interface for one-off OCR verification. Not started.
            </p>
          </div>
        </div>
      </section>

      {/* Install */}
      <section id="install" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Install</h2>

        <CodeBlock
          code="npm install --save-dev @freetextfromimage/rendercheck"
          language="bash"
          filename="Terminal"
          className="mb-4"
        />

        <div className="p-4 bg-muted/50 border border-border rounded-lg">
          <p className="text-sm text-foreground/90">
            Requires Node 18+ and <code>@playwright/test</code> 1.40+ or <code>cypress</code> 12+. The English language
            data ships in the package.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quick-start" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Quick Start</h2>

        <p className="text-foreground/90 mb-4">
          In Playwright, import <code>expect</code> from RenderCheck. It is Playwright&apos;s own <code>expect</code> with{' '}
          <code>toShowText</code> added:
        </p>

        <CodeBlock
          code={`import { test } from '@playwright/test';
import { expect } from '@freetextfromimage/rendercheck/playwright';

test('checkout shows the right total', async ({ page }) => {
  await page.goto('/checkout');

  await expect(page).toShowText('Total: $14.00', {
    minConfidence: 85,      // OCR confidence of the matched words (default 80)
    minContrastRatio: 4.5,  // WCAG contrast of the matched words (off unless set)
  });
});`}
          language="typescript"
          filename="checkout.spec.ts"
          className="mb-6"
        />

        <p className="text-foreground/90 mb-4">When the screen disagrees with what you expect, the test fails with:</p>

        <CodeBlock
          code={`Expected to find text "[Total: $14.00]" but OCR read "[Total: €14.00]" (Confidence: 96%)
  Diff: Total: [$]14.00  →  Total: [€]14.00`}
          language="text"
          className="mb-4"
        />
      </section>

      {/* Reference */}
      <section id="reference" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Reference</h2>

        <h3 className="text-lg font-semibold text-foreground mb-3">Options</h3>
        <p className="text-foreground/90 mb-4">
          Shared by <code>toShowText</code>, <code>cy.matchText</code> and <code>verifyText</code>.
        </p>

        <CodeBlock
          code={`interface AssertionOptions {
  region?: { x: number; y: number; width: number; height: number }; // screenshot pixels
  minConfidence?: number;     // 0-100, default 80
  minContrastRatio?: number;  // WCAG, e.g. 4.5 (normal text) or 3 (large text). Off unless set
  exact?: boolean;            // text must equal the expected text, not just contain it
  ignoreCase?: boolean;       // default false
  dom?: boolean;              // with a Locator, also compare with innerText. Default true
  timeout?: number;           // Playwright retry window in ms. Default 5000
  interval?: number;          // Playwright pause between attempts in ms. Default 250
  fullPage?: boolean;         // Playwright: capture the whole scrollable page
  lang?: string;              // Tesseract language code. Default 'eng'
  langPath?: string;          // folder with <lang>.traineddata.gz for other languages
}`}
          language="typescript"
          className="mb-6"
        />

        <h3 className="text-lg font-semibold text-foreground mb-3">verifyText (core)</h3>
        <p className="text-foreground/90 mb-4">
          The framework-free function behind the matchers. Takes a PNG or JPEG buffer and returns a report.
        </p>

        <CodeBlock
          code={`import { verifyText } from '@freetextfromimage/rendercheck/core';

const report = await verifyText({
  image: fs.readFileSync('screenshot.png'),
  expected: 'Total: $14.00',
  options: { minContrastRatio: 4.5 },
});
if (!report.pass) console.error(report.message);

// report.failure: 'NOT_FOUND' | 'LOW_CONFIDENCE' | 'INSUFFICIENT_CONTRAST' | 'DOM_MISMATCH'
// report.read, report.confidence (0-100), report.similarity (0-1), report.minContrast`}
          language="typescript"
          className="mb-6"
        />

        <h3 className="text-lg font-semibold text-foreground mb-3">Failure kinds</h3>
        <ul className="space-y-2 text-foreground/90 mb-6">
          <li>
            <strong>NOT_FOUND:</strong> the expected text is not in the rendered pixels (also when the DOM has it but the
            screen does not show it)
          </li>
          <li>
            <strong>LOW_CONFIDENCE:</strong> the text was found but OCR confidence is below <code>minConfidence</code>
          </li>
          <li>
            <strong>INSUFFICIENT_CONTRAST:</strong> the text is readable but below <code>minContrastRatio</code>
          </li>
          <li>
            <strong>DOM_MISMATCH:</strong> the element&apos;s DOM text and its pixels disagree
          </li>
        </ul>
      </section>

      {/* Examples */}
      <section id="examples" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Examples</h2>

        <h3 className="text-lg font-semibold text-foreground mb-3">Playwright: one element and a region</h3>
        <CodeBlock
          code={`import { test } from '@playwright/test';
import { expect } from '@freetextfromimage/rendercheck/playwright';

test('order confirmation displays the order number', async ({ page }) => {
  await page.goto('/order-confirmation');

  // One element: also compared with its DOM text.
  await expect(page.locator('#order-number')).toShowText('Order #ABC123456');

  // Only part of the screenshot.
  await expect(page).toShowText('Pay now', { region: { x: 120, y: 340, width: 200, height: 40 } });

  await expect(page).not.toShowText('Total: €14.00');
});`}
          language="typescript"
          filename="order.spec.ts"
          className="mb-6"
        />

        <h3 className="text-lg font-semibold text-foreground mb-3">Cypress</h3>
        <CodeBlock
          code={`// cypress.config.ts
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
cy.get('#total').matchText('Total: $14.00');`}
          language="typescript"
          className="mb-4"
        />
        <p className="text-sm text-muted-foreground mb-6">
          The Cypress integration is covered by unit tests with a fake <code>cy</code>, but has not been run inside a
          real Cypress yet.
        </p>
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
              <p>No. There is no hosted API. OCR runs in your test process with Tesseract.js (WebAssembly).</p>
            </div>
          </details>

          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary">
              What happens to my screenshots?
            </summary>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>
                They never leave your machine. The package makes no network requests, and Tesseract&apos;s cache is
                switched off, so nothing is written to your project either.
              </p>
            </div>
          </details>

          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary">
              Is OCR accuracy guaranteed?
            </summary>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>
                No. OCR can misread <code>l</code>/<code>I</code>/<code>1</code> and <code>O</code>/<code>0</code>, and it
                can skip very faint text or light text on a busy coloured background. Scope the assertion to an element
                or a <code>region</code> for best results. Contrast is measured on pixels, so treat it as an estimate.
              </p>
            </div>
          </details>

          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary">
              Which languages are supported?
            </summary>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>
                English out of the box. For other languages, point <code>langPath</code> at a folder with the matching{' '}
                <code>.traineddata.gz</code> file and set <code>lang</code>.
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
            Install the package and run your first assertion. No account and no key.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="https://github.com/ParthibanRajasekaran/text-from-image/tree/main/packages/rendercheck"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-[hsl(220_89%_35%)] transition-colors"
            >
              View on GitHub
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
