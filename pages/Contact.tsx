import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../src/seo';
import { AuroraBackground } from '../components/AuroraBackground';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../hooks/useTheme';
import { ScrollNav, type ScrollNavSection } from '../components/ui/ScrollNav';
import { AnchorSection } from '../components/a11y/AnchorSection';

export default function Contact() {
  const { theme, toggleTheme } = useTheme();
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/contact', SITE_URL).toString();

  useSEO({
    title: 'Contact TextFromImage — Bug Reports & Feature Requests',
    description:
      'Found a bug? Have a feature request? Multiple ways to reach the TextFromImage team. We usually reply within 2 business days.',
    canonical: canonicalAbsolute,
  });

  // Section navigation for scroll spy
  const sections: ScrollNavSection[] = [
    { id: 'reach-us', label: 'Ways to Reach Us' },
    { id: 'what-to-include', label: 'When Reporting Bugs' },
    { id: 'priority-topics', label: 'Priority Topics' },
    { id: 'ready', label: 'Ready?' },
    { id: 'more-info', label: 'More Info' },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact TextFromImage',
    url: canonicalAbsolute,
    mainEntity: {
      '@type': 'Organization',
      name: 'TextFromImage',
      url: SITE_URL,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '',
        contactType: 'Customer Support',
        email: 'hello@freetextfromimage.com',
      },
      sameAs: [
        'https://github.com/ParthibanRajasekaran/text-from-image',
        'https://www.linkedin.com/in/parthiban-rajasekaran',
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <AuroraBackground>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>

        <header className="fixed top-0 right-0 z-50 p-4">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </header>

        <main id="main-content" className="relative min-h-screen py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="rounded-2xl border border-border/50 backdrop-blur-xl bg-surface/40 shadow-glow-md overflow-hidden">
                <div className="px-6 sm:px-10 py-8 sm:py-12">
                  <nav aria-label="Breadcrumb" className="mb-6">
                    <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                      <li>
                        <Link to="/" className="hover:text-foreground transition-colors">
                          Home
                        </Link>
                      </li>
                      <li aria-hidden="true">/</li>
                      <li className="text-foreground font-medium" aria-current="page">
                        Contact
                      </li>
                    </ol>
                  </nav>

                  <div className="grid lg:grid-cols-4 gap-8 items-start">
                    {/* Main content */}
                    <div className="lg:col-span-3 max-w-3xl mx-auto space-y-8">
                    {/* Hero */}
                    <section>
                      <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
                        Contact Us
                      </h1>
                      <p className="text-lg text-muted-foreground max-w-2xl">
                        Found a bug? Have a feature request? Want to say hi? We're here to help. Usually reply within 2 business days.
                      </p>
                    </section>

                    {/* Privacy notice */}
                    <section className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                      <p className="text-sm text-foreground/90">
                        <strong>Privacy note:</strong> TextFromImage processes images entirely in your browser—we never store or access them on our servers. When you contact us, we only receive the information you explicitly send.
                      </p>
                    </section>

                    {/* Contact methods */}
                    <AnchorSection id="reach-us" title="Ways to Reach Us">
                      <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-foreground">Ways to Reach Us</h2>

                      {/* Email */}
                      <div className="p-6 rounded-lg border border-border/50 bg-surface/50">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <span className="text-lg" aria-hidden="true">
                              ✉️
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-2">Email</h3>
                            <p className="text-sm text-foreground/90 mb-4">
                              For general inquiries, bug reports, and feature requests:
                            </p>
                            <a
                              href="mailto:hello@freetextfromimage.com"
                              className="inline-flex items-center gap-2 text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1 font-medium"
                            >
                              hello@freetextfromimage.com
                              <span aria-hidden="true">→</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* GitHub Issues */}
                      <div className="p-6 rounded-lg border border-border/50 bg-surface/50">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <span className="text-lg" aria-hidden="true">
                              🐛
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-2">GitHub Issues</h3>
                            <p className="text-sm text-foreground/90 mb-4">
                              Found a technical bug? Open an issue on our GitHub repository. Public discussions help the whole community.
                            </p>
                            <a
                              href="https://github.com/ParthibanRajasekaran/text-from-image/issues"
                              rel="nofollow noopener noreferrer"
                              target="_blank"
                              className="inline-flex items-center gap-2 text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1 font-medium"
                            >
                              Open an issue on GitHub
                              <span aria-hidden="true">→</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* LinkedIn */}
                      <div className="p-6 rounded-lg border border-border/50 bg-surface/50">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <span className="text-lg" aria-hidden="true">
                              💼
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-2">LinkedIn</h3>
                            <p className="text-sm text-foreground/90 mb-4">
                              Reach out to Parthiban Rajasekaran directly on LinkedIn for business inquiries or just to connect.
                            </p>
                            <a
                              href="https://www.linkedin.com/in/parthiban-rajasekaran"
                              rel="noopener noreferrer"
                              target="_blank"
                              className="inline-flex items-center gap-2 text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1 font-medium"
                            >
                              Connect on LinkedIn
                              <span aria-hidden="true">→</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </section>
                    </AnchorSection>

                    {/* What to include */}
                    <AnchorSection id="what-to-include" title="When Reporting Bugs">
                      <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-foreground">When Reporting Bugs</h2>
                      <div className="p-4 rounded-lg bg-surface/50 border border-border/50 space-y-3 text-sm text-foreground/90">
                        <p className="font-medium text-foreground">Help us help you faster by including:</p>
                        <ul className="space-y-2 list-disc list-inside">
                          <li>
                            <strong>What happened:</strong> Brief description of the issue
                          </li>
                          <li>
                            <strong>Expected behavior:</strong> What should have happened instead
                          </li>
                          <li>
                            <strong>Browser & OS:</strong> Chrome/Firefox/Safari on Windows/Mac/Linux
                          </li>
                          <li>
                            <strong>Steps to reproduce:</strong> How to reliably trigger the issue
                          </li>
                          <li>
                            <strong>Image (if applicable):</strong> Screenshot or sample image causing the problem
                          </li>
                        </ul>
                      </div>
                    </section>
                    </AnchorSection>

                    {/* Priority topics */}
                    <AnchorSection id="priority-topics" title="Priority Topics">
                      <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-foreground">Priority Topics</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                          <h3 className="font-semibold text-foreground mb-2">Security Issues</h3>
                          <p className="text-sm text-foreground/80 mb-3">
                            Found a security vulnerability? Email us directly at hello@freetextfromimage.com. Please don't open a public issue.
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                          <h3 className="font-semibold text-foreground mb-2">Privacy & DMCA</h3>
                          <p className="text-sm text-foreground/80 mb-3">
                            Have privacy concerns or DMCA requests? Email hello@freetextfromimage.com. We prioritize these within 24 hours.
                          </p>
                        </div>
                      </div>
                    </section>
                    </AnchorSection>

                    {/* CTA */}
                    <AnchorSection id="ready" title="Ready?">
                      <section className="border-t border-border/50 pt-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Ready?</h2>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <a
                          href="mailto:hello@freetextfromimage.com"
                          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-accent via-accent-2 to-primary text-background font-semibold rounded-lg hover:shadow-glow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                        >
                          Send us an Email
                        </a>
                        <Link
                          to="/"
                          className="inline-flex items-center justify-center px-6 py-3 border border-accent/50 text-accent font-semibold rounded-lg hover:bg-accent/10 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                        >
                          Back to OCR Tool
                        </Link>
                      </div>
                    </section>
                    </AnchorSection>

                    {/* Link to About */}
                    <AnchorSection id="more-info" title="More Info">
                      <section className="text-center text-sm text-muted-foreground">
                        <p>
                          Want to learn more about us?{' '}
                          <Link
                            to="/about"
                            className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
                          >
                            Visit our About page
                          </Link>
                        </p>
                      </section>
                    </AnchorSection>
                    </div>
                    <aside className="lg:col-span-1">
                      <ScrollNav sections={sections} />
                    </aside>
                  </div>
                </div>
              </div>

              {/* Back link */}
              <div className="mt-8 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1"
                >
                  <span aria-hidden="true">←</span>
                  <span>Back to OCR Tool</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </AuroraBackground>
    </>
  );
}
