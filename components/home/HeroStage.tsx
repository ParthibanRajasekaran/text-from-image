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
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
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
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
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
                  style={{ opacity: boxOpacity }}
                />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Order 48213 &middot; confirmation sent</p>
              <div className="mt-5 h-9 w-32 rounded-lg bg-primary/90" />

              {/* scan line */}
              {!reduce && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 h-16 bg-foreground/[0.12] dark:bg-foreground/[0.07]"
                  style={{ top: scanTop, opacity: scanOpacity, borderBottom: '2px solid hsl(var(--text))' }}
                />
              )}
            </div>
          </div>

          {/* right: the assertion and its verdict */}
          <div className="p-6 sm:p-8 lg:p-5 2xl:p-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Assertion</p>
              <CopyButton text={"await expect(page).toShowText('Payment successful');"} />
            </div>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll long code */}
            <pre tabIndex={0} aria-label="Code example" className="overflow-x-auto rounded-xl border border-code-border bg-code-bg p-4 font-mono text-[13px] leading-6 text-code-text lg:px-3 lg:text-[11px] 2xl:px-4 2xl:text-[13px]">
              <code>
                <span className="text-code-text/70">await</span> expect(page)
                {'\n'}  .<span className="text-white">toShowText</span>(
                <span className="text-code-text/70">'Payment successful'</span>);
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
 * Desktop (lg+): copy on the left (5 of 12 columns), the demo on the right (7 of 12). Both stay pinned under the
 * header for 2.4 screens while scroll position plays the demo. Mobile and reduced motion: stacked, normal flow,
 * no scroll hijacking. Reduced motion shows the finished state.
 */
function HeroLayout({ children }: { children: React.ReactNode }) {
  const pinned = usePinned();
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: pinned ? ['start start', 'end end'] : ['start 85%', 'end 45%'],
  });
  const done = useMotionValue(1);
  return (
    <div ref={ref} style={pinned ? { height: '240vh' } : undefined}>
      <div
        className={`grid items-center gap-12 lg:grid-cols-12 lg:gap-10 ${
          pinned ? 'sticky top-24 min-h-[calc(100vh-7rem)]' : ''
        }`}
      >
        <div className="space-y-8 text-center lg:col-span-5 lg:text-left">{children}</div>
        <div className="lg:col-span-7">
          <ScanDemo progress={reduce ? done : scrollYProgress} />
        </div>
      </div>
    </div>
  );
}

export function HeroStage() {
  return (
    <section className="relative isolate overflow-x-clip">
      {/* backdrop: a hairline grid that fades out, nothing else */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.045] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--text)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--text)) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-24">
        <HeroLayout>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <StatusBadge variant="developer-beta" label="Developer Beta" size="md" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="font-display text-5xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-[3.5rem] xl:text-[4.25rem] [text-wrap:balance]"
          >
            Verify what <span className="whitespace-nowrap">AI-generated</span> UI actually shows
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg leading-relaxed lg:mx-0 tracking-[-0.01em] text-muted-foreground sm:text-xl"
          >
            Your DOM tests pass while users read the wrong text. RenderCheck reads the rendered pixels
            locally, in your test process or your browser, and fails the build when what users see is wrong.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="flex flex-col justify-center gap-4 pt-2 sm:flex-row lg:justify-start"
          >
            <a
              href={ROUTES.DEVELOPERS}
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-[15px] font-medium text-primary-foreground transition duration-150 hover:opacity-85 active:scale-[0.98]"
            >
              Read the docs
            </a>
            <a
              href="#ocr-tool"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-[15px] font-medium transition duration-150 hover:bg-foreground/[0.04] active:scale-[0.98]"
            >
              Try the browser OCR
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto w-full max-w-md overflow-hidden rounded-xl lg:mx-0 border border-code-border bg-code-bg text-left font-mono text-sm text-code-text"
          >
            <div className="flex items-center gap-1.5 border-b border-code-border px-3.5 py-2.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="ml-3 text-[11px] text-code-text/70">terminal</span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span><span className="select-none text-code-text/70">$ </span>npm i -D @rendercheck/sdk</span>
              <CopyButton text="npm i -D @rendercheck/sdk" label="Copy install command" tone="dark" />
            </div>
          </motion.div>

          <p className="text-sm text-muted-foreground">
            Works with <span className="text-foreground">Playwright</span>, <span className="text-foreground">Cypress</span> and{' '}
            <span className="text-foreground">GitHub Actions</span>
          </p>
        </HeroLayout>
      </div>
    </section>
  );
}
