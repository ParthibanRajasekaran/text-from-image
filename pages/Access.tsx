import React, { useState } from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../router';

/**
 * Access Page: Honest beta access model for RenderCheck
 * - Browser OCR: Live, free
 * - API Access: Developer beta with request form
 * - Public Interest: Free for NGOs/healthcare/education
 *
 * NO pricing tiers, NO billing, NO fake enterprise card
 */
export default function Access() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    useCase: '',
    projectType: 'developer',
  });

  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/access', SITE_URL).toString();

  useSEO({
    title: 'RenderCheck Beta Access — Free API for Developers & Public Interest',
    description:
      'Get beta access to RenderCheck API for Playwright/Cypress testing. Free tier for developers and public interest projects.',
    canonical: canonicalAbsolute,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'RenderCheck Beta Access',
    url: canonicalAbsolute,
    description:
      'Request beta access to RenderCheck API for OCR-based UI verification in Playwright and Cypress tests.',
  };

  return (
    <EnterpriseLayout
      breadcrumb={[
        { label: 'Home', href: ROUTES.HOME },
        { label: 'Access' },
      ]}
      jsonLd={jsonLd}
    >
      {/* Hero */}
      <section className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Get Beta Access</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          RenderCheck is in developer beta. Get free access to the browser OCR tool and request API keys for
          Playwright and Cypress integration.
        </p>
      </section>

      {/* Three Access Tiers */}
      <section className="mb-12 space-y-4">
        {/* Browser OCR - Live */}
        <div className="border border-border rounded-lg p-6 bg-surface/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Browser OCR</h2>
              <p className="text-sm text-muted-foreground mt-1">No account required</p>
            </div>
            <StatusBadge variant="live" />
          </div>

          <ul className="space-y-2 text-foreground/90 mb-4">
            <li>• Extract text from images instantly</li>
            <li>• Runs entirely in your browser</li>
            <li>• No signup, no API key, no uploads</li>
            <li>• Free forever</li>
          </ul>

          <Button href={ROUTES.HOME} variant="solid" size="md">
            Try Now
          </Button>
        </div>

        {/* Developer Beta API - Request Access */}
        <div className="border border-status-beta/30 rounded-lg p-6 bg-status-beta/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Developer Beta API</h2>
              <p className="text-sm text-muted-foreground mt-1">For Playwright and Cypress testing</p>
            </div>
            <StatusBadge variant="developer-beta" />
          </div>

          <ul className="space-y-2 text-foreground/90 mb-4">
            <li>• Programmatic API access for E2E tests</li>
            <li>• 1,000 OCR calls/month during beta</li>
            <li>• SDK: `@freetextfromimage/rendercheck` (npm)</li>
            <li>• Direct HTTP access (coming after beta)</li>
            <li>• Free during beta phase</li>
          </ul>

          <Button href="#request-form" variant="solid" size="md">
            Request API Key
          </Button>
        </div>

        {/* Public Interest Access */}
        <div className="border border-border rounded-lg p-6 bg-surface/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Public Interest Access</h2>
              <p className="text-sm text-muted-foreground mt-1">For nonprofits and social impact</p>
            </div>
            <StatusBadge variant="live" label="Free" />
          </div>

          <ul className="space-y-2 text-foreground/90 mb-4">
            <li>• Unlimited API access</li>
            <li>• Eligible: NGOs, healthcare, accessibility, education</li>
            <li>• Free forever (no volume limits during beta)</li>
            <li>• Select "Public Interest" in the form below</li>
          </ul>

          <Button href="#request-form" variant="solid" size="md">
            Apply
          </Button>
        </div>
      </section>

      {/* Request Form */}
      <section id="request-form" className="mb-12 border-t pt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Request Developer Beta Access</h2>

        <form className="max-w-2xl space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Use Case */}
          <div>
            <label htmlFor="useCase" className="block text-sm font-medium text-foreground mb-1">
              What will you use RenderCheck for?
            </label>
            <textarea
              id="useCase"
              placeholder="E.g., Testing AI-generated UI in my E2E suite, verifying rendered output in Playwright..."
              value={formData.useCase}
              onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Project Type */}
          <div>
            <label htmlFor="projectType" className="block text-sm font-medium text-foreground mb-1">
              Project Type
            </label>
            <select
              id="projectType"
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="developer">Developer / Engineer</option>
              <option value="startup">Startup / Early Stage</option>
              <option value="enterprise">Enterprise Company</option>
              <option value="public-interest">Public Interest (NGO / Healthcare / Education)</option>
            </select>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground">
              During beta, we're giving away API access to gather feedback. After beta, pricing TBD. Your data will
              never be stored; this form is for communication only.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="submit" variant="solid" size="md">
              Request Access
            </Button>
            <Button type="reset" variant="outline" size="md">
              Clear
            </Button>
          </div>
        </form>
      </section>

      {/* FAQ */}
      <section className="mb-12 border-t pt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked</h2>

        <div className="space-y-4">
          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary transition-colors">
              What's included in the free API beta?
            </summary>
            <div className="mt-3 text-muted-foreground">
              <p>1,000 OCR calls per month. After beta, free tier TBD. Public interest projects get unlimited access.</p>
            </div>
          </details>

          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary transition-colors">
              Can I use RenderCheck in production?
            </summary>
            <div className="mt-3 text-muted-foreground">
              <p>Yes. It's "Developer Beta" because we're gathering feedback and may change the API. Production use is fine.</p>
            </div>
          </details>

          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary transition-colors">
              When will direct HTTP access be available?
            </summary>
            <div className="mt-3 text-muted-foreground">
              <p>After developer beta closes. For now, use the npm package (@freetextfromimage/rendercheck).</p>
            </div>
          </details>

          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary transition-colors">
              Do I need to pay anything?
            </summary>
            <div className="mt-3 text-muted-foreground">
              <p>No. Browser OCR is always free. API access is free during beta. Public interest projects have unlimited free access.</p>
            </div>
          </details>

          <details className="border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="font-medium text-foreground group-open:text-primary transition-colors">
              Is my data stored or logged?
            </summary>
            <div className="mt-3 text-muted-foreground">
              <p>No. Images and extracted text are not persisted. Browser OCR runs entirely locally. API calls are logged for rate limiting only.</p>
            </div>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/10 border border-primary/20 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-3">Ready to verify rendered UI?</h3>
        <p className="text-muted-foreground mb-6">Start with the browser OCR tool or request API access below.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button href={ROUTES.HOME} variant="solid" size="md">
            Try Browser OCR
          </Button>
          <Button href={ROUTES.RENDERCHECK} variant="outline" size="md">
            See RenderCheck Docs
          </Button>
        </div>
      </section>
    </EnterpriseLayout>
  );
}
