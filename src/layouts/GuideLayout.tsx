import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AuroraBackground } from '../../components/AuroraBackground';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useTheme } from '../../hooks/useTheme';

interface GuideLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * GuideLayout - Premium layout matching landing page aesthetics
 * 
 * Features:
 * - Aurora gradient background (same as HeroOCR)
 * - Glass-morphism card with backdrop blur
 * - Breadcrumb navigation (Home / Guides / Page)
 * - Theme toggle (matches landing)
 * - Consistent H1/H2 scale with landing page
 * - Prose styles for rich content
 * - Zero CLS: all positioned with reserved space
 */
export function GuideLayout({ title, description, children }: GuideLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <AuroraBackground>
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Fixed header with theme toggle */}
      <header className="fixed top-0 right-0 z-50 p-4">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>

      <main id="main-content" className="relative min-h-screen py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Glass-morphism card matching landing page */}
            <div className="rounded-2xl border border-border/50 backdrop-blur-xl bg-surface/40 shadow-glow-md overflow-hidden">
              {/* Card content with generous padding */}
              <div className="px-6 sm:px-10 py-8 sm:py-12">
                {/* Breadcrumb - subtle navigation */}
                <nav aria-label="Breadcrumb" className="mb-6">
                  <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                    <li>
                      <Link to="/" className="hover:text-foreground transition-colors">
                        Home
                      </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li>
                      <span className="text-muted-foreground/60">Guides</span>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li className="text-foreground font-medium" aria-current="page">
                      {title}
                    </li>
                  </ol>
                </nav>

                {/* Page header - matches landing H1 scale */}
                <header className="mb-10 text-center">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                      {description}
                    </p>
                  )}
                </header>

                {/* Article content with prose styles */}
                <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-h2:text-3xl prose-h2:font-bold prose-h2:tracking-tight prose-h2:mb-4 prose-h2:mt-8 prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-p:text-foreground/90 prose-p:leading-relaxed prose-li:text-foreground/90 prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-accent prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                  {children}
                </article>
              </div>
            </div>

            {/* Back to home link - subtle CTA */}
            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span aria-hidden="true">←</span>
                <span>Back to OCR Tool</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </AuroraBackground>
  );
}
