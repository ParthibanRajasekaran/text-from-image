import React, { ReactNode } from 'react';

interface GuideLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/**
 * GuideLayout - Consistent layout for all guide pages
 * Provides centered container with card aesthetics matching landing page
 */
export function GuideLayout({ title, subtitle, children }: GuideLayoutProps) {
  return (
    <main id="main" role="main" className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="rounded-2xl border border-border/50 shadow-xl backdrop-blur bg-gradient-to-br from-white/70 to-white/30 dark:from-white/5 dark:to-white/0 px-6 sm:px-8 py-8">
          <header className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-muted-foreground">
                {subtitle}
              </p>
            )}
          </header>
          
          <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
            {children}
          </article>
        </div>
      </div>
    </main>
  );
}
