import React, { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { SectionHeading } from './HomeSections';
import { usePinned } from './ScrollKit';

const ROWS = [
  { m: 'GET', u: '/ocr/worker.min.js', s: '200', b: 'same origin', ok: true },
  { m: 'GET', u: '/ocr/tesseract-core-simd-lstm.wasm.js', s: '200', b: 'same origin', ok: true },
  { m: 'GET', u: '/ocr/eng.traineddata.gz', s: '200', b: 'same origin', ok: true },
  { m: 'POST', u: 'https://upload.example/ingest', s: 'BLOCKED', b: '0 B', ok: false },
  { m: 'GET', u: 'https://cdn.example/analytics.js', s: 'BLOCKED', b: '0 B', ok: false },
] as const;

function LedgerRow({ row, i, progress }: { row: (typeof ROWS)[number]; i: number; progress: MotionValue<number> }) {
  const start = 0.12 + i * 0.13;
  const opacity = useTransform(progress, [start, start + 0.08], [0, 1]);
  const x = useTransform(progress, [start, start + 0.08], [16, 0]);
  return (
    <motion.li
      style={{ opacity, x }}
      className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border-b border-code-border/60 px-4 py-2.5 font-mono text-xs"
    >
      <span className="text-code-text/60">{row.m}</span>
      <span className="truncate text-code-text">{row.u}</span>
      <span className={row.ok ? 'text-emerald-300' : 'text-rose-300'}>
        {row.s} <span className="text-code-text/60">&middot; {row.b}</span>
      </span>
    </motion.li>
  );
}

/**
 * Scroll-driven "zero bytes" ledger. It is a labelled simulation: the rows show what the self-hosted
 * engine loads and what the CSP would refuse. The real check is e2e/smoke.spec.ts, which fails the build
 * on any off-origin or upload request during an OCR run.
 */
function Ledger({ progress }: { progress: MotionValue<number> }) {
  const stampOpacity = useTransform(progress, [0.78, 0.9], [0, 1]);
  const stampScale = useTransform(progress, [0.78, 0.9], [1.15, 1]);
  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-5">
      <div className="rounded-2xl border border-border/70 bg-surface/70 p-6 backdrop-blur md:col-span-2">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Browser</p>
        <p className="mt-2 font-display text-xl font-semibold">screenshot.png</p>
        <p className="mt-1 text-sm text-muted-foreground">Read by a WASM worker inside this tab.</p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-border/70" aria-hidden="true">
          <motion.div className="h-full origin-left bg-foreground" style={{ scaleX: progress }} />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-code-border bg-code-bg md:col-span-3">
        <div className="flex items-center justify-between border-b border-code-border px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-code-text/70">
          <span>Network (simulated)</span>
          <span>{ROWS.length} requests</span>
        </div>
        <ul className="min-h-[13rem]">
          {ROWS.map((r, i) => (
            <React.Fragment key={r.u}>
              <LedgerRow row={r} i={i} progress={progress} />
            </React.Fragment>
          ))}
        </ul>
        <motion.div
          style={{ opacity: stampOpacity, scale: stampScale }}
          className="border-t border-code-border bg-white/[0.06] px-4 py-3 font-mono text-sm font-semibold text-white"
        >
          Off-origin requests: 0 &middot; bytes uploaded: 0
        </motion.div>
      </div>
    </div>
  );
}

export function ProofLedger() {
  const pinned = usePinned();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: pinned ? ['start start', 'end end'] : ['start 85%', 'end 55%'],
  });
  const done = useMotionValue(1);
  return (
    <section className="container mx-auto px-4 pb-24 sm:px-6 lg:px-8">
      <div ref={ref} style={pinned ? { height: '220vh' } : undefined}>
        <div className={pinned ? 'sticky top-24' : ''}>
          <SectionHeading
            eyebrow="Proof"
            title="Zero bytes leave your machine"
            lead="Watch the ledger. The engine loads from this origin, and anything else is refused by the Content Security Policy."
          />
          <Ledger progress={reduce ? done : scrollYProgress} />
          <p className="mx-auto mt-6 max-w-5xl text-xs text-muted-foreground">
            Simulated for illustration. The real check runs in CI: e2e/smoke.spec.ts fails on any off-origin or upload request
            during an OCR run.
          </p>
        </div>
      </div>
    </section>
  );
}
