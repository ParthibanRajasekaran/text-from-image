import React from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { ScrollNav } from '../components/ui/ScrollNav';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ROUTES } from '../router';

const sections = [
  { id: 'changelog', label: 'Changelog' },
];

interface ChangelogEntry {
  date: string;
  title: string;
  status: 'live' | 'developer-beta' | 'planned';
  description: string;
  category: string;
}

const ENTRIES: ChangelogEntry[] = [
  {
    date: '2026-06-15',
    title: 'RenderCheck npm package published (v0.1.0)',
    status: 'live',
    category: 'Product',
    description:
      '@freetextfromimage/rendercheck published to npm with full TypeScript support, Playwright and Cypress examples, and MIT license. Available for immediate installation and use in E2E test suites.',
  },
  {
    date: '2026-06-15',
    title: 'Verification Debt Score tool launched',
    status: 'live',
    category: 'Labs',
    description:
      'Interactive 9-question self-assessment tool for teams to evaluate AI-generated UI verification maturity. Score bands (0-25 low, 26-50 moderate, 51-75 high, 76-100 critical) with personalized recommendations.',
  },
  {
    date: '2026-06-15',
    title: 'AI UI Bug Gallery published',
    status: 'live',
    category: 'Labs',
    description:
      'Educational gallery of synthetic examples of AI-generated UI bugs that pass code tests but fail visible verification. Categorized by type with Playwright test patterns for each.',
  },
  {
    date: '2026-06-15',
    title: 'OCR Challenge Lab with Challenge of the Week',
    status: 'live',
    category: 'Labs',
    description:
      'Weekly verification practice challenges with real-world locale, formatting, and rendering scenarios. Shareable result cards for team discussion.',
  },
  {
    date: '2026-06-15',
    title: 'Security headers and CSP deployed',
    status: 'live',
    category: 'Security',
    description:
      'Content Security Policy, X-Frame-Options, and other security headers now enforced across all pages. The site shows no ads and loads no third-party scripts.',
  },
  {
    date: '2026-06-15',
    title: 'Browser OCR launched (Beta)',
    status: 'live',
    category: 'Product',
    description:
      'Free browser-based OCR using Tesseract.js WASM. No signup, no API key, no image persistence. Works fully offline.',
  },
];

export default function Changelog() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://getrendercheck.com';
  const canonicalAbsolute = new URL('/changelog', SITE_URL).toString();

  useSEO({
    title: 'RenderCheck Changelog: Product Updates and Development',
    description: 'Track RenderCheck development: new features, API changes, and product milestones. See what\'s live, in beta, and planned.',
    canonical: canonicalAbsolute,
  });

  const categories = Array.from(new Set(ENTRIES.map((e) => e.category)));

  return (
    <EnterpriseLayout
      sidebar={<ScrollNav sections={sections} />}
      breadcrumb={[
        { label: 'Home', href: ROUTES.HOME },
        { label: 'Changelog' },
      ]}
    >
      {/* Hero */}
      <section className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Changelog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Product updates, feature releases, and development milestones for RenderCheck. Transparency about what's live, in beta, and planned.
        </p>
      </section>

      {/* Changelog */}
      <section id="changelog" className="space-y-6">
        {ENTRIES.map((entry, index) => (
          <div key={index} className="border-l-4 border-primary/30 pl-6 pb-6">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{entry.date}</p>
                </div>
                <StatusBadge variant={entry.status} size="sm" />
              </div>

              <p className="text-foreground/80">{entry.description}</p>

              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                  {entry.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Roadmap Teaser */}
      <section className="border-t pt-8 mt-12 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">What's Next?</h2>
        <div className="space-y-3 text-foreground/80">
          <p>Coming in development:</p>
          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>Direct HTTP API access (graduating from beta)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>GitHub Action for automated visual verification in CI/CD</span>
            </li>
            <li className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>CLI tool for standalone OCR verification</span>
            </li>
            <li className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>Team dashboard for tracking verification metrics</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Get Involved */}
      <section className="border-t pt-8 mt-8 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Want to shape what's next?</h3>
        <p className="text-foreground/80">
          Early access users and beta testers directly influence the roadmap. Try the SDK and tell us what breaks. No account or API key needed.
        </p>
        <a
          href={ROUTES.ACCESS}
          className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-[hsl(220_89%_35%)] transition-colors"
        >
          Get RenderCheck
        </a>
      </section>
    </EnterpriseLayout>
  );
}
