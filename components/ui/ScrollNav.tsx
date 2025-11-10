import React, { useState, useCallback, useEffect, useRef } from 'react';

export interface ScrollNavSection {
  id: string;
  label: string;
}

interface ScrollNavProps {
  sections: ScrollNavSection[];
}

// Sticky header height in pixels
const HEADER_OFFSET = 96;

/**
 * ScrollNav: Sticky in-page section navigation with glass theme
 * 
 * Features:
 * - Single source of truth: IntersectionObserver-based activeId state
 * - Desktop: Sticky sidebar with glass morphism
 * - Mobile: Collapsible <details> with "Jump to" summary
 * - Proper focus state decoupled from active state
 * - Account for sticky header offset to prevent boundary flicker
 * - Smooth scroll respects prefers-reduced-motion
 * - aria-current="location" on active link only
 * 
 * Styles:
 * - ACTIVE: filled chip with bg-accent/20, font-semibold
 * - INACTIVE: subtle, hover-enabled
 * - FOCUS: ring only, no fill
 * 
 * Usage:
 * <ScrollNav sections={[
 *   { id: 'how-it-works', label: 'How It Works' },
 *   { id: 'who', label: 'Who We Are' }
 * ]} />
 */
export function ScrollNav({ sections }: ScrollNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const suspendObserverRef = useRef<boolean>(false);
  const suspendTimeoutRef = useRef<number | null>(null);

  // Set scroll-margin-top on sections to account for sticky header
  useEffect(() => {
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        element.style.scrollMarginTop = `${HEADER_OFFSET + 8}px`;
      }
    });
  }, [sections]);

  // Setup IntersectionObserver for scroll spy
  useEffect(() => {
    if (sections.length === 0) return;

    // Create observer with aggressive rootMargin to catch sections
    // being scrolled into view under the sticky header
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Don't update during link click suspension
        if (suspendObserverRef.current) return;

        // Find entry with highest intersection ratio (most visible)
        let mostVisibleEntry = entries.reduce((best, current) => {
          if (!best) return current;
          return current.intersectionRatio > best.intersectionRatio ? current : best;
        });

        // Update activeId based on most visible entry
        if (mostVisibleEntry && mostVisibleEntry.intersectionRatio > 0) {
          setActiveId(mostVisibleEntry.target.id);
        }
      },
      {
        rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`,
        threshold: [0.15, 0.55, 0.8],
      }
    );

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (suspendTimeoutRef.current !== null) {
        clearTimeout(suspendTimeoutRef.current);
      }
    };
  }, [sections]);

  // Handle link click: update active immediately, suspend observer briefly
  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
      e.preventDefault();
      setIsOpen(false);

      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;

      // Set active immediately to prevent double-active flicker
      setActiveId(targetId);

      // Suspend observer updates for 600ms
      suspendObserverRef.current = true;
      if (suspendTimeoutRef.current !== null) {
        clearTimeout(suspendTimeoutRef.current);
      }
      suspendTimeoutRef.current = window.setTimeout(() => {
        suspendObserverRef.current = false;
        suspendTimeoutRef.current = null;
      }, 600);

      // Focus the target
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

  // Link style classes
  const getNavLinkClasses = (isActive: boolean): string => {
    const baseClasses =
      'block px-3 py-2 text-sm rounded-lg transition-colors duration-150';
    const focusClasses =
      'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none';

    if (isActive) {
      // ACTIVE: filled chip, no focus ring background
      return `${baseClasses} ${focusClasses} bg-accent/20 text-accent font-semibold`;
    } else {
      // INACTIVE: subtle, hover enabled, focus ring only
      return `${baseClasses} ${focusClasses} text-foreground/80 hover:bg-muted/40`;
    }
  };

  // Desktop: Sticky nav card
  const desktopNav = (
    <nav
      aria-label="On this page"
      className="hidden lg:block sticky top-[var(--header-h,96px)] max-h-[calc(100vh-var(--header-h,96px)-2rem)] overflow-auto"
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
                aria-current={activeId === section.id ? 'location' : undefined}
                className={getNavLinkClasses(activeId === section.id)}
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
        <summary className="px-4 py-3 cursor-pointer hover:bg-surface/60 transition-colors duration-150 text-sm font-semibold text-foreground flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none rounded-2xl">
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
                aria-current={activeId === section.id ? 'location' : undefined}
                className={getNavLinkClasses(activeId === section.id)}
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
