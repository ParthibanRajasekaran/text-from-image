import React from 'react';

export interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  /** Whether to include padding (default: true) */
  withPadding?: boolean;
  children: React.ReactNode;
}

/**
 * Glass: reusable surface. Name kept for existing imports; it is now a flat card.
 * - rounded-2xl, 1px hairline border, solid surface, no shadow, no blur
 * - Responsive padding optional
 */
export function Glass({
  className = '',
  withPadding = true,
  children,
  ...props
}: GlassProps) {
  const baseClasses =
    'rounded-2xl border border-border bg-surface';
  const paddingClasses = withPadding ? 'p-6 md:p-8' : '';

  return (
    <div className={`${baseClasses} ${paddingClasses} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
