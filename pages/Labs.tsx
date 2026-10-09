import React from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { ScrollNav } from '../components/ui/ScrollNav';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ROUTES } from '../router';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'tools', label: 'Tools & Experiments' },
];

export default function Labs() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/labs', SITE_URL).toString();

  useSEO({
    title: 'RenderCheck Labs — Public Experiments and Educational Tools',
    description: 'Interactive tools for AI-era verification debt. Self-assess your team, learn from real examples, and practice visual verification.',
    canonical: canonicalAbsolute,
  });

  const tools = [
    {
      id: 'verification-debt-score',
      title: 'Verification Debt Score',
      status: 'live' as const,
      description: 'Self-assess your team\'s AI-generated UI verification maturity. Answer 9 questions and get specific recommendations based on your score band (0-25 low, 26-50 moderate, 51-75 high, 76-100 critical).',
      href: ROUTES.VERIFY_DEBT_SCORE,
      teaches: 'Where verification gaps exist in your workflow',
    },
    {
      id: 'ai-ui-bug-gallery',
      title: 'AI UI Bug Gallery',
      status: 'live' as const,
      description: 'Learn from worked examples of AI-generated UI bugs that pass code tests but fail visible verification. Categorized by type: wrong currency, missing confirmations, truncated text, invisible text, and localisation failures.',
      href: ROUTES.AI_UI_BUG_GALLERY,
      teaches: 'Real-world patterns that DOM tests can\'t catch',
    },
    {
      id: 'ocr-challenge-lab',
      title: 'OCR Challenge Lab',
      status: 'live' as const,
      description: 'Weekly verification challenges. Test your OCR and visual verification skills against real-world scenarios. Share your results and track your progress.',
      href: ROUTES.OCR_CHALLENGE_LAB,
      teaches: 'Practical verification skills and confidence',
    },
  ];

  return (
    <EnterpriseLayout
      sidebar={<ScrollNav sections={sections} />}
      breadcrumb={[
        { label: 'Home', href: ROUTES.HOME },
        { label: 'Labs' },
      ]}
    >
      {/* Hero */}
      <section id="overview" className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">RenderCheck Labs</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Public experiments and educational tools for AI-era verification debt. Learn, self-assess, and practice visual verification with real-world examples.
        </p>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Tools & Experiments</h2>
        <div className="grid gap-6">
          {tools.map((tool) => (
            <a
              key={tool.id}
              href={tool.href}
              className="group border border-border rounded-lg p-6 hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                    {tool.title}
                  </h3>
                </div>
                <StatusBadge variant={tool.status} size="sm" />
              </div>

              <p className="text-foreground/80 mb-4">{tool.description}</p>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Teaches:</span>
                <span className="text-sm text-foreground">{tool.teaches}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Why Labs */}
      <section className="border-t pt-8 mt-12 space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Why Labs?</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Self-Assessment</h3>
            <p className="text-sm text-foreground/80">
              Understand your verification maturity without jargon. Get actionable recommendations specific to your team's score.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Learning by Example</h3>
            <p className="text-sm text-foreground/80">
              See real-world patterns: how AI-generated code fails verification in practice, and what RenderCheck catches.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Hands-On Practice</h3>
            <p className="text-sm text-foreground/80">
              Weekly challenges keep verification skills sharp. Challenge results are shareable for team discussion.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Transparent Development</h3>
            <p className="text-sm text-foreground/80">
              Labs experiments show RenderCheck is actively developed and responsive to real developer needs.
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="border-t pt-8 mt-8 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Ready to reduce verification debt?</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={ROUTES.RENDERCHECK}
            className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-[hsl(220_89%_35%)] transition-colors"
          >
            Learn RenderCheck
          </a>
          <a
            href={ROUTES.DEVELOPERS}
            className="inline-flex px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
          >
            Read the developer docs
          </a>
        </div>
      </section>
    </EnterpriseLayout>
  );
}
