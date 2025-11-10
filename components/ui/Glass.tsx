import React from 'react';

export interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  /** Whether to include padding (default: true) */
  withPadding?: boolean;
  children: React.ReactNode;
}

/**
 * Glass: Reusable glass-morphism container matching landing theme
 * - rounded-2xl border-white/10 bg-white/6 dark:bg-white/5 backdrop-blur-xl
 * - Subtle inner hairline + drop shadow
 * - Responsive padding optional
 */
export function Glass({
  className = '',
  withPadding = true,
  children,
  ...props
}: GlassProps) {
  const baseClasses =
    'rounded-2xl border border-white/10 bg-white/6 dark:bg-white/5 backdrop-blur-xl shadow-lg';
  const paddingClasses = withPadding ? 'p-6 md:p-8' : '';

  return (
    <div className={`${baseClasses} ${paddingClasses} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
