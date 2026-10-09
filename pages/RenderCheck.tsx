import React, { Suspense } from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { ScrollNav } from '../components/ui/ScrollNav';
import { CodeBlock } from '../components/ui/CodeBlock';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ROUTES } from '../router';

// Loaded on demand: the demo pulls in the OCR client and analysis code.
const HeroDemo = React.lazy(() => import('../components/HeroDemo'));

const sections = [
  { id: 'problem', label: 'The Problem' },
  { id: 'solution', label: 'How It Works' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'comparison', label: 'vs Other Approaches' },
  { id: 'install', label: 'Install' },
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'api', label: 'API Reference' },
  { id: 'limitations', label: 'Limitations' },
];

export default function RenderCheck() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/rendercheck', SITE_URL).toString();

  useSEO({
    title: 'RenderCheck — Verify Rendered UI Text in Playwright & Cypress',
    description: 'RenderCheck: OCR-based verification for AI-generated UI. Catch bugs where DOM tests pass but visible text is wrong. Works with Playwright, Cypress, and any E2E tool.',
    canonical: canonicalAbsolute,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RenderCheck',
    description: 'OCR-based verification for AI-generated UI',
    url: canonicalAbsolute,
    operatingSystem: 'Any',
    applicationCategory: 'DeveloperApplication',
  };

  return (
    <EnterpriseLayout
      sidebar={<ScrollNav sections={sections} />}
      breadcrumb={[
        { label: 'Home', href: ROUTES.HOME },
        { label: 'RenderCheck' },
      ]}
      jsonLd={jsonLd}
    >
      {/* Hero */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">RenderCheck</h1>
          <StatusBadge variant="developer-beta" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Verify what users actually see in AI-generated UI.
        </p>
      </section>

      <Suspense fallback={<div className="mb-12 h-64 rounded-2xl border border-white/10 bg-[#0B0D12]" aria-hidden="true" />}>
        <HeroDemo className="mb-12" />
      </Suspense>

      <div className="space-y-12">
        {/* Problem */}
        <section id="problem" className="border-t pt-8 scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-6">The Problem</h2>
          <div className="space-y-4">
            <p className="text-foreground/90">
              AI coding tools generate UI fast. But your tests pass while users see:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-2">
              <li>Wrong currency ($ vs £)</li>
              <li>Broken confirmations (missing order numbers)</li>
              <li>Invisible text (white on white)</li>
              <li>Truncated messages</li>
              <li>Localisation failures (date formats, translated text)</li>
            </ul>
            <p className="text-foreground/90 font-medium">
              DOM tests pass. DOM is correct. Logic is correct. But visible text is wrong.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section id="solution" className="border-t pt-8 scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-6">How RenderCheck Works</h2>
          <p className="text-foreground/90 mb-4">
            RenderCheck compares rendered-output text against your expectations in Playwright and Cypress tests.
          </p>
          <ol className="space-y-3 text-foreground/90">
            <li>
              <strong>1. Take a screenshot</strong> — Use `page.screenshot()` in Playwright or `cy.screenshot()` in Cypress
            </li>
            <li>
              <strong>2. Pass to verify()</strong> — Call RenderCheck with the image and expected text
            </li>
            <li>
              <strong>3. Get results</strong> — `outcome: 'pass'` if all expected text found, `'fail'` if not
            </li>
            <li>
              <strong>4. Assert</strong> — `expect(result.outcome).toBe('pass')` in your test
            </li>
          </ol>
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="border-t pt-8 scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-6">Use Cases</h2>
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">AI-Generated UI</h3>
              <p className="text-sm text-foreground/90">
                Verify that AI coding assistants generated the correct UI. Catch when LLMs hallucinate button labels or missing copy.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Localisation Testing</h3>
              <p className="text-sm text-foreground/90">
                Verify translated text, locale-specific formatting (dates, currency, numbers), and RTL layout.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Critical Confirmations</h3>
              <p className="text-sm text-foreground/90">
                Ensure order numbers, payment confirmations, and legal disclaimers appear correctly after state changes.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Generated Documents</h3>
              <p className="text-sm text-foreground/90">
                Verify PDFs, invoices, and dynamic reports render correctly before sending to users.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section id="comparison" className="border-t pt-8 scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-6">vs Other Approaches</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Approach</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Verifies</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Limitation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">DOM assertions</td>
                  <td className="py-3 px-4 text-foreground/90">Page structure, text nodes</td>
                  <td className="py-3 px-4 text-foreground/80">Can miss rendered visual issues</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">Screenshot diffing</td>
                  <td className="py-3 px-4 text-foreground/90">Pixel changes</td>
                  <td className="py-3 px-4 text-foreground/80">Noisy, doesn't parse text meaning</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">Manual review</td>
                  <td className="py-3 px-4 text-foreground/90">Human judgment</td>
                  <td className="py-3 px-4 text-foreground/80">Slow, inconsistent</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-foreground">RenderCheck</td>
                  <td className="py-3 px-4 text-foreground/90">Visible text in screenshots</td>
                  <td className="py-3 px-4 text-foreground/80">OCR accuracy depends on image quality</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Install */}
        <section id="install" className="border-t pt-8 scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-6">Install</h2>
          <CodeBlock
            code="npm install @freetextfromimage/rendercheck"
            language="bash"
            filename="Terminal"
            className="mb-4"
          />
          <p className="text-sm text-foreground/90">
            Available on npm as <code className="bg-code-bg text-code-text px-1 rounded">@freetextfromimage/rendercheck</code>. Requires Node ≥18.
          </p>
        </section>

        {/* Quick Start */}
        <section id="quick-start" className="border-t pt-8 scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Start</h2>
          <CodeBlock
            code={`import { verify } from '@freetextfromimage/rendercheck';

test('checkout shows correct currency', async ({ page }) => {
  await page.goto('https://example.com/checkout');
  const screenshot = await page.screenshot();

  const result = await verify({
    imageBuffer: screenshot,
    expectedText: 'Total: £99.99',
    apiKey: process.env.RENDERCHECK_API_KEY,
  });

  expect(result.outcome).toBe('pass');
});`}
            language="typescript"
            filename="checkout.spec.ts"
          />
        </section>

        {/* API Reference */}
        <section id="api" className="border-t pt-8 scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-6">API Reference</h2>

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
            filename="types.ts"
            className="mb-6"
          />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Return Value Meanings</h3>
              <ul className="space-y-2 text-sm text-foreground/90">
                <li>
                  <strong>pass:</strong> All expected words found
                </li>
                <li>
                  <strong>partial:</strong> Some expected words found
                </li>
                <li>
                  <strong>fail:</strong> No expected words found or error
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section id="limitations" className="border-t pt-8 scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-6">Limitations</h2>
          <div className="space-y-3">
            <p className="text-foreground/90">
              <strong>Verifies visible text only.</strong> Does not check layout, colour, spacing, or accessibility.
            </p>
            <p className="text-foreground/90">
              <strong>OCR accuracy depends on image quality.</strong> High-contrast, clear text yields best results.
            </p>
            <p className="text-foreground/90">
              <strong>Not a replacement for visual regression testing.</strong> Use alongside tools like Percy or Chromatic for visual assertions.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t pt-8 bg-primary/10 border-primary/20 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Ready to verify rendered UI?</h3>
          <p className="text-muted-foreground mb-6">Request API access and start catching UI bugs in your tests.</p>
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
              Try Browser Tool
            </a>
          </div>
        </section>
      </div>
    </EnterpriseLayout>
  );
}
