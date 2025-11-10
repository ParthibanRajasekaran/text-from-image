import React, { useState, useCallback } from 'react';
import { useScrollSpy } from '../../hooks/useScrollSpy';

export interface ScrollNavSection {
  id: string;
  label: string;
}

interface ScrollNavProps {
  sections: ScrollNavSection[];
}

/**
 * ScrollNav: Sticky in-page section navigation with glass theme
 * 
 * Features:
 * - Desktop: Sticky sidebar (top-[var(--header-h,80px)])
 * - Mobile: Collapsible <details> with "Jump to" summary
 * - Glass morphism theme matching landing
 * - Smooth scroll to sections (respects prefers-reduced-motion)
 * - Active indicator via aria-current="location"
 * - Keyboard accessible with proper focus management
 * 
 * Usage:
 * <ScrollNav sections={[
 *   { id: 'how-it-works', label: 'How It Works' },
 *   { id: 'who', label: 'Who We Are' }
 * ]} />
 */
export function ScrollNav({ sections }: ScrollNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sectionIds = sections.map((s) => s.id);
  const currentId = useScrollSpy(sectionIds);

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
      e.preventDefault();
      setIsOpen(false);

      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;

      // Always focus the target
      targetElement.focus({ preventScroll: true });

      // Smooth scroll only if user hasn't disabled motion
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (!prefersReducedMotion) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        // Fallback: instant scroll
        targetElement.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        });
      }

      // Update URL hash
      window.history.pushState(null, '', `#${targetId}`);
    },
    []
  );

  // Desktop: Sticky nav card
  const desktopNav = (
    <nav
      aria-label="On this page"
      className="hidden lg:block sticky top-[var(--header-h,80px)] max-h-[calc(100vh-var(--header-h,80px)-2rem)] overflow-auto"
    >
      <div className="rounded-2xl border border-border/50 backdrop-blur-xl bg-surface/40 shadow-glow-md p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4 px-2">
          On this page
        </h3>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => handleAnchorClick(e, section.id)}
                aria-current={currentId === section.id ? 'location' : undefined}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                  currentId === section.id
                    ? 'text-accent font-medium bg-accent/10 border-l-2 border-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface/40'
                }`}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );

  // Mobile: Collapsible details
  const mobileNav = (
    <nav aria-label="On this page" className="lg:hidden mb-6">
      <details
        open={isOpen}
        onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
        className="rounded-2xl border border-border/50 backdrop-blur-xl bg-surface/40 shadow-glow-md overflow-hidden"
      >
        <summary className="px-4 py-3 cursor-pointer hover:bg-surface/60 transition-colors duration-150 text-sm font-semibold text-foreground flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-2xl">
          <span>Jump to</span>
          <span aria-hidden="true" className="text-xs text-muted-foreground">
            {isOpen ? '▼' : '▶'}
          </span>
        </summary>
        <ul className="space-y-1 px-2 py-3 border-t border-border/30 bg-surface/20">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => handleAnchorClick(e, section.id)}
                aria-current={currentId === section.id ? 'location' : undefined}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                  currentId === section.id
                    ? 'text-accent font-medium bg-accent/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface/40'
                }`}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );

  return (
    <>
      {desktopNav}
      {mobileNav}
    </>
  );
}
