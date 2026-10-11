import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Shared backdrop for every content page: a faint grid that fades out, two soft glows and a cyan
 * scan hairline that sweeps once when the page loads. Decorative only, so it is hidden from assistive tech
 * and never takes pointer events. Static when the visitor prefers reduced motion.
 */
export function PageBackdrop() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.1]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--text)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--text)) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 75% 45% at 50% 0%, #000 25%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 45% at 50% 0%, #000 25%, transparent 75%)',
        }}
      />
      <div
        className="absolute -top-32 left-[10%] h-[26rem] w-[26rem] rounded-full opacity-25 blur-3xl dark:opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -top-24 right-[8%] h-[24rem] w-[24rem] rounded-full opacity-25 blur-3xl dark:opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(var(--accent-2)) 0%, transparent 70%)' }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-border/70" />
      <motion.div
        className="absolute top-0 h-px w-40 bg-cyan-400"
        style={{ boxShadow: '0 0 10px rgb(34 211 238 / 0.9)', left: reduce ? '50%' : undefined }}
        initial={reduce ? false : { left: '-10%', opacity: 0 }}
        animate={reduce ? undefined : { left: '100%', opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.6, ease: 'easeInOut' }}
      />
    </div>
  );
}
