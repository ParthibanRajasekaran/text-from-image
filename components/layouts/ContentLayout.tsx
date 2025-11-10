import React from 'react';
import { AuroraBackground } from '../AuroraBackground';
import { ThemeToggle } from '../ThemeToggle';

export interface ContentLayoutProps {
  /** Page title for SEO */
  title: string;
  /** Page subtitle or intro */
  subtitle?: string;
  /** Main content */
  children: React.ReactNode;
  /** Optional sidebar content */
  side?: React.ReactNode;
  /** Optional JSON-LD structured data */
  jsonLd?: Record<string, any>;
  /** Current theme ('light' | 'dark') */
  theme?: string;
  /** Theme toggle callback */
  onToggleTheme?: () => void;
  /** Optional breadcrumb items */
  breadcrumb?: Array<{ label: string; href?: string }>;
}

/**
 * ContentLayout: Unified page layout using Glass theme
 * - Single <main> element with id="main-content"
 * - max-w container, 12-col grid
 * - Slots: title/subtitle/children/side/jsonLd
 * - Aurora background, theme toggle, skip link
 */
export function ContentLayout({
  title,
  subtitle,
  children,
  side,
  jsonLd,
  theme,
  onToggleTheme,
  breadcrumb,
}: ContentLayoutProps) {
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <AuroraBackground>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>

        {theme && onToggleTheme && (
          <header className="fixed top-0 right-0 z-50 p-4">
            <ThemeToggle theme={theme} toggleTheme={onToggleTheme} />
          </header>
        )}

        <main id="main-content" className="relative min-h-screen py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {/* Breadcrumb */}
              {breadcrumb && breadcrumb.length > 0 && (
                <nav aria-label="Breadcrumb" className="mb-6">
                  <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                    {breadcrumb.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <li>
                          {item.href ? (
                            <a href={item.href} className="hover:text-foreground transition-colors">
                              {item.label}
                            </a>
                          ) : (
                            <span className="text-foreground font-medium" aria-current="page">
                              {item.label}
                            </span>
                          )}
                        </li>
                        {idx < breadcrumb.length - 1 && <li aria-hidden="true">/</li>}
                      </React.Fragment>
                    ))}
                  </ol>
                </nav>
              )}

              {/* 12-col grid layout */}
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Main content (9 cols or full width) */}
                <div className={side ? 'lg:col-span-9' : 'lg:col-span-12'}>
                  {/* Title section */}
                  {title && (
                    <section className="mb-8">
                      <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
                        {title}
                      </h1>
                      {subtitle && (
                        <p className="text-lg text-muted-foreground max-w-2xl">{subtitle}</p>
                      )}
                    </section>
                  )}

                  {/* Children */}
                  {children}
                </div>

                {/* Sidebar (3 cols) */}
                {side && <aside className="lg:col-span-3 flex flex-col gap-8">{side}</aside>}
              </div>
            </div>
          </div>
        </main>
      </AuroraBackground>
    </>
  );
}
