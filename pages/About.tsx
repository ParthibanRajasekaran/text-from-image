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
    { id: 'pillars', label: 'Why RenderCheck' },
    { id: 'how-it-works', label: 'How It Works' },
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
      url: 'https://www.linkedin.com/in/parthibanrajasekaran',
      image: `${SITE_URL}/images/headshot.jpg`,
      jobTitle: 'Software engineer',
      description: 'Author of RenderCheck, a local OCR toolkit for UI tests and images',
      sameAs: [
        'https://www.linkedin.com/in/parthibanrajasekaran',
        'https://github.com/ParthibanRajasekaran',
      ],
      email: CONTACT_EMAIL,
    },
  };

  // Founder sidebar card
  const founderCard = (
    <div className="flex flex-col gap-4">
      <Glass className="overflow-hidden">
        <figure className="mb-4">
          <img
            src="images/headshot.jpg"
            alt="Parthiban Rajasekaran, author of RenderCheck"
            width={480}
            height={600}
            loading="lazy"
            decoding="async"
            srcSet="/images/headshot.jpg 1x, /images/headshot.jpg 2x"
            className="w-full h-auto rounded-xl shadow-lg object-cover"
          />
        </figure>
        <div className="px-6 pb-6">
          <h3 className="font-semibold text-foreground mb-1">Parthiban Rajasekaran</h3>
          <p className="text-xs text-muted-foreground mb-3">Creator & Engineer</p>
          <p className="text-xs text-foreground/80 leading-relaxed mb-4">
            Full-stack engineer passionate about privacy, performance, and accessible software.
          </p>
          <div className="flex gap-2 text-xs">
            <a
              href="https://www.linkedin.com/in/parthibanrajasekaran"
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
      subtitle="Local OCR for UI tests and images. No signup. No uploads."
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
          RenderCheck reads text from pixels on your own machine: in your browser for the free
          image-to-text tool, and in your test process for the Playwright and Cypress SDK. Nothing is
          uploaded.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-accent via-accent-2 to-primary text-background font-semibold rounded-lg hover:shadow-glow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Try Image → Text
          </Link>
          <Link
            to="/image-to-text"
            className="inline-flex items-center justify-center px-6 py-3 border border-accent/30 text-accent font-semibold rounded-lg hover:bg-accent/5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            See Guides
          </Link>
        </div>
      </Glass>

      {/* Value Pillars */}
      <section id="pillars" className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Why RenderCheck</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <PillarCard
            icon={<svg viewBox="0 0 24 24" className="h-8 w-8 text-primary dark:text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 11V8a5 5 0 0110 0v3M5 11h14v9H5z" /></svg>}
            title="Private"
            body="Your images never leave your device. Processing happens in your browser, no servers, no uploads, no logs."
          />
          <PillarCard
            icon={<svg viewBox="0 0 24 24" className="h-8 w-8 text-primary dark:text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>}
            title="Fast"
            body="Instant results. OCR runs locally using Tesseract (WASM), with nothing uploaded."
          />
          <PillarCard
            icon={<svg viewBox="0 0 24 24" className="h-8 w-8 text-primary dark:text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4a1.5 1.5 0 100 .01M6 8h12M12 8v5l-3 7M12 13l3 7" /></svg>}
            title="Accessible"
            body="Built for everyone. Keyboard navigation, screen reader support, and semantic HTML structure."
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
              <span className="text-foreground/90">Upload an image, it stays in your browser.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent flex-shrink-0">2.</span>
              <span className="text-foreground/90">OCR runs locally in Web Workers, no server call.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent flex-shrink-0">3.</span>
              <span className="text-foreground/90">Results appear instantly. Copy, export, or use.</span>
            </li>
          </ol>
          <p className="text-xs text-foreground/60 mt-4 border-t border-white/10 pt-4">
            Your images and data remain on your device at all times. No uploads. No server storage.
          </p>
        </Glass>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">What's Next</h2>
        <Glass>
          <div className="space-y-3 text-sm text-foreground/90">
            <div>
              <strong className="text-foreground">Tables → Excel</strong>
              <p className="text-xs text-foreground/70">Extract tables from images into .xlsx files.</p>
            </div>
            <div>
              <strong className="text-foreground">More Languages & Handwriting</strong>
              <p className="text-xs text-foreground/70">Additional languages and better handwriting support.</p>
            </div>
            <div>
              <strong className="text-foreground">PWA & Offline</strong>
              <p className="text-xs text-foreground/70">Install as app, work completely offline.</p>
            </div>
            <div>
              <strong className="text-foreground">Redaction Tools</strong>
              <p className="text-xs text-foreground/70">Privacy-focused redaction before export.</p>
            </div>
          </div>
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
                <strong>Core Web Vitals:</strong> LCP &lt; 2.5s, INP &lt; 200ms, CLS &lt; 0.1
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span>
              <span>
                <strong>Accessibility:</strong> Keyboard accessible, screen reader tested, semantic HTML
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span>
              <span>
                <strong>Consent Mode v2:</strong> Ads load only after explicit consent
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span>
              <span>
                <strong>No Ads on Tools:</strong> Ad-free experience on all OCR/converter pages
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span>
              <span>
                <strong>Security:</strong> served over HTTPS, no cookies, no third-party scripts
              </span>
            </li>
          </ul>
        </Glass>
      </section>

      {/* Contact */}
      <section id="contact" className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Have Questions?</h2>
        <Glass className="space-y-3">
          <p className="text-foreground/90">
            Found a bug? Have a feature request?{' '}
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
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-accent via-accent-2 to-primary text-background font-semibold rounded-lg hover:shadow-glow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
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
