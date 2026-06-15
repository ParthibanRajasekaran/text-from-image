import React, { useState } from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { ScrollNav } from '../components/ui/ScrollNav';
import { CodeBlock } from '../components/ui/CodeBlock';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ROUTES } from '../router';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'wrong-currency', label: 'Wrong Currency' },
  { id: 'missing-confirmation', label: 'Missing Confirmation' },
  { id: 'truncated-text', label: 'Truncated Text' },
  { id: 'invisible-text', label: 'Invisible Text' },
  { id: 'localisation-failure', label: 'Localisation Failure' },
];

interface ExampleCard {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  whatWentWrong: string;
  whyDOMTestsMiss: string;
  howRenderCheckCatches: string;
  playwrightPattern: string;
}

const EXAMPLES: ExampleCard[] = [
  {
    id: 'currency-swap',
    category: 'wrong-currency',
    difficulty: 'easy',
    title: 'Currency symbol swapped ($ vs £)',
    whatWentWrong: 'AI code generator output price in wrong currency based on checkout endpoint input.',
    whyDOMTestsMiss: 'DOM node exists with correct numeric value (99.99), but symbol is rendered incorrectly.',
    howRenderCheckCatches: 'Screenshot shows £99.99 when USD was expected. OCR finds "£" instead of "$".',
    playwrightPattern: `const result = await verify({
  imageBuffer: screenshot,
  expectedText: 'Total: $99.99',
  apiKey: process.env.RENDERCHECK_API_KEY,
});
expect(result.outcome).toBe('pass');`,
  },
  {
    id: 'missing-order-number',
    category: 'missing-confirmation',
    difficulty: 'medium',
    title: 'Order number missing from confirmation page',
    whatWentWrong: 'AI-generated confirmation page omitted order number in the render, though order ID exists in state.',
    whyDOMTestsMiss: 'order_id div is in the DOM with correct value, but not visible due to CSS overflow or display:none.',
    howRenderCheckCatches: 'Screenshot does not show order number. OCR extracts confirmation text without "Order #" or ID.',
    playwrightPattern: `const result = await verify({
  imageBuffer: screenshot,
  expectedText: 'Order #ABC-123-DEF',
  apiKey: process.env.RENDERCHECK_API_KEY,
});
expect(result.outcome).not.toBe('fail');`,
  },
  {
    id: 'truncated-price',
    category: 'truncated-text',
    difficulty: 'medium',
    title: 'Price truncated in summary',
    whatWentWrong: 'Total price field was given too-short width. Renders as "99.9" instead of "99.99".',
    whyDOMTestsMiss: 'DOM textContent is correct ("99.99"), but rendered display clips the final digit.',
    howRenderCheckCatches: 'OCR reads visible text on screen: "99.9". Expected "99.99" fails verification.',
    playwrightPattern: `const result = await verify({
  imageBuffer: screenshot,
  expectedText: 'Order Total: $99.99',
  apiKey: process.env.RENDERCHECK_API_KEY,
});
expect(result.outcome).toBe('pass');`,
  },
  {
    id: 'white-on-white',
    category: 'invisible-text',
    difficulty: 'hard',
    title: 'Button text invisible (white on white)',
    whatWentWrong: 'AI generated button with white text color and white background due to style copy-paste error.',
    whyDOMTestsMiss: 'Button element exists with correct text content in DOM. CSS class name is syntactically valid.',
    howRenderCheckCatches: 'Screenshot shows blank button. OCR finds no visible text. Expected "Click here" fails.',
    playwrightPattern: `const result = await verify({
  imageBuffer: screenshot,
  expectedText: 'Click here to proceed',
  apiKey: process.env.RENDERCHECK_API_KEY,
});
expect(result.outcome).toBe('pass');`,
  },
  {
    id: 'locale-date',
    category: 'localisation-failure',
    difficulty: 'hard',
    title: 'Date format wrong for locale',
    whatWentWrong: 'AI code generator output US date format (MM/DD/YYYY) on German site expecting DD.MM.YYYY.',
    whyDOMTestsMiss: 'Date value is technically correct in state. Formatting function was not locale-aware.',
    howRenderCheckCatches: 'Screenshot shows "03/15/2026" when user expects "15.03.2026" on de-DE locale.',
    playwrightPattern: `await page.goto('https://example.de/checkout?locale=de-DE');
const result = await verify({
  imageBuffer: screenshot,
  expectedText: '15.03.2026',
  apiKey: process.env.RENDERCHECK_API_KEY,
});
expect(result.outcome).toBe('pass');`,
  },
];

