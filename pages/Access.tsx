import React from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { CodeBlock } from '../components/ui/CodeBlock';
import { ROUTES } from '../router';

/**
 * Access Page: how to get RenderCheck.
 *
 * There is no hosted API, no API key and no account. The Browser OCR tool and the SDK both run on the
 * visitor's machine, so there is nothing to request access to. This page used to be an API-key request
 * form; it is kept at /access so existing links still land somewhere useful.
 */
export default function Access() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://getrendercheck.com';
  const canonicalAbsolute = new URL('/access', SITE_URL).toString();

  useSEO({
    title: 'Get RenderCheck: No Account, No API Key',
    description:
      'RenderCheck runs on your machine. Use the browser OCR tool or install the Playwright/Cypress SDK. No account, no API key, no upload.',
    canonical: canonicalAbsolute,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Get RenderCheck',
    url: canonicalAbsolute,
    description: 'How to use RenderCheck: the browser OCR tool and the local-only Playwright/Cypress SDK.',
  };

  return (
    <EnterpriseLayout
      breadcrumb={[
        { label: 'Home', href: ROUTES.HOME },
        { label: 'Access' },
      ]}
      jsonLd={jsonLd}
    >
      <section className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Get RenderCheck</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          There is nothing to sign up for. RenderCheck reads text on your machine, so there is no account, no API
          key and no upload.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <div className="border border-border rounded-lg p-6 bg-surface/50">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-bold text-foreground">Browser OCR</h2>
            <StatusBadge variant="live" />
          </div>
          <p className="text-muted-foreground mb-4">
            Drop an image on the home page and get the text. It runs in your browser and the image is not uploaded.
          </p>
          <Button href={ROUTES.HOME} variant="solid" size="md">
            Try Browser OCR
          </Button>
        </div>

        <div className="border border-status-beta/30 rounded-lg p-6 bg-status-beta/5">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-bold text-foreground">RenderCheck SDK</h2>
            <StatusBadge variant="developer-beta" />
          </div>
          <p className="text-muted-foreground mb-4">
            Assert what users see in Playwright and Cypress. OCR runs inside your test process.
          </p>
          <CodeBlock
            code="npm install --save-dev @freetextfromimage/rendercheck"
            language="bash"
            filename="Terminal"
            className="mb-4"
          />
          <Button href={ROUTES.DEVELOPERS} variant="outline" size="md">
            Read the developer docs
          </Button>
        </div>
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked</h2>

        <details className="border border-border rounded-lg p-4 cursor-pointer group">
          <summary className="font-medium text-foreground group-open:text-primary transition-colors">
            Is there a hosted API?
          </summary>
          <div className="mt-3 text-muted-foreground">
            <p>No. The hosted API has been retired, so there are no keys to request and no usage limits.</p>
          </div>
        </details>

        <details className="border border-border rounded-lg p-4 cursor-pointer group">
          <summary className="font-medium text-foreground group-open:text-primary transition-colors">
            What does it cost?
          </summary>
          <div className="mt-3 text-muted-foreground">
            <p>Nothing. Both the browser tool and the SDK are free.</p>
          </div>
        </details>

        <details className="border border-border rounded-lg p-4 cursor-pointer group">
          <summary className="font-medium text-foreground group-open:text-primary transition-colors">
            Is my data stored or logged?
          </summary>
          <div className="mt-3 text-muted-foreground">
            <p>
              No. Images and extracted text stay on your machine. The SDK makes no network requests, and the browser
              tool only loads its own engine files from this site.
            </p>
          </div>
        </details>
      </section>
    </EnterpriseLayout>
  );
}
