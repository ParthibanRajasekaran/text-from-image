import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../src/seo';
import { useTheme } from '../hooks/useTheme';
import { ContentLayout } from '../components/layouts/ContentLayout';
import { Glass } from '../components/ui/Glass';
import { PillarCard } from '../components/ui/PillarCard';
import { ScrollNav, type ScrollNavSection } from '../components/ui/ScrollNav';
import { CONTACT_EMAIL } from '../src/config';

export default function About() {
  const { theme, toggleTheme } = useTheme();
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://getrendercheck.com';
  const canonicalAbsolute = new URL('/about', SITE_URL).toString();

  useSEO({
    title: 'About RenderCheck: Local OCR for UI Tests and Images',
    description:
      'Who builds RenderCheck, how its OCR stays local in your browser and your test process, and what is planned next.',
    canonical: canonicalAbsolute,
  });

  // Section navigation for scroll spy
  const sections: ScrollNavSection[] = [
    { id: 'author', label: 'The author' },
    { id: 'pillars', label: 'Why RenderCheck' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'record', label: 'Track record' },
    { id: 'quality', label: 'Quality & Trust' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'contact', label: 'Contact' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About RenderCheck',
    url: canonicalAbsolute,
    mainEntity: {
      '@type': 'Person',
      name: 'Parthiban Rajasekaran',
      url: 'https://www.linkedin.com/in/parthiban-rajasekaran/',
      image: `${SITE_URL}/images/parthiban-960.jpg`,
      jobTitle: 'Principal Dev Engineer',
      description:
        'Author of RenderCheck, a local OCR assertion SDK for Playwright and Cypress. Writes and speaks on AI-accelerated delivery and reliability.',
      knowsAbout: ['Software test automation', 'Reliability engineering', 'AI-assisted software delivery', 'Verification debt'],
      sameAs: [
        'https://www.linkedin.com/in/parthiban-rajasekaran/',
        'https://github.com/ParthibanRajasekaran',
        'https://leaddev.com/community/parthiban-rajasekaran',
        'https://medium.com/@rajasekaran.parthiban7',
      ],
      email: CONTACT_EMAIL,
    },
  };

  // Founder sidebar card
  const founderCard = (
    <div className="flex flex-col gap-4">
      <Glass className="overflow-hidden">
        <figure className="mb-4">
          <picture>
            <source
              type="image/webp"
              srcSet="/images/parthiban-480.webp 480w, /images/parthiban-960.webp 960w"
              sizes="(min-width: 1024px) 320px, 480px"
            />
            <img
              src="/images/parthiban-480.jpg"
              srcSet="/images/parthiban-480.jpg 480w, /images/parthiban-960.jpg 960w"
              sizes="(min-width: 1024px) 320px, 480px"
              alt="Parthiban Rajasekaran, author of RenderCheck"
              width={480}
              height={600}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] h-auto w-full rounded-xl object-cover"
            />
          </picture>
        </figure>
        <div className="px-6 pb-6">
          <h3 className="font-semibold text-foreground mb-1">Parthiban Rajasekaran</h3>
          <p className="text-xs text-muted-foreground mb-3">Author of RenderCheck · Principal Dev Engineer</p>
          <p className="text-xs text-foreground/80 leading-relaxed mb-4">
            Works on reliability, test automation and AI-assisted delivery in regulated financial services. Writes and speaks on the same.
          </p>
          <div className="flex gap-2 text-xs">
            <a
              href="https://www.linkedin.com/in/parthiban-rajasekaran/"
              rel="noopener noreferrer"
              target="_blank"
              aria-label="LinkedIn"
              className="flex-1 px-3 py-2 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/ParthibanRajasekaran"
              rel="nofollow noopener noreferrer"
              target="_blank"
              aria-label="GitHub"
              className="flex-1 px-3 py-2 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              GitHub
            </a>
          </div>
        </div>
      </Glass>

      <ScrollNav sections={sections} />
    </div>
  );

  return (
    <ContentLayout
      title="About RenderCheck"
      subtitle="Verifying what AI-generated interfaces actually show. Built and maintained by Parthiban Rajasekaran."
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'About' },
      ]}
      side={founderCard}
      jsonLd={jsonLd}
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      {/* Hero + CTAs */}
      <Glass className="mb-8 space-y-4">
        <p className="text-foreground/90 leading-relaxed">
          RenderCheck reads text from pixels on your own machine: in your test process for the Playwright and
          Cypress SDK, and in your browser for the free image-to-text tool. Nothing is uploaded. It exists
          to catch what DOM assertions cannot: text that the code says is on screen and the user cannot read.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/developers"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:opacity-85 active:scale-[0.98] transition duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Read the docs
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground font-medium rounded-full hover:bg-foreground/[0.04] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Try Image → Text
          </Link>
        </div>
      </Glass>

      {/* Author */}
      <section id="author" className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">The author</h2>
        <Glass className="space-y-4 text-foreground/90 leading-relaxed">
          <p>
            I am Parthiban Rajasekaran, a Principal Dev Engineer at Capital One in the UK, working on
            reliability, observability and AI-assisted delivery in regulated financial services. Before that I led
            quality and platform engineering across eight product teams for Volkswagen Group at Diconium in Berlin
            (2018 to 2023), after six years as a software engineer at Tata Consultancy Services.
          </p>
          <p>
            I designed and built RenderCheck myself: the Playwright and Cypress matchers, the locale rules, the
            GitHub Action that annotates pull requests, the in-browser OCR worker, and the checks that fail the build
            if anything leaves the page. The design rule is that the check runs where the pixels are, so a screenshot
            never has to be uploaded to be verified.
          </p>
          <p>
            I use the term{' '}
            <Link to="/what-is-verification-debt" className="text-accent underline">
              verification debt
            </Link>{' '}
            for the gap between what a test suite asserts and what users actually see. The page defines it, lists
            five failure types and states what it does not cover.
          </p>
          <p className="text-xs text-muted-foreground border-t border-border pt-4">
            RenderCheck is an independent project. It is not affiliated with, endorsed by or built for my employer,
            and opinions here are my own.
          </p>
        </Glass>
      </section>

      {/* Value Pillars */}
      <section id="pillars" className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Why RenderCheck</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <PillarCard
            icon={<svg viewBox="0 0 24 24" className="h-8 w-8 text-primary dark:text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 100 6 3 3 0 000-6z" /></svg>}
            title="Reads what is rendered"
            body="A test can pass while the screen shows € for $, a clipped label or text nobody can read. RenderCheck asserts on the pixels."
          />
          <PillarCard
            icon={<svg viewBox="0 0 24 24" className="h-8 w-8 text-primary dark:text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 11V8a5 5 0 0110 0v3M5 11h14v9H5z" /></svg>}
            title="Local only"
            body="OCR runs in your test process or your browser tab. No API key, no upload, no network call from the SDK."
          />
          <PillarCard
            icon={<svg viewBox="0 0 24 24" className="h-8 w-8 text-primary dark:text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>}
            title="Fails with evidence"
            body="A failure says what OCR read, where it differs and where on the screen, and the GitHub Action marks the failing test line."
          />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">How It Works</h2>
        <Glass>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="font-bold text-accent flex-shrink-0">1.</span>
              <span className="text-foreground/90">Your test takes a screenshot, or you drop an image into the browser tool.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent flex-shrink-0">2.</span>
              <span className="text-foreground/90">Tesseract (WebAssembly) reads it on your machine, with the English data installed alongside.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent flex-shrink-0">3.</span>
              <span className="text-foreground/90">The assertion passes, or fails with a diff of expected against read text, confidence and contrast.</span>
            </li>
          </ol>
          <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-4">
            Architecture and threat model:{' '}
            <Link to="/security" className="text-accent underline">how it stays local</Link>.
          </p>
        </Glass>
      </section>

      {/* Track record */}
      <section id="record" className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Track record</h2>
        <Glass>
          <p className="text-sm text-muted-foreground mb-4">
            Each item links to a page I do not control, so you can check it.
          </p>
          <ul className="space-y-3 text-sm text-foreground/90">
            <li>
              <strong>Writing.</strong> Author of a LeadDev article on why AI-assisted coding sped up delivery while
              incidents rose, listed on my{' '}
              <a className="text-accent underline" href="https://leaddev.com/community/parthiban-rajasekaran" target="_blank" rel="noopener noreferrer">LeadDev author page</a>,
              which also lists me as a Cypress and Pynt ambassador. Author of the book{' '}
              <em>Building High-Performance Engineering Teams</em> (ISBN 979-8242088597).
            </li>
            <li>
              <strong>Speaking.</strong> PlatformCon 2026: &ldquo;From Copilot to canary: Platform guardrails for
              AI-accelerated delivery&rdquo; (
              <a className="text-accent underline" href="https://2026.platformcon.com/speakers/parthiban-rajasekaran" target="_blank" rel="noopener noreferrer">speaker page</a>
              ). Roundtable host at an IQPC summit: &ldquo;Moving Faster Without Breaking Things&rdquo; (
              <a className="text-accent underline" href="https://www.iqpc.com/events-platform-engineering-summit/speakers/parthiban-rajasekaran" target="_blank" rel="noopener noreferrer">speaker page</a>
              ).
            </li>
            <li>
              <strong>Open source.</strong> RenderCheck is MIT licensed and developed in the open at{' '}
              <a className="text-accent underline" href="https://github.com/ParthibanRajasekaran/text-from-image" target="_blank" rel="noopener noreferrer">github.com/ParthibanRajasekaran/text-from-image</a>.
              Releases are published to npm from GitHub Actions with provenance, so each version can be traced to its
              source commit.
            </li>
          </ul>
        </Glass>
      </section>

      {/* Quality & Trust */}
      <section id="quality" className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Quality & Trust</h2>
        <Glass>
          <ul className="space-y-3 text-sm text-foreground/90">
            <li className="flex gap-2">
              <span className="text-accent">✓</span>
              <span>
                <strong>Network proof:</strong> an end-to-end test fails the build on any off-origin or upload request
                during an OCR run, under the same Content Security Policy that production serves.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span>
              <span>
                <strong>Accessibility:</strong> axe-core runs in CI on the main pages in light and dark themes.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span>
              <span>
                <strong>Tested on every pull request:</strong> unit tests for the site and the SDK, plus a Playwright
                end-to-end suite.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span>
              <span>
                <strong>Supply chain:</strong> npm publishing uses trusted publishing from GitHub Actions, with a
                provenance statement on each release.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span>
              <span>
                <strong>Privacy:</strong> no cookies, no analytics and no advertising scripts. See the{' '}
                <a className="text-accent underline" href="/privacy-policy">privacy policy</a> and the{' '}
                <a className="text-accent underline" href="/security">security page</a>.
              </span>
            </li>
          </ul>
        </Glass>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Roadmap and sustainability</h2>
        <Glass>
          <div className="space-y-4 text-sm text-foreground/90">
            <p>
              These are plans, not products. Nothing below is for sale or open for sign-up today.
            </p>
            <div>
              <strong className="text-foreground">Stays free and open</strong>
              <p className="text-xs text-foreground/70">
                The SDK, the GitHub Action and the browser tool remain MIT licensed and free to use.
              </p>
            </div>
            <div>
              <strong className="text-foreground">Next for the open-source core</strong>
              <p className="text-xs text-foreground/70">
                More bundled OCR languages beyond English, and a published, reproducible accuracy benchmark.
              </p>
            </div>
            <div>
              <strong className="text-foreground">Under consideration for teams</strong>
              <p className="text-xs text-foreground/70">
                A hosted history of failures across CI runs, and enterprise needs such as single sign-on, only if
                teams using the SDK ask for them. If this becomes a paid offering, the open-source core stays as it is.
              </p>
            </div>
          </div>
        </Glass>
      </section>

      {/* Contact */}
      <section id="contact" className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Have Questions?</h2>
        <Glass className="space-y-3">
          <p className="text-foreground/90">
            Found a bug, have a feature request, or want to write up how you use RenderCheck in CI?{' '}
            <Link
              to="/contact"
              className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded px-1"
            >
              Contact us
            </Link>
            .
          </p>
          <p className="text-foreground/90">
            Or email:{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded px-1"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </Glass>
      </section>

      {/* Footer CTA + Legal */}
      <Glass className="mt-12 space-y-4 border-t border-white/10 pt-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:opacity-85 active:scale-[0.98] transition duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Try All Tools
          </Link>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <a href="/privacy-policy" className="text-accent hover:text-accent-2">
            Privacy
          </a>
          <a href="/terms" className="text-accent hover:text-accent-2">
            Terms
          </a>
          <a
            href="https://github.com/ParthibanRajasekaran/text-from-image"
            rel="nofollow noopener noreferrer"
            target="_blank"
            className="text-xs opacity-80 hover:opacity-100 text-accent transition-opacity"
          >
            GitHub
          </a>
        </div>
      </Glass>
    </ContentLayout>
  );
}
