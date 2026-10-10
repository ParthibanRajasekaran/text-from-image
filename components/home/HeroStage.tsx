import React from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { CopyButton, usePinned } from './ScrollKit';
import { StatusBadge } from '../ui/StatusBadge';
import { ROUTES } from '../../router';

/**
 * Animated, synthetic demonstration: RenderCheck reads a rendered confirmation screen, finds the typo
 * the DOM test could not see, and fails the assertion. Purely illustrative, and labelled as such.
 */
function ScanDemo({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  // Everything below is driven by scroll position (0 to 1), not by time.
  const scanTop = useTransform(progress, [0.15, 0.65], ['-20%', '100%']);
  const scanOpacity = useTransform(progress, [0.1, 0.15, 0.65, 0.7], [0, 1, 1, 0]);
  const boxOpacity = useTransform(progress, [0.6, 0.75], [0, 1]);
  const verdictOpacity = useTransform(progress, [0.55, 0.8], [0, 1]);
  const verdictY = useTransform(progress, [0.55, 0.8], [24, 0]);
  const verdictX = useTransform(progress, [0.4, 0.85], [40, 0]);

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-accent/25 via-primary/25 to-accent-2/25 blur-3xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-surface/80 shadow-elevation-4 backdrop-blur-xl">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-destructive/70" />
          <span className="h-3 w-3 rounded-full bg-status-evidence-pending/70" />
          <span className="h-3 w-3 rounded-full bg-status-live/60" />
          <span className="ml-3 truncate font-mono text-xs text-muted-foreground">
            checkout.spec.ts &middot; rendercheck
          </span>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          {/* left: the rendered screen under test */}
          <div className="relative border-b border-border/60 p-6 sm:p-8 md:border-b-0 md:border-r">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Rendered screen
            </p>
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/70 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-status-live/15 text-status-live">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="relative inline-block font-display text-2xl font-semibold tracking-tight">
                Payment succesful
                {/* detection box around the misspelt word */}
                <motion.span
                  aria-hidden="true"
                  className="absolute -inset-x-1.5 -inset-y-1 rounded-md border-2 border-rose-400"
                  style={{ opacity: boxOpacity, boxShadow: '0 0 18px rgb(251 113 133 / 0.55)' }}
                />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Order 48213 &middot; confirmation sent</p>
              <div className="mt-5 h-9 w-32 rounded-lg bg-primary/90" />

              {/* scan line */}
              {!reduce && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-cyan-300/30 to-transparent"
                  style={{ top: scanTop, opacity: scanOpacity, borderBottom: '2px solid rgb(94 234 212)', boxShadow: '0 4px 14px rgb(94 234 212 / 0.5)' }}
                />
              )}
            </div>
          </div>

          {/* right: the assertion and its verdict */}
          <div className="p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Assertion</p>
              <CopyButton text={"await expect(page).toShowText('Payment successful');"} />
            </div>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll long code */}
            <pre tabIndex={0} aria-label="Code example" className="overflow-x-auto rounded-xl border border-code-border bg-code-bg p-4 font-mono text-[13px] leading-6 text-code-text">
              <code>
                <span className="text-accent-2">await</span> expect(page)
                {'\n'}  .<span className="text-cyan-300">toShowText</span>(
                <span className="text-emerald-300">'Payment successful'</span>);
              </code>
            </pre>

            <motion.div
              className="mt-4 rounded-xl border border-rose-400/40 bg-rose-400/10 p-4"
              style={{ opacity: verdictOpacity, x: verdictX, y: verdictY }}
            >
              <p className="font-mono text-sm font-semibold text-red-700 dark:text-red-300">FAIL &middot; text mismatch</p>
              <dl className="mt-2 space-y-1 font-mono text-xs text-foreground/80">
                <div className="flex gap-2"><dt className="w-16 text-muted-foreground">expected</dt><dd>Payment successful</dd></div>
                <div className="flex gap-2"><dt className="w-16 text-muted-foreground">read</dt><dd>Payment succesful</dd></div>
              </dl>
            </motion.div>
            <p className="mt-4 text-xs text-muted-foreground">
              Synthetic example. The DOM says the right string; the pixels do not.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Desktop: the demo pins under the header for 2.4 screens of scroll and the scroll position plays it.
 * Mobile and reduced motion: normal flow, no scroll hijacking. Reduced motion shows the finished state.
 */
function PinnedStage() {
  const pinned = usePinned();
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: pinned ? ['start start', 'end end'] : ['start 85%', 'end 45%'],
  });
  const done = useMotionValue(1);
  return (
    <div ref={ref} className="mt-16 sm:mt-20" style={pinned ? { height: '240vh' } : undefined}>
      <div className={pinned ? 'sticky top-24' : ''}>
        <ScanDemo progress={reduce ? done : scrollYProgress} />
      </div>
    </div>
  );
}

export function HeroStage() {
  return (
    <section className="relative isolate overflow-x-clip">
      {/* backdrop: grid fading out, plus two slow aurora blobs */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.1]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--text)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--text)) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)',
          }}
        />
        <motion.div
          className="absolute -top-40 left-[8%] h-[34rem] w-[34rem] rounded-full opacity-30 blur-3xl dark:opacity-25"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)' }}
          animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -top-24 right-[4%] h-[30rem] w-[30rem] rounded-full opacity-30 blur-3xl dark:opacity-25"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent-2)) 0%, transparent 70%)' }}
          animate={{ x: [0, -70, 0], y: [0, 50, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container mx-auto px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-32">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <StatusBadge variant="developer-beta" label="Developer Beta" size="md" pulse />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Verify what AI-generated UI{' '}
            <span className="bg-gradient-to-r from-primary via-accent-2 to-primary bg-clip-text text-transparent dark:from-accent dark:via-primary dark:to-accent-2">
              actually shows
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Your DOM tests pass while users read the wrong text. RenderCheck reads the rendered pixels
            locally, in your test process or your browser, and fails the build when what users see is wrong.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="flex flex-col justify-center gap-4 pt-2 sm:flex-row"
          >
            <a
              href={ROUTES.DEVELOPERS}
              className="rounded-2xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-glow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
            >
              Add it to your tests
            </a>
            <a
              href="#ocr-tool"
              className="rounded-2xl border border-border bg-surface/60 px-8 py-4 font-semibold backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60"
            >
              Try the browser OCR
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto flex w-fit items-center gap-3 rounded-xl border border-code-border bg-code-bg px-4 py-2 font-mono text-sm text-code-text"
          >
            <span>npm i -D @freetextfromimage/rendercheck</span>
            <CopyButton text="npm i -D @freetextfromimage/rendercheck" label="Copy install command" tone="dark" />
          </motion.div>
        </div>

        <PinnedStage />
      </div>
    </section>
  );
}
