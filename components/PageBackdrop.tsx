import React from 'react';

/**
 * Shared backdrop for every content page: a faint hairline grid that fades out. Decorative only, so it
 * is hidden from assistive tech and never takes pointer events. No colour, no motion, no layout shift.
 */
export function PageBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.045] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--text)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--text)) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 75% 45% at 50% 0%, #000 25%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 45% at 50% 0%, #000 25%, transparent 75%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-border" />
    </div>
  );
}
