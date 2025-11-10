import React, { ReactNode } from 'react';

interface AnchorSectionProps {
  id: string;
  title: string;
  level?: 2 | 3 | 4;
  className?: string;
  children: ReactNode;
}

/**
 * AnchorSection: Wraps section headings with scroll-spy support
 * 
 * Automatically:
 * - Adds unique id for anchor navigation
 * - Makes heading focusable with tabIndex={-1} for programmatic focus
 * - Adds scroll-margin-top to account for fixed header
 * - Marks section with data-section attribute for styling
 * 
 * Usage:
 * <AnchorSection id="how-it-works" title="How It Works">
 *   <h2>How It Works</h2>
 *   <p>...</p>
 * </AnchorSection>
 */
export function AnchorSection({
  id,
  title,
  level = 2,
  className = '',
  children,
}: AnchorSectionProps) {
  const HeadingTag = `h${level}` as const;

  return (
    <section
      id={id}
      data-section={id}
      tabIndex={-1}
      className={`scroll-mt-[var(--header-h,80px)] focus:outline-none ${className}`}
      aria-labelledby={`${id}-heading`}
    >
      {/* Render heading as provided by children OR create one */}
      {children ? (
        children
      ) : (
        <HeadingTag id={`${id}-heading`} className="scroll-mt-[var(--header-h,80px)]">
          {title}
        </HeadingTag>
      )}
    </section>
  );
}
