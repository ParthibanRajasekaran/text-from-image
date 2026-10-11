import React from 'react';

/**
 * The RenderCheck mark: a pixel R inside scan brackets. Decorative (the wordmark carries the name),
 * so it is hidden from assistive technology. Colour follows the surrounding text.
 */
export function BrandMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" shapeRendering="crispEdges" className={className} aria-hidden="true" focusable="false">
      <path d="M6 6h10v3H9v7H6z"/><path d="M58 6h-10v3h7v7h3z"/><path d="M6 58h10v-3H9v-7H6z"/><path d="M58 58h-10v-3h7v-7h3z"/><rect x="20" y="18" width="4" height="4"/><rect x="24" y="18" width="4" height="4"/><rect x="28" y="18" width="4" height="4"/><rect x="32" y="18" width="4" height="4"/><rect x="36" y="18" width="4" height="4"/><rect x="20" y="22" width="4" height="4"/><rect x="24" y="22" width="4" height="4"/><rect x="36" y="22" width="4" height="4"/><rect x="40" y="22" width="4" height="4"/><rect x="20" y="26" width="4" height="4"/><rect x="24" y="26" width="4" height="4"/><rect x="36" y="26" width="4" height="4"/><rect x="40" y="26" width="4" height="4"/><rect x="20" y="30" width="4" height="4"/><rect x="24" y="30" width="4" height="4"/><rect x="28" y="30" width="4" height="4"/><rect x="32" y="30" width="4" height="4"/><rect x="36" y="30" width="4" height="4"/><rect x="20" y="34" width="4" height="4"/><rect x="24" y="34" width="4" height="4"/><rect x="32" y="34" width="4" height="4"/><rect x="36" y="34" width="4" height="4"/><rect x="20" y="38" width="4" height="4"/><rect x="24" y="38" width="4" height="4"/><rect x="36" y="38" width="4" height="4"/><rect x="40" y="38" width="4" height="4"/><rect x="20" y="42" width="4" height="4"/><rect x="24" y="42" width="4" height="4"/><rect x="36" y="42" width="4" height="4"/><rect x="40" y="42" width="4" height="4"/>
    </svg>
  );
}
