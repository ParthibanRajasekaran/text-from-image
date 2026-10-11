import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { CodeBlock } from '../components/ui/CodeBlock';
import { ScrollNav } from '../components/ui/ScrollNav';
import { ROUTES } from '../router';

// One example per category, taken from dataset/ai-ui-verification/examples.json (50 curated patterns, 10 per category).
const EXAMPLES = [
  { category: 'Wrong currency', expected: 'Total: £99.99', shown: 'Total: $99.99', why: 'Currency symbols default to USD without explicit locale handling.' },
  { category: 'Missing confirmation', expected: 'Payment Successful', shown: 'Redirecting...', why: 'The confirmation text is omitted from the success state.' },
  { category: 'Truncated text', expected: 'Error: Invalid email address format', shown: 'Error: Invalid email addr...', why: 'Text overflow is not handled in the error display.' },
  { category: 'Localisation mismatch', expected: '15/06/2026', shown: '06/15/2026', why: 'Date formatting does not follow the locale.' },
  { category: 'Invisible text', expected: 'Continue to checkout', shown: '(nothing visible)', why: 'The text colour matches the background.' },
];

const FAQS = [
  { question: 'What is verification debt?', answer: 'Verification debt is the gap between what your tests assert and what users actually see on screen. It grows when code, especially AI-generated code, ships faster than anyone checks the rendered result.' },
  { question: 'Is verification debt the same as technical debt?', answer: 'No. Technical debt is about the cost of code structure. Verification debt is about unchecked behaviour: the code and its tests can be tidy while the visible text is still wrong.' },
  { question: 'How do I reduce verification debt?', answer: 'Add assertions that read the rendered screen instead of the DOM. For example, use OCR-based assertions in Playwright or Cypress on the pages that show money, dates, legal copy and confirmations.' },
  { question: 'Can I measure it?', answer: 'The Verification Debt Score on this site is a self-assessment questionnaire. It gives a rough band, not a measurement, and everything runs in your browser.' },
];

export default function WhatIsVerificationDebt() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://getrendercheck.com';
  const canonical = new URL(ROUTES.WHAT_IS_VERIFICATION_DEBT, SITE_URL).toString();
  const description =
    'Verification debt is the gap between what your tests assert and what users see. Learn the five common failure types, with examples, and how to catch them in CI.';
  useSEO({ title: 'What Is Verification Debt? AI UI Testing Explained | RenderCheck', description, canonical });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'TechArticle', headline: 'What is verification debt?', url: canonical, description, author: { '@type': 'Person', name: 'Parthiban Rajasekaran' } },
      { '@type': 'DefinedTerm', name: 'Verification debt', url: canonical, description: FAQS[0].answer, inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'RenderCheck glossary', url: canonical } },
      { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) },
    ],
  };

  const sections = [
    { id: 'definition', label: 'Definition' },
    { id: 'why-ai', label: 'Why AI makes it worse' },
    { id: 'five-types', label: 'Five failure types' },
    { id: 'pay-down', label: 'Paying it down' },
    { id: 'limits', label: 'What this does not cover' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <EnterpriseLayout
      sidebar={<ScrollNav sections={sections} />}
      breadcrumb={[{ label: 'Home', href: ROUTES.HOME }, { label: 'Verification debt' }]}
      jsonLd={jsonLd}
    >
      <section id="definition" className="mb-12 scroll-mt-24">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">What is verification debt?</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-6">
          Verification debt is the gap between what your tests assert and what users actually see on screen.
        </p>
        <p className="text-foreground/90 mb-4">
          A test suite can be green while the page shows the wrong currency, a cut-off error message or text nobody can
          read. Each time code ships without someone or something checking the rendered result, that gap grows. Like
          other debt, it is cheap to ignore today and expensive when it surfaces in front of a customer.
        </p>
        <p className="text-foreground/90">
          The term is used here for a specific, checkable thing: visible text that differs from what the code and its
          tests say should be there.
        </p>
      </section>

      <section id="why-ai" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Why AI-generated UI makes it worse</h2>
        <p className="text-foreground/90 mb-4">
          AI coding tools produce plausible components quickly, and the tests that come with them usually assert on the
          DOM: an element exists, a string is present in the markup. Both can be true while the screen is wrong. When
          volume goes up and review time does not, more of that output goes unchecked.
        </p>
        <p className="text-foreground/90">
          This is a reasoned argument, not a measured rate. There are no public figures here for how often it happens, and
          we do not claim any.
        </p>
      </section>

      <section id="five-types" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Five failure types</h2>
        <p className="text-foreground/90 mb-6">
          The{' '}
          <Link className="underline" to={ROUTES.AI_UI_BUG_GALLERY}>
            AI UI bug gallery
          </Link>{' '}
          and its open dataset group 50 curated failure patterns into five categories, 10 each. They are written examples
          of the patterns, not a count of real incidents. One of each:
        </p>
        <div className="space-y-4">
          {EXAMPLES.map((e) => (
            <div key={e.category} className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">{e.category}</h3>
              <p className="text-sm text-muted-foreground">
                Expected <code className="text-foreground">{e.expected}</code>, screen shows{' '}
                <code className="text-foreground">{e.shown}</code>.
              </p>
              <p className="text-sm text-foreground/90 mt-1">{e.why}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pay-down" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Paying it down</h2>
        <ol className="list-decimal pl-6 space-y-2 text-foreground/90 mb-6">
          <li>List the screens where wrong text is costly: prices, totals, dates, legal copy, confirmations.</li>
          <li>Add one rendered-text assertion per screen, not one per component.</li>
          <li>Run them in CI. Keep the confidence threshold realistic for your fonts.</li>
        </ol>
        <CodeBlock
          code={`import { expect } from '@rendercheck/sdk/playwright';

await expect(page).toShowText('Total: $14.00', { minConfidence: 85 });`}
          language="typescript"
          filename="checkout.spec.ts"
          className="mb-4"
        />
        <p className="text-foreground/90">
          Setup guides for{' '}
          <Link className="underline" to={ROUTES.PLAYWRIGHT_OCR_TESTING}>
            Playwright
          </Link>{' '}
          and{' '}
          <Link className="underline" to={ROUTES.CYPRESS_OCR_TESTING}>
            Cypress
          </Link>
          . To see where your team stands, try the{' '}
          <Link className="underline" to={ROUTES.VERIFY_DEBT_SCORE}>
            Verification Debt Score
          </Link>
          , a short self-assessment.
        </p>
      </section>

      <section id="limits" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">What this does not cover</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground/90">
          <li>OCR is probabilistic. It can misread unusual fonts or small text, so thresholds need tuning.</li>
          <li>It checks that specific text is visible and legible. It is not a full visual regression tool.</li>
          <li>Layout, colour and behaviour bugs that do not change visible text are out of scope.</li>
        </ul>
      </section>

      <section id="faq" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">FAQ</h2>
        <div className="space-y-5">
          {FAQS.map((f) => (
            <div key={f.question}>
              <h3 className="font-semibold text-foreground mb-1">{f.question}</h3>
              <p className="text-foreground/90">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </EnterpriseLayout>
  );
}
