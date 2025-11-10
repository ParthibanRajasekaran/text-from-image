import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../src/seo';
import { AuroraBackground } from '../components/AuroraBackground';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../hooks/useTheme';
import { ScrollNav, type ScrollNavSection } from '../components/ui/ScrollNav';
import { AnchorSection } from '../components/a11y/AnchorSection';

export default function About() {
  const { theme, toggleTheme } = useTheme();
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/about', SITE_URL).toString();
  const lastUpdated = new Date().toISOString().slice(0, 10);

  useSEO({
    title: 'About TextFromImage — Privacy-First OCR Built by Parthiban',
    description:
      'Meet Parthiban Rajasekaran, founder of TextFromImage. Learn how we built a privacy-first OCR tool that runs entirely in your browser—no servers, no uploads, no compromises.',
    canonical: canonicalAbsolute,
  });

  // Section navigation for scroll spy
  const sections: ScrollNavSection[] = [
    { id: 'mission', label: 'Mission' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'beliefs', label: 'What We Believe In' },
    { id: 'quality', label: 'Quality & Trust' },
    { id: 'get-in-touch', label: 'Get in Touch' },
    { id: 'tools', label: 'Try Our Tools' },
    { id: 'legal', label: 'Legal & More' },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About TextFromImage',
    url: canonicalAbsolute,
    mainEntity: {
      '@type': 'Organization',
      name: 'TextFromImage',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: 'Privacy-first OCR tool that runs entirely in your browser',
      founder: {
        '@type': 'Person',
        name: 'Parthiban Rajasekaran',
        url: 'https://www.linkedin.com/in/parthiban-rajasekaran',
        image: `${SITE_URL}/images/headshot.jpg`,
        sameAs: [
          'https://www.linkedin.com/in/parthiban-rajasekaran',
          'https://github.com/ParthibanRajasekaran',
        ],
      },
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
            <div className="max-w-6xl mx-auto">
              <div className="rounded-2xl border border-border/50 backdrop-blur-xl bg-surface/40 shadow-glow-md overflow-hidden">
                <div className="px-6 sm:px-10 py-8 sm:py-12">
                  {/* Navigation breadcrumb */}
                  <nav aria-label="Breadcrumb" className="mb-6">
                    <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                      <li>
                        <Link to="/" className="hover:text-foreground transition-colors">
                          Home
                        </Link>
                      </li>
                      <li aria-hidden="true">/</li>
                      <li className="text-foreground font-medium" aria-current="page">
                        About
                      </li>
                    </ol>
                  </nav>

                  <div className="grid lg:grid-cols-4 gap-8 items-start">
                    {/* Main content */}
                    <div className="lg:col-span-3 space-y-8">
                      <section>
                        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
                          About TextFromImage
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                          A privacy-first OCR tool built by a full-stack engineer who believed browsers could do AI locally. No servers. No uploads. No compromise.
                        </p>
                      </section>

                      <AnchorSection id="mission" title="Our Mission">
                        <section>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
                          <p className="text-foreground/90 leading-relaxed mb-4">
                            TextFromImage exists to prove that modern browsers are powerful enough to run AI-powered OCR locally. Most services require you to upload images to the cloud, exposing your data to servers, logging, and potential misuse.
                          </p>
                          <p className="text-foreground/90 leading-relaxed">
                            We built a tool where your images never leave your device. Processing happens client-side in WebAssembly and Web Workers. You get instant results without compromising privacy.
                          </p>
                        </section>
                      </AnchorSection>

                      <AnchorSection id="how-it-works" title="How It Works">
                        <section>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">How It Works</h2>
                          <ol className="space-y-3 text-foreground/90">
                            <li className="flex gap-3">
                              <span className="font-bold text-accent flex-shrink-0">1.</span>
                              <span>Upload an image. It stays in your browser's memory—never sent anywhere.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="font-bold text-accent flex-shrink-0">2.</span>
                              <span>OCR runs locally using Tesseract (WASM) or transformers.js in Web Workers.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="font-bold text-accent flex-shrink-0">3.</span>
                              <span>Results appear instantly. Copy, export, or use the text immediately.</span>
                            </li>
                          </ol>
                        </section>
                      </AnchorSection>

                      <AnchorSection id="beliefs" title="What We Believe In">
                        <section>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">What We Believe In</h2>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                              <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
                              <p className="text-sm text-foreground/80">Your data is yours. No collection, storage, or sharing without explicit consent.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                              <h3 className="font-semibold text-foreground mb-2">Speed Matters</h3>
                              <p className="text-sm text-foreground/80">Instant results, even offline. No waiting for servers or slow networks.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                              <h3 className="font-semibold text-foreground mb-2">Accessibility First</h3>
                              <p className="text-sm text-foreground/80">Works for everyone on every device. WCAG 2.1 AA, keyboard nav, screen readers.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                              <h3 className="font-semibold text-foreground mb-2">Radical Transparency</h3>
                              <p className="text-sm text-foreground/80">Open source, auditable, no dark patterns or hidden tracking.</p>
                            </div>
                          </div>
                        </section>
                      </AnchorSection>

                      <AnchorSection id="quality" title="Quality & Trust">
                        <section>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">Quality & Trust</h2>
                          <ul className="space-y-3 text-foreground/90 text-sm">
                            <li className="flex gap-2">
                              <span className="text-accent">✓</span>
                              <span><strong>Core Web Vitals:</strong> LCP &lt; 2.5s, INP &lt; 200ms, CLS &lt; 0.1</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-accent">✓</span>
                              <span><strong>Consent Mode v2:</strong> Ads load only after explicit consent</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-accent">✓</span>
                              <span><strong>Accessibility:</strong> WCAG 2.1 AA compliant</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-accent">✓</span>
                              <span><strong>Security:</strong> HTTPS, no cross-site cookies, CSP headers</span>
                            </li>
                          </ul>
                        </section>
                      </AnchorSection>

                      <AnchorSection id="get-in-touch" title="Get in Touch">
                        <section>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">Get in Touch</h2>
                          <div className="space-y-2 text-sm text-foreground/90">
                            <p>
                              Found a bug? Have a suggestion?{' '}
                              <Link
                                to="/contact"
                                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
                              >
                                Contact us
                              </Link>
                              .
                            </p>
                            <p>
                              Or reach out directly at{' '}
                              <a
                                href="mailto:hello@freetextfromimage.com"
                                className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1"
                              >
                                hello@freetextfromimage.com
                              </a>
                            </p>
                          </div>
                        </section>
                      </AnchorSection>

                      <section className="border-t border-border/50 pt-8 space-y-6">
                        <AnchorSection id="tools" title="Try Our Tools">
                          <div>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Try Our Tools</h2>
                            <ul className="space-y-2 text-sm text-foreground/90">
                              <li>
                                <Link to="/" className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1">
                                  Image → Text
                                </Link>
                                <span className="text-muted-foreground"> – Extract text from any image</span>
                              </li>
                              <li>
                                <Link to="/jpg-to-word" className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1">
                                  JPG to Word
                                </Link>
                                <span className="text-muted-foreground"> – Convert to .docx files</span>
                              </li>
                              <li>
                                <Link to="/jpg-to-excel" className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1">
                                  JPG to Excel
                                </Link>
                                <span className="text-muted-foreground"> – Convert to .xlsx spreadsheets</span>
                              </li>
                            </ul>
                          </div>
                        </AnchorSection>

                        <AnchorSection id="legal" title="Legal & More">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3">Legal & More</h3>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <a href="/privacy-policy" className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1">
                                Privacy Policy
                              </a>
                              <a href="/terms" className="text-accent hover:text-accent-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1">
                                Terms of Service
                              </a>
                              <a href="https://github.com/ParthibanRajasekaran/text-from-image" rel="nofollow noopener noreferrer" target="_blank" className="text-xs opacity-80 hover:opacity-100 text-accent transition-opacity focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-1">
                                GitHub
                              </a>
                            </div>
                          </div>
                        </AnchorSection>

                        <Link
                          to="/"
                          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-accent via-accent-2 to-primary text-background font-semibold rounded-lg hover:shadow-glow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                        >
                          Try Image → Text
                        </Link>
                      </section>
                    </div>

                    {/* Sidebar: ScrollNav + Headshot */}
                    <aside className="lg:col-span-1 flex flex-col gap-8">
                      <ScrollNav sections={sections} />
                      
                      <div className="w-full">
                        <figure className="mb-4">
                          <img
                            src="/images/headshot.jpg"
                            alt="Parthiban Rajasekaran, founder of TextFromImage"
                            width={480}
                            height={600}
                            loading="lazy"
                            decoding="async"
                            srcSet="/images/headshot.jpg 480w"
                            sizes="(min-width: 1024px) 240px, 60vw"
                            className="w-full h-auto rounded-xl shadow-lg ring-1 ring-border object-cover"
                          />
                        </figure>

                        <div className="p-4 rounded-lg bg-surface/80 border border-border/50 backdrop-blur-sm">
                          <h3 className="font-semibold text-foreground mb-1">Parthiban Rajasekaran</h3>
                          <p className="text-xs text-muted-foreground mb-3">Founder & Engineer</p>
                          <p className="text-xs text-foreground/80 leading-relaxed mb-4">
                            Full-stack engineer passionate about privacy, performance, and accessible software. Transformed a proof-of-concept into a tool used by thousands.
                          </p>

                          <div className="flex gap-2 text-xs">
                            <a href="https://www.linkedin.com/in/parthiban-rajasekaran" rel="noopener noreferrer" target="_blank" aria-label="Parthiban Rajasekaran on LinkedIn" className="flex-1 px-3 py-2 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">
                              LinkedIn
                            </a>
                            <a href="https://github.com/ParthibanRajasekaran" rel="noopener noreferrer" target="_blank" aria-label="Parthiban Rajasekaran on GitHub" className="flex-1 px-3 py-2 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">
                              GitHub
                            </a>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground text-center mt-6">
                          Last updated: {lastUpdated}
                        </p>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1">
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
