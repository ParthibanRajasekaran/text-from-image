import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

/** True when the pinned, scroll-driven layouts should be used: desktop width and no reduced-motion request. */
export function usePinned() {
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide && !reduce;
}

/** Page-long scan line on the left edge: the site's playhead. Decorative, so hidden from assistive tech. */
export function ScrollScanLine() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  if (reduce) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-y-0 left-0 z-40 hidden w-[2px] md:block">
      <motion.div
        className="h-full w-full origin-top bg-cyan-300"
        style={{ scaleY, boxShadow: '0 0 10px rgb(94 234 212 / 0.9)' }}
      />
    </div>
  );
}

/** Hairline section break with a glowing notch. */
export function SectionDivider() {
  return (
    <div aria-hidden="true" className="container mx-auto px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto h-px max-w-6xl bg-border/70">
        <span
          className="absolute left-1/2 top-0 h-px w-12 -translate-x-1/2 bg-cyan-400"
          style={{ boxShadow: '0 0 8px rgb(34 211 238 / 0.9)' }}
        />
      </div>
    </div>
  );
}

/** Copy button with a small spring and a green confirmation. Clipboard errors are swallowed on purpose. */
export function CopyButton({ text, label = 'Copy code', tone = 'theme' }: { text: string; label?: string; tone?: 'theme' | 'dark' }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      /* clipboard unavailable (insecure context or denied): leave the button unchanged */
    }
  };
  return (
    <motion.button
      type="button"
      onClick={copy}
      whileTap={{ scale: 0.88 }}
      animate={{ scale: done ? [1, 1.12, 1] : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      aria-label={done ? 'Copied' : label}
      className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
        done
          ? 'border-green-400/60 bg-green-400/15 text-green-300'
          : tone === 'dark'
            ? 'border-code-border text-code-text/80 hover:text-code-text'
            : 'border-border text-muted-foreground hover:text-foreground'
      }`}
    >
      {done ? 'Copied' : 'Copy'}
      <span role="status" className="sr-only">{done ? 'Copied to clipboard' : ''}</span>
    </motion.button>
  );
}
