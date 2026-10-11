import React from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from './layouts/EnterpriseLayout';
import { CodeBlock } from './ui/CodeBlock';
import { ScrollNav } from './ui/ScrollNav';
import { ROUTES } from '../router';

export interface IntegrationSnippet {
  title: string;
  intro: string;
  filename: string;
  language: string;
  code: string;
}

export interface IntegrationDocProps {
  path: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  lead: string;
  tool: 'Playwright' | 'Cypress';
  setup: IntegrationSnippet[];
  usage: IntegrationSnippet[];
  gotchas: string[];
  faqs: { question: string; answer: string }[];
}

/** Shared layout for the per-framework integration pages (Playwright, Cypress). */
export function IntegrationDoc(p: IntegrationDocProps) {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://getrendercheck.com';
  const canonical = new URL(p.path, SITE_URL).toString();
  useSEO({ title: p.seoTitle, description: p.seoDescription, canonical });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: p.h1,
        url: canonical,
        description: p.seoDescription,
        about: { '@type': 'SoftwareApplication', name: 'RenderCheck', applicationCategory: 'DeveloperApplication', operatingSystem: 'Node.js 18+', license: 'https://opensource.org/licenses/MIT', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
      },
      {
        '@type': 'FAQPage',
        mainEntity: p.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      },
    ],
  };

  const sections = [
    { id: 'why', label: 'Why DOM tests miss this' },
    { id: 'setup', label: 'Install and set up' },
    { id: 'usage', label: 'Assertions' },
    { id: 'gotchas', label: 'Things to know' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <EnterpriseLayout
      sidebar={<ScrollNav sections={sections} />}
      breadcrumb={[{ label: 'Home', href: ROUTES.HOME }, { label: 'Developers', href: ROUTES.DEVELOPERS }, { label: `${p.tool} OCR testing` }]}
      jsonLd={jsonLd}
    >
      <section id="why" className="mb-12 scroll-mt-24">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">{p.h1}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-6">{p.lead}</p>
        <p className="text-foreground/90 mb-4">
          A DOM assertion reads the page&apos;s markup. It cannot tell you what a user sees. A <code>€</code> that should be a{' '}
          <code>$</code>, text covered by another element, or text so faint nobody can read it all pass a DOM check.
          RenderCheck screenshots the page, reads it with OCR on your machine, and fails the test when the rendered text is
          wrong. Nothing is uploaded and no API key is needed.
        </p>
        <CodeBlock
          code={`Expected to find text "[Total: $14.00]" but OCR read "[Total: €14.00]" (Confidence: 96%)
  Diff: Total: [$]14.00  →  Total: [€]14.00`}
          language="text"
          filename="Failure message"
        />
      </section>

      <section id="setup" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Install and set up</h2>
        <CodeBlock code="npm install --save-dev @rendercheck/sdk" language="bash" filename="Terminal" className="mb-4" />
        <p className="text-sm text-muted-foreground mb-6">Requires Node 18+. The English OCR data ships in the package.</p>
        {p.setup.map((s) => (
          <div key={s.title} className="mb-6">
            <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-foreground/90 mb-3">{s.intro}</p>
            <CodeBlock code={s.code} language={s.language} filename={s.filename} />
          </div>
        ))}
      </section>

      <section id="usage" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Assertions</h2>
        {p.usage.map((s) => (
          <div key={s.title} className="mb-6">
            <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-foreground/90 mb-3">{s.intro}</p>
            <CodeBlock code={s.code} language={s.language} filename={s.filename} />
          </div>
        ))}
        <p className="text-sm text-muted-foreground">
          Full option list: <a className="underline" href={ROUTES.DEVELOPERS}>developer reference</a>.
        </p>
      </section>

      <section id="gotchas" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Things to know</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground/90">
          {p.gotchas.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </section>

      <section id="faq" className="mb-12 scroll-mt-24 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">FAQ</h2>
        <div className="space-y-5">
          {p.faqs.map((f) => (
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
