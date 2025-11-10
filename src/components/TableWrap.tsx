import React, { ReactNode } from 'react';

interface TableWrapProps {
  children: ReactNode;
  className?: string;
}

/**
 * TableWrap - Responsive table wrapper with consistent styling
 * Provides overflow scroll on small screens and border styling
 */
export function TableWrap({ children, className = '' }: TableWrapProps) {
  return (
    <div className={`mt-6 overflow-x-auto rounded-xl border border-border/60 ${className}`}>
      <table className="min-w-full text-sm border-collapse">
        {children}
      </table>
    </div>
  );
}
