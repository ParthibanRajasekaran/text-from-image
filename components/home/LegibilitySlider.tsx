import React, { useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { reveal } from '../ui/reveal';
import { SectionHeading } from './HomeSections';

/** Preview surface is always #f8fafc, so the contrast maths below does not depend on the site theme. */
const SURFACE = { r: 248, g: 250, b: 252 };
/** WCAG 2.x AA for normal text. */
const AA = 4.5;

function luminance(r: number, g: number, b: number) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(gray: number) {
  const a = luminance(SURFACE.r, SURFACE.g, SURFACE.b);
  const b = luminance(gray, gray, gray);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Interactive range slider: drag the text colour towards the background and watch a visible-text
 * check flip. The ratio is real WCAG arithmetic, computed live. It illustrates the kind of failure
 * a DOM assertion cannot see; it is not a live OCR run, and the card says so.
 */
export function LegibilitySlider() {
  const id = useId();
  const [v, setV] = useState(18); // 0 = black text, 100 = same as the surface
  const gray = Math.round((v / 100) * 248);
  const ratio = useMemo(() => contrastRatio(gray), [gray]);
  const pass = ratio >= AA;
  const pct = Math.min(100, (ratio / 21) * 100);
  const verdict = pass ? 'PASS' : 'FAIL';

  return (
    <section className="container mx-auto px-4 pb-24 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Play with it"
        title="Same DOM. Different reality."
        lead="The string in the page never changes. Drag the slider and see when a person, and a pixel-level check, stops being able to read it."
      />
      <motion.div
        {...reveal}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border/70 bg-surface/80 p-6 shadow-elevation-3 backdrop-blur sm:p-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl transition-colors duration-500"
          style={{ background: pass ? 'hsl(var(--accent) / 0.22)' : 'hsl(var(--destructive) / 0.22)' }}
        />
        <div className="relative grid gap-8 md:grid-cols-5">
          {/* the screen being tested */}
          <div className="md:col-span-3">
            <div
              className="flex min-h-[11rem] items-center justify-center rounded-2xl border border-black/10 p-8"
              style={{ background: `rgb(${SURFACE.r} ${SURFACE.g} ${SURFACE.b})` }}
            >
              <p
                className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
                style={{ color: `rgb(${gray} ${gray} ${gray})` }}
              >
                Payment successful
              </p>
            </div>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              DOM text: <span className="text-foreground">&quot;Payment successful&quot;</span> &middot; always correct
            </p>
          </div>

          {/* the verdict */}
          <div className="flex flex-col justify-between gap-6 md:col-span-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Contrast ratio</p>
              <p className="mt-1 font-display text-5xl font-bold tabular-nums tracking-tight">
                {ratio.toFixed(1)}
                <span className="text-2xl text-muted-foreground">:1</span>
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-border/70" aria-hidden="true">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${pass ? 'bg-status-live' : 'bg-destructive'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">AA needs {AA}:1 for body text</p>
            </div>
            <div
              role="status"
              className={`rounded-xl border p-4 font-mono text-sm font-semibold transition-colors duration-300 ${
                pass
                  ? 'border-status-live/40 bg-status-live/10 text-status-live'
                  : 'border-destructive/40 bg-destructive/10 text-red-700 dark:text-red-300'
              }`}
            >
              {verdict} &middot; {pass ? 'readable by people and OCR' : 'text is on screen but unreadable'}
            </div>
          </div>
        </div>

        {/* the slider */}
        <div className="relative mt-8">
          <label htmlFor={id} className="mb-1 block text-sm font-medium">
            Text colour: black to background
          </label>
          <input
            id={id}
            type="range"
            min={0}
            max={100}
            value={v}
            onChange={(e) => setV(Number(e.target.value))}
            className="rc-range"
            style={
              {
                '--rc-track': 'linear-gradient(90deg, #0b0f19, rgb(248 250 252))',
                '--rc-thumb': pass ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                '--rc-halo': pass ? 'hsl(var(--primary) / 0.25)' : 'hsl(var(--destructive) / 0.3)',
              } as React.CSSProperties
            }
            aria-valuetext={`${ratio.toFixed(1)} to 1 contrast, ${verdict}`}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Illustration: the ratio is real WCAG arithmetic, computed live in your browser. It is not an OCR run.
            RenderCheck reads real screenshots in your tests and flags text a user cannot see.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
