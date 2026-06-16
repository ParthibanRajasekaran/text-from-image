import React from 'react';

export interface EnterpriseLayoutProps {
  /** Main page content */
  children: React.ReactNode;

  /** Optional sidebar content (renders in 3-col grid) */
  sidebar?: React.ReactNode;

  /** Optional JSON-LD structured data */
  jsonLd?: Record<string, any>;

  /** Optional breadcrumb navigation */
  breadcrumb?: Array<{ label: string; href?: string }>;

  /** Optional custom className */
  className?: string;
}

/**
 * EnterpriseLayout: Content page layout for professional SaaS pages
 * - Solid background (no Aurora gradient)
 * - 12-column grid with optional sidebar
 * - Single <div> landmark (AppShell provides root <main>)
 * - Used for: /developers, /rendercheck, /case-studies, /access, /labs, /changelog
 */
export function EnterpriseLayout({
  children,
  sidebar,
  jsonLd,
  breadcrumb,
  className = '',
}: EnterpriseLayoutProps) {
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div
        id="enterprise-content"
        className={`relative min-h-screen py-16 sm:py-20 lg:py-24 bg-background ${className}`}
        role="main"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            {breadcrumb && breadcrumb.length > 0 && (
              <nav aria-label="Breadcrumb" className="mb-8">
                <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                  {breadcrumb.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <li>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="hover:text-foreground transition-colors"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <span className="text-foreground font-semibold" aria-current="page">
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

            {/* Content grid */}
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Main content */}
              <div className={sidebar ? 'lg:col-span-9' : 'lg:col-span-12'}>
                {children}
              </div>

              {/* Optional sidebar */}
              {sidebar && (
                <aside className="lg:col-span-3 flex flex-col gap-8 sticky top-[calc(var(--header-h)+3rem)]">
                  {sidebar}
                </aside>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
