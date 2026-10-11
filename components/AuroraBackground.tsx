import React from 'react';
import { PageBackdrop } from './PageBackdrop';

interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page shell with the shared hairline-grid backdrop. Kept under its old name so existing pages need no change.
 * No gradients, blobs or animation: all absolutely positioned, so zero layout shift.
 */
export function AuroraBackground({ children, className = '' }: AuroraBackgroundProps) {
  return (
    <div className={`relative isolate min-h-screen overflow-x-clip ${className}`}>
      <PageBackdrop />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
