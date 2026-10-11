import React from 'react';
import { PageBackdrop } from './PageBackdrop';

interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page wrapper with the shared RenderCheck backdrop (grid, glows, scan hairline).
 * Kept under its old name so existing layouts and tests keep working.
 */
export function AuroraBackground({ children, className = '' }: AuroraBackgroundProps) {
  return (
    <div className={`relative isolate min-h-screen overflow-x-clip ${className}`}>
      <PageBackdrop />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