export default function AIUIBugGallery() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/ai-ui-bug-gallery', SITE_URL).toString();

  useSEO({
    title: 'AI UI Bug Gallery — 50 Ways AI-Generated UI Can Fail Visual Verification',
    description: 'Real-world examples of AI-generated UI bugs that pass code tests but fail visible-output verification. Learn what RenderCheck catches.',
    canonical: canonicalAbsolute,
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(EXAMPLES.map((ex) => ex.category)));
  const filteredExamples = selectedCategory
    ? EXAMPLES.filter((ex) => ex.category === selectedCategory)
    : EXAMPLES;

  return (
    <EnterpriseLayout
      sidebar={<ScrollNav sections={sections} />}
      breadcrumb={[
        { label: 'Home', href: ROUTES.HOME },
        { label: 'Labs', href: ROUTES.LABS },
        { label: 'AI UI Bug Gallery' },
      ]}
    >
      {/* Hero */}
      <section id="overview" className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">AI UI Bug Gallery</h1>
          <StatusBadge variant="live" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Real-world examples of AI-generated UI bugs that pass all code tests but fail visible-output verification.
        </p>
        <p className="text-sm text-muted-foreground mt-4 max-w-2xl">
          All examples are synthetic and educational. Not real customer incidents.
        </p>
      </section>

      {/* Filters */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-foreground hover:border-primary/50'
            }`}
          >
            All ({EXAMPLES.length})
          </button>
          {categories.map((cat) => {
            const count = EXAMPLES.filter((ex) => ex.category === cat).length;
            const label = cat
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-foreground hover:border-primary/50'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Gallery */}
      <section className="space-y-6">
        {filteredExamples.map((example) => (
          <div key={example.id} className="border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{example.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      example.difficulty === 'easy'
                        ? 'bg-green-500/20 text-green-300'
                        : example.difficulty === 'medium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {example.difficulty.charAt(0).toUpperCase() + example.difficulty.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground text-sm">What went wrong</h4>
                <p className="text-sm text-foreground/80 mt-1">{example.whatWentWrong}</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm">Why DOM tests miss it</h4>
                <p className="text-sm text-foreground/80 mt-1">{example.whyDOMTestsMiss}</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm">How RenderCheck catches it</h4>
                <p className="text-sm text-foreground/80 mt-1">{example.howRenderCheckCatches}</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-2">Playwright pattern</h4>
                <CodeBlock
                  code={example.playwrightPattern}
                  language="typescript"
                  filename="test.spec.ts"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="border-t pt-8 mt-12 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Want to contribute?</h3>
        <p className="text-foreground/80">
          Have a real-world AI UI verification gap? Share it as a GitHub issue to help build this gallery.
        </p>
        <a
          href="https://github.com/ParthibanRajasekaran/text-from-image/issues/new?labels=gallery-submission"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-[hsl(220_89%_35%)] transition-colors"
        >
          Submit an example
        </a>
      </section>

      {/* Next Steps */}
      <section className="border-t pt-8 mt-8 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Ready to catch these bugs?</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={ROUTES.RENDERCHECK}
            className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-[hsl(220_89%_35%)] transition-colors"
          >
            Learn RenderCheck
          </a>
          <a
            href={ROUTES.ACCESS}
            className="inline-flex px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
          >
            Request API Access
          </a>
        </div>
      </section>
    </EnterpriseLayout>
  );
}
