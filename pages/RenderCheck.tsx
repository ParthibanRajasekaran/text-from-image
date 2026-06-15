import React from 'react';
import { useSEO } from '../src/seo';
import { ContentLayout } from '../components/layouts/ContentLayout';
import { ScrollNav } from '../components/ui/ScrollNav';
import { Glass } from '../components/ui/Glass';
import { AuroraBackground } from '../components/AuroraBackground';

interface Section {
  id: string;
  title: string;
}

const sections: Section[] = [
  { id: 'problem', title: 'The Problem' },
  { id: 'install', title: 'Install' },
  { id: 'quick-start', title: 'Quick Start' },
  { id: 'playwright', title: 'Playwright Integration' },
  { id: 'cypress', title: 'Cypress Integration' },
  { id: 'api', title: 'API Reference' },
  { id: 'limitations', title: 'Limitations' },
];

export default function RenderCheck() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/rendercheck', SITE_URL).toString();

  useSEO({
    title: 'RenderCheck — Verify Rendered UI Text in Playwright & Cypress',
    description: 'RenderCheck: OCR-based verification for AI-generated UI. Catch bugs where DOM tests pass but visible text is wrong. Works with Playwright, Cypress, and any E2E tool.',
    canonical: canonicalAbsolute,
  });

  return (
    <ContentLayout>
        <div className="relative">
          <AuroraBackground className="absolute inset-0 opacity-30" />

          <div className="relative z-10">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  RenderCheck
                </h1>
                <p className="text-xl text-muted-foreground">
                  Verify what users actually see in AI-generated UI.
                </p>
              </div>

              <div className="flex flex-col gap-2 mb-8">
                <span className="inline-block w-fit px-3 py-1 bg-amber-100/30 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                  Developer Beta
                </span>
              </div>
            </div>

            <ScrollNav sections={sections} />

            <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
              {/* Problem */}
              <section id="problem" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">The Problem</h2>
                <div className="space-y-4">
                  <p className="text-lg text-muted-foreground">
                    AI coding tools generate UI fast. But your tests pass while users see:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                    <li>Wrong currency ($ vs £)</li>
                    <li>Broken confirmations (missing order numbers)</li>
                    <li>Invisible text (white on white)</li>
                    <li>Truncated messages</li>
                    <li>Localisation failures (date formats, translated text)</li>
                  </ul>
                  <p className="text-lg text-muted-foreground mt-4">
                    <strong>DOM tests pass. DOM is correct. Logic is correct. But visible text is wrong.</strong>
                  </p>
                  <p className="text-muted-foreground">
                    RenderCheck catches this by comparing rendered-output text against your expectations in Playwright and Cypress tests.
                  </p>
                </div>
              </section>

              {/* Install */}
              <section id="install" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">Install</h2>
                <Glass className="p-6">
                  <pre className="text-sm overflow-x-auto">
                    <code>npm install @freetextfromimage/rendercheck</code>
                  </pre>
                </Glass>
                <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    Available on npm as <code className="text-primary font-mono">@freetextfromimage/rendercheck</code>.
                    <br />
                    Requires Node 18+. Compatible with Playwright, Cypress, and any testing framework.
                  </p>
                </div>
              </section>

              {/* Quick Start */}
              <section id="quick-start" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
                <p className="text-muted-foreground mb-4">
                  Basic usage with Playwright:
                </p>
                <Glass className="p-6">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`import { verify } from '@freetextfromimage/rendercheck';

test('checkout shows correct currency', async ({ page }) => {
  await page.goto('https://example.com/checkout');
  const screenshot = await page.screenshot();

  const result = await verify({
    imageBuffer: screenshot,
    expectedText: 'Total: £99.99',
    apiKey: process.env.FTFI_API_KEY,
  });

  expect(result.outcome).toBe('pass');
});`}</code>
                  </pre>
                </Glass>
              </section>

              {/* Playwright */}
              <section id="playwright" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">Playwright Integration</h2>
                <p className="text-muted-foreground mb-4">
                  Works seamlessly with Playwright&apos;s screenshot and expect utilities:
                </p>
                <Glass className="p-6">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`import { test, expect } from '@playwright/test';
import { verify } from '@freetextfromimage/rendercheck';

test('order confirmation shows order number', async ({ page }) => {
  await page.goto('/order-confirmation');
  const screenshot = await page.screenshot();

  const result = await verify({
    imageBuffer: screenshot,
    expectedText: 'Order #ABC123456',
    apiKey: process.env.FTFI_API_KEY,
  });

  expect(result.outcome).not.toBe('fail');
  expect(result.foundWords).toContain('ABC123456');
});`}</code>
                  </pre>
                </Glass>
              </section>

              {/* Cypress */}
              <section id="cypress" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">Cypress Integration</h2>
                <p className="text-muted-foreground mb-4">
                  Works with Cypress screenshot capture and custom commands:
                </p>
                <Glass className="p-6">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`import { verify } from '@freetextfromimage/rendercheck';

describe('Payment Flow', () => {
  it('shows payment success message', () => {
    cy.visit('/checkout');
    cy.get('[data-test=pay-button]').click();
    cy.screenshot('payment-success', { capture: 'viewport' });

    cy.readFile('cypress/screenshots/payment-success.png', 'base64').then(screenshot => {
      verify({
        imageBuffer: Buffer.from(screenshot, 'base64'),
        expectedText: 'Payment Successful',
        apiKey: Cypress.env('FTFI_API_KEY'),
      }).then(result => {
        expect(result.outcome).to.equal('pass');
      });
    });
  });
});`}</code>
                  </pre>
                </Glass>
              </section>

              {/* API Reference */}
              <section id="api" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">API Reference</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">verify(options)</h3>
                    <p className="text-muted-foreground mb-4">
                      Main verification function. Compares rendered text against expected output.
                    </p>
                    <Glass className="p-4 mb-4">
                      <pre className="text-sm overflow-x-auto">
                        <code>{`interface VerifyOptions {
  imagePath?: string;           // Path to image file (or use imageBuffer)
  imageBuffer?: Buffer;         // Raw image buffer (or use imagePath)
  expectedText: string;         // Text you expect to find
  apiKey?: string;              // Optional: for API mode (default: local)
}

interface VerificationResult {
  outcome: 'pass' | 'fail' | 'partial';
  foundWords: string[];         // Words found in image
  missingWords: string[];       // Words from expectedText not found
  extractedText: string;        // Full text extracted from image
  confidence: number;           // OCR confidence (0-1)
  message: string;              // Human-readable result
}`}</code>
                      </pre>
                    </Glass>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Modes</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <strong>API Mode</strong> (recommended): Provide <code className="text-primary font-mono">apiKey</code> to use FreeTextFromImage cloud OCR.
                      </li>
                      <li>
                        <strong>Local Mode</strong>: Not yet implemented. Contact us for browser-based OCR support.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Return Value Meanings</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <strong>pass</strong>: All expected words found in rendered text.
                      </li>
                      <li>
                        <strong>partial</strong>: Some but not all expected words found.
                      </li>
                      <li>
                        <strong>fail</strong>: No expected words found or OCR error.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Limitations */}
              <section id="limitations" className="scroll-mt-24 pb-12">
                <h2 className="text-3xl font-bold mb-6">Limitations</h2>
                <div className="bg-muted/50 p-6 rounded-lg border border-border space-y-3">
                  <p className="text-muted-foreground">
                    <strong>Verifies visible text only.</strong> Does not check layout, colour, spacing, or accessibility.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>OCR accuracy depends on image quality.</strong> High-contrast, clear text yields best results.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Not a replacement for visual regression testing.</strong> Use alongside tools like Percy or Chromatic for visual assertions.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>API key required.</strong> Local OCR mode coming in future release.
                  </p>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-lg border border-primary/20 text-center space-y-4">
                <h3 className="text-2xl font-bold">Get an API Key</h3>
                <p className="text-muted-foreground">
                  Free tier available. Start verifying rendered UI in minutes.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <a
                    href="/beta"
                    className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Request API Key
                  </a>
                  <a
                    href="/"
                    className="inline-block px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Try Browser Demo
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </ContentLayout>
    );
  }
