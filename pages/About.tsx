import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../src/seo';
import { GuideLayout } from '../src/layouts/GuideLayout';

/**
 * About Page - Premium content focusing on privacy, speed, and transparency
 * - No ads (InArticle not mounted)
 * - Full JSON-LD structured data
 * - Premium styling consistent with guides/landing
 */
export default function About() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/about', SITE_URL).toString();

  // Today's date for "last updated"
  const lastUpdated = new Date().toISOString().slice(0, 10);

  // SEO metadata
  useSEO({
    title: 'About TextFromImage — Private, Fast, On-Device OCR',
    description:
      'Learn how TextFromImage extracts text from images privately in your browser—no signup, no uploads. Built by Parthiban Rajasekaran with a focus on speed, accessibility, and transparency.',
    canonical: canonicalAbsolute,
  });

  // JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About TextFromImage',
    url: canonicalAbsolute,
    description:
      'Learn about TextFromImage, a privacy-first OCR tool that runs entirely in your browser.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'TextFromImage',
      url: SITE_URL,
    },
    about: {
      '@type': 'SoftwareApplication',
      name: 'TextFromImage',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Extract text from images using AI-powered OCR, entirely in your browser. No signup, no uploads, no storage.',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TextFromImage',
      url: SITE_URL,
      founder: {
        '@type': 'Person',
        name: 'Parthiban Rajasekaran',
        url: 'https://www.linkedin.com/in/parthiban-rajasekaran',
        sameAs: [
          'https://www.linkedin.com/in/parthiban-rajasekaran',
          'https://github.com/ParthibanRajasekaran',
        ],
      },
    },
  };

  return (
    <>
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <GuideLayout
        title="About TextFromImage"
        description="Privacy-first OCR that runs entirely in your browser"
      >
        {/* Hero Section */}
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Privacy-First OCR for Everyone
          </h2>
          <p className="text-lg text-muted-foreground">
            Extract text from images in your browser. No signup. No uploads. No servers.
          </p>
        </section>

        {/* TL;DR */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">The TL;DR</h2>
          <ul className="space-y-3 text-foreground/90">
            <li className="flex gap-3">
              <span className="text-accent font-bold flex-shrink-0">✓</span>
              <span>
                <strong>Private:</strong> Your images never leave your device. All processing happens client-side.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold flex-shrink-0">✓</span>
              <span>
                <strong>Fast:</strong> AI models run via WebAssembly and Web Workers. Instant results, even offline.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold flex-shrink-0">✓</span>
              <span>
                <strong>Useful:</strong> Copy text, export results, view history. Works with any image format.
              </span>
            </li>
          </ul>
        </section>

        {/* Why This Exists */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Why This Exists</h2>
          <p className="text-foreground/90 mb-4">
            Most OCR services require you to upload your images to the cloud. That means your data passes through servers, gets logged, and may be used for training or analytics.
          </p>
          <p className="text-foreground/90">
            TextFromImage was built to prove that modern browsers are powerful enough to run AI locally. No servers needed. Your data stays yours.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">How It Works</h2>
          <div className="space-y-3 text-foreground/90">
            <p>
              <strong>Step 1: You upload an image.</strong> It's loaded into your browser's memory—not sent anywhere.
            </p>
            <p>
              <strong>Step 2: OCR runs locally.</strong> We use Tesseract (via WASM) or neural models (via transformers.js) running in Web Workers. Your browser does the heavy lifting.
            </p>
            <p>
              <strong>Step 3: Results appear instantly.</strong> Extracted text is shown in the editor. You can copy, export, or use it immediately.
            </p>
            <p>
              <strong>Bonus:</strong> On our guide pages, we show ads only after you've given consent. No tracking pixels, no third-party scripts until you opt in.
            </p>
          </div>
        </section>

        {/* Who's Behind It */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Who's Behind It</h2>
          <div className="p-6 rounded-lg bg-accent/5 border border-accent/20">
            <p className="font-semibold text-foreground mb-2">Parthiban Rajasekaran</p>
            <p className="text-sm text-muted-foreground mb-4">Founder & Maintainer</p>
            <p className="text-sm text-foreground/90 mb-4">
              Full-stack engineer with a passion for privacy, performance, and accessible software. This project started as a proof-of-concept and evolved into a reliable tool used by thousands.
            </p>
            <div className="flex gap-3 text-sm">
              <a
                href="https://www.linkedin.com/in/parthiban-rajasekaran"
                rel="noopener noreferrer"
                target="_blank"
                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/ParthibanRajasekaran"
                rel="noopener noreferrer"
                target="_blank"
                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1"
              >
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Our Beliefs */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">Our Core Beliefs</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">Privacy by Default</h3>
              <p className="text-sm text-muted-foreground">
                Your data is yours. We don't collect, store, or share anything without explicit consent.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">Speed Matters</h3>
              <p className="text-sm text-muted-foreground">
                Instant results, even on slow connections. No waiting for servers.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">Accessibility First</h3>
              <p className="text-sm text-muted-foreground">
                Works for everyone, on every device. Keyboard navigation, screen readers, and WCAG compliant.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">Radical Transparency</h3>
              <p className="text-sm text-muted-foreground">
                Open source. Auditable. No hidden tracking or dark patterns.
              </p>
            </div>
          </div>
        </section>

        {/* What You Can Do */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">What You Can Do</h2>
          <p className="text-foreground/90 mb-6">
            TextFromImage makes it easy to work with text extracted from images:
          </p>
          <div className="space-y-3 text-foreground/90">
            <p>
              <strong>Extract text from any image:</strong>{' '}
              <Link
                to="/"
                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
              >
                Image → Text
              </Link>
            </p>
            <p>
              <strong>Copy and use extracted text:</strong>{' '}
              <Link
                to="/copy-text-from-image"
                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
              >
                Copy Text from Image
              </Link>
            </p>
            <p>
              <strong>Convert images to editable text:</strong>{' '}
              <Link
                to="/extract-text-from-image"
                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
              >
                Extract Text from Image
              </Link>
            </p>
            <p>
              <strong>Convert images to Word documents:</strong>{' '}
              <Link
                to="/jpg-to-word"
                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
              >
                JPG to Word
              </Link>
            </p>
            <p>
              <strong>Convert images to Excel spreadsheets:</strong>{' '}
              <Link
                to="/jpg-to-excel"
                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
              >
                JPG to Excel
              </Link>
            </p>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">What's Next</h2>
          <p className="text-foreground/90 mb-4">We're always improving. On the roadmap:</p>
          <ul className="space-y-2 text-foreground/90">
            <li className="flex gap-2">
              <span className="text-accent">→</span>
              <span>Better table detection and Excel export</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">→</span>
              <span>Support for more languages and handwriting</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">→</span>
              <span>Progressive Web App (PWA) for offline use</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">→</span>
              <span>Redaction and sensitive data masking</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">→</span>
              <span>Performance improvements and model updates</span>
            </li>
          </ul>
        </section>

        {/* Quality & Trust */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Quality & Trust</h2>
          <div className="space-y-4 text-foreground/90">
            <p>
              <strong>Core Web Vitals:</strong> We target green metrics on all pages. LCP &lt; 2.5s, INP &lt; 200ms, CLS &lt; 0.1.
            </p>
            <p>
              <strong>Consent Mode v2:</strong> We respect your privacy settings. Ads load only after you give explicit consent.
            </p>
            <p>
              <strong>Accessibility (WCAG 2.1 AA):</strong> Full keyboard navigation, screen reader support, sufficient color contrast, and semantic HTML.
            </p>
            <p>
              <strong>Security:</strong> HTTPS everywhere. No cross-site cookies. CSP headers. Regular dependency audits.
            </p>
          </div>
        </section>

        {/* Credits */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Built With</h2>
          <p className="text-foreground/90 mb-4">
            TextFromImage stands on the shoulders of giants. We're grateful to:
          </p>
          <ul className="space-y-2 text-foreground/90 text-sm">
            <li>
              <strong>Tesseract.js</strong> — OCR engine compiled to WebAssembly
            </li>
            <li>
              <strong>Transformers.js</strong> — Hugging Face models in the browser
            </li>
            <li>
              <strong>React & React Router</strong> — UI framework and routing
            </li>
            <li>
              <strong>Tailwind CSS</strong> — Styling and theming
            </li>
            <li>
              <strong>Framer Motion</strong> — Smooth animations and interactions
            </li>
          </ul>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Get in Touch</h2>
          <p className="text-foreground/90 mb-4">
            Found a bug? Have a feature request? Want to say hi?
          </p>
          <div className="space-y-2 text-sm">
            <p>
              Email:{' '}
              <a
                href="mailto:hello@freetextfromimage.com"
                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
              >
                hello@freetextfromimage.com
              </a>
            </p>
            <p>
              Issues:{' '}
              <a
                href="https://github.com/ParthibanRajasekaran/text-from-image/issues"
                rel="noopener noreferrer"
                target="_blank"
                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
              >
                GitHub Issues
              </a>
            </p>
            <p>
              LinkedIn:{' '}
              <a
                href="https://www.linkedin.com/in/parthiban-rajasekaran"
                rel="noopener noreferrer"
                target="_blank"
                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
              >
                Parthiban Rajasekaran
              </a>
            </p>
          </div>
        </section>

        {/* Legal Links */}
        <section className="mb-12 pb-8 border-b border-border/50">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Legal</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href="/privacy-policy"
              className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
            >
              Terms of Service
            </a>
          </div>
        </section>

        {/* CTA Row */}
        <section className="mb-12 flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-accent via-accent-2 to-primary text-background font-semibold rounded-lg hover:shadow-glow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Try Image → Text
          </Link>
          <a
            href="https://github.com/ParthibanRajasekaran/text-from-image"
            rel="noopener noreferrer"
            target="_blank"
            className="inline-flex items-center justify-center px-6 py-3 border border-accent/50 text-accent font-semibold rounded-lg hover:bg-accent/10 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            View on GitHub
          </a>
        </section>

        {/* Last Updated */}
        <section className="text-center text-xs text-muted-foreground">
          <p>Last updated: {lastUpdated}</p>
        </section>
      </GuideLayout>
    </>
  );
}
