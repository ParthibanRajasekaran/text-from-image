import React from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ROUTES } from '../router';

/**
 * Case Studies Page: Real-world adoption (in progress)
 * - Only publish verified impact
 * - No fabricated logos or customers
 * - Honest status: what we have, what's pending
 *
 * Currently: Doctor4Africa case study in preparation
 * Beta testimonials: pending collection
 */
export default function CaseStudies() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://getrendercheck.com';
  const canonicalAbsolute = new URL('/case-studies', SITE_URL).toString();

  useSEO({
    title: 'RenderCheck Case Studies: Beta Adoption in Progress',
    description:
      'Real-world case studies showing how teams use RenderCheck for AI-generated UI verification. Public impact, verified metrics.',
    canonical: canonicalAbsolute,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'RenderCheck Case Studies',
    url: canonicalAbsolute,
    description: 'Real-world case studies of teams using RenderCheck for verification.',
  };

  return (
    <EnterpriseLayout
      breadcrumb={[
        { label: 'Home', href: ROUTES.HOME },
        { label: 'Case Studies' },
      ]}
      jsonLd={jsonLd}
    >
      {/* Hero */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Beta adoption</h1>
          <StatusBadge variant="developer-beta" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Case studies showing how teams are using RenderCheck to verify rendered UI. We only publish verified impact.
        </p>
      </section>

      {/* Credibility Statement */}
      <section className="p-6 bg-muted/30 border border-border rounded-lg mb-12">
        <p className="text-foreground font-medium">
          We do not publish fabricated logos, inflated user counts, or unverified testimonials. Below is what we have in flight.
        </p>
      </section>

      {/* Doctor4Africa Case Study */}
      <section className="mb-12 border border-border rounded-lg p-8 bg-surface/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Doctor4Africa</h2>
            <p className="text-muted-foreground mt-1">Healthcare data pipeline</p>
          </div>
          <StatusBadge variant="evidence-pending" />
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">The Context</h3>
            <p className="text-foreground/90">
              Doctor4Africa runs a healthcare provider data platform on AWS. They needed to extract and verify provider
              records from intake forms, documents, and handwritten applications before processing them through downstream
              analytics pipelines.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">The Solution</h3>
            <p className="text-foreground/90">
              Built an AWS Glue-based pipeline with OCR-driven verification of rendered output. The workflow extracts
              provider information from documents, verifies that the extracted text matches the visible page content, and
              gates downstream processing on verification success.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Status</h3>
            <div className="p-4 bg-status-evidence-pending/10 border border-status-evidence-pending/30 rounded text-foreground/90">
              <p className="font-medium mb-2">Case study in preparation.</p>
              <ul className="text-sm space-y-1">
                <li>✓ Technical context verified</li>
                <li>✓ Outreach initiated</li>
                <li>• Metrics collection in progress</li>
                <li>• Permission agreement pending</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Expected Impact</h3>
            <p className="text-foreground/90">
              Once approved: Healthcare provider record processing at scale, automated verification reducing manual QA,
              documented proof of OCR in production workflows.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-12 border-t pt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Beta Testimonials</h2>

        <div className="p-8 bg-muted/30 border border-border rounded-lg text-center">
          <p className="text-foreground/80 text-lg mb-4">
            Beta testimonials and quotes from early users appear here once collected.
          </p>
          <p className="text-muted-foreground">
            Currently: 0 public installs. Be among the first to request access and share your experience.
          </p>
        </div>
      </section>

      {/* Become a Beta Tester */}
      <section className="bg-primary/10 border border-primary/20 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-foreground mb-3">Become a Beta Tester</h3>
        <p className="text-muted-foreground mb-6">
          If you're using RenderCheck in a real workflow, we'd love to document your success. Request access and tell us
          about your use case.
        </p>

        <a
          href={ROUTES.ACCESS}
          className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-[hsl(220_89%_35%)] transition-colors"
        >
          Request Beta Access
        </a>
      </section>
    </EnterpriseLayout>
  );
}
