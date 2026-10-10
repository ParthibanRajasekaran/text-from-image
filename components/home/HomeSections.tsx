import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { reveal } from '../ui/reveal';
import { StatusBadge } from '../ui/StatusBadge';
import { ROUTES } from '../../router';
import { CopyButton } from './ScrollKit';

export function SectionHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary dark:text-accent">{eyebrow}</p>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
      {lead && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{lead}</p>}
    </div>
  );
}

/** A card with a cursor-following spotlight border. The glow is CSS-only; pointer position feeds two variables. */
export function SpotlightCard({
  children,
  className = '',
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);

  const inner = (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), hsl(var(--primary) / 0.22), transparent 60%)',
        }}
      />
      <div className="relative h-full">{children}</div>
    </>
  );
  const base = `group relative block overflow-hidden rounded-2xl border border-border/70 bg-surface/70 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 sm:p-8 ${className}`;

  return href ? (
    <a href={href} onMouseMove={onMove} className={base}>
      {inner}
    </a>
  ) : (
    <div onMouseMove={onMove} className={base}>
      {inner}
    </div>
  );
}

/** Statements the repo proves: each is backed by vercel.json, the e2e suite or the SDK package. */
export function FactsStrip() {
  const facts = [
    { k: '0', v: 'bytes uploaded', d: 'Images never leave the browser' },
    { k: '0', v: 'third-party scripts', d: 'CSP allows only same-origin code' },
    { k: '1', v: 'OCR engine, self-hosted', d: 'Tesseract.js WASM, English model' },
    { k: 'MIT', v: 'open source', d: 'Read every line on GitHub' },
  ];
  return (
    <section aria-label="Verifiable facts" className="container mx-auto px-4 pb-24 sm:px-6 lg:px-8">
      <motion.dl {...reveal} className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/70 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.v} className="bg-surface/90 p-6 text-center backdrop-blur">
            <dt className="sr-only">{f.v}</dt>
            <dd>
              <p className="font-display text-4xl font-bold tracking-tight">{f.k}</p>
              <p className="mt-1 text-sm font-semibold">{f.v}</p>
              <p className="mt-1 text-xs text-muted-foreground">{f.d}</p>
            </dd>
          </div>
        ))}
      </motion.dl>
    </section>
  );
}

const PLAYWRIGHT_SNIPPET = `import { expect } from '@freetextfromimage/rendercheck/playwright';

test('order confirmation', async ({ page }) => {
  await page.goto('/checkout/done');
  await expect(page).toShowText('Order 48213');
});`;

export function BentoGrid() {
  return (
    <section className="container mx-auto px-4 pb-24 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="What you get"
        title="Built like infrastructure, not a demo"
        lead="Assert on pixels from Playwright or Cypress, read screenshots in the browser, and keep every byte on your machine."
      />
      <motion.div {...reveal} className="mx-auto grid max-w-6xl gap-4 md:grid-cols-6">
        <SpotlightCard className="md:col-span-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-semibold">Assert on what users see</h3>
            <StatusBadge variant="developer-beta" size="sm" />
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            A <code className="font-mono">toShowText</code> matcher for Playwright and Cypress. Failures show expected text,
            what was read, OCR confidence and a diff.
          </p>
          <div className="mb-2 flex justify-end"><CopyButton text={PLAYWRIGHT_SNIPPET} /></div>
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll long code */}
          <pre tabIndex={0} aria-label="Code example" className="overflow-x-auto rounded-xl border border-code-border bg-code-bg p-4 font-mono text-[13px] leading-6 text-code-text">
            <code>{PLAYWRIGHT_SNIPPET}</code>
          </pre>
        </SpotlightCard>

        <SpotlightCard className="md:col-span-2" href={ROUTES.SECURITY}>
          <h3 className="font-display text-xl font-semibold">Local by construction</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A strict CSP limits network calls to your own origin. The engine, worker and language data are self-hosted.
          </p>
          <div aria-hidden="true" className="mt-6 flex items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-border bg-background/70 px-2 py-1">image</span>
            <span className="h-px flex-1 bg-gradient-to-r from-primary to-accent-2" />
            <span className="rounded-md border border-primary/50 bg-primary/10 px-2 py-1">WASM worker</span>
            <span className="text-destructive">&#x2715;</span>
            <span className="rounded-md border border-dashed border-border px-2 py-1 text-muted-foreground">network</span>
          </div>
          <p className="mt-6 text-sm font-medium text-primary dark:text-accent">See the architecture &rarr;</p>
        </SpotlightCard>

        <SpotlightCard className="md:col-span-2" href={ROUTES.REDACT_IMAGE}>
          <h3 className="font-display text-xl font-semibold">Redact before you share</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Find emails, card numbers and IBANs in a screenshot and black them out, all in your browser.
          </p>
          <p className="mt-6 text-sm font-medium text-primary dark:text-accent">Open Redact &rarr;</p>
        </SpotlightCard>

        <SpotlightCard className="md:col-span-2" href={ROUTES.AI_UI_BUG_GALLERY}>
          <h3 className="font-display text-xl font-semibold">Bugs DOM tests miss</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Worked examples of wrong currency, truncated copy and invisible text, with the assertion that catches each.
          </p>
          <p className="mt-6 text-sm font-medium text-primary dark:text-accent">Browse the gallery &rarr;</p>
        </SpotlightCard>

        <SpotlightCard className="md:col-span-2" href={ROUTES.VERIFY_DEBT_SCORE}>
          <h3 className="font-display text-xl font-semibold">Verification Debt Score</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A short self-assessment of how much AI-generated UI your team ships without checking what renders.
          </p>
          <p className="mt-6 text-sm font-medium text-primary dark:text-accent">Take the score &rarr;</p>
        </SpotlightCard>
      </motion.div>
    </section>
  );
}

export function WorkflowSteps() {
  const steps = [
    { n: '01', t: 'Import expect', d: "From '@freetextfromimage/rendercheck/playwright'" },
    { n: '02', t: 'Assert what users see', d: 'await expect(page).toShowText("Total: $14.00")' },
    { n: '03', t: 'OCR runs on your machine', d: 'The screenshot is read locally. Nothing is uploaded' },
    { n: '04', t: 'Get a clear failure', d: 'Expected vs read text, OCR confidence and a diff' },
  ];
  return (
    <section className="container mx-auto px-4 pb-24 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Workflow" title="Four lines from install to red build" />
      <ol className="relative mx-auto grid max-w-6xl gap-4 md:grid-cols-4">
        {steps.map((s, i) => (
          <motion.li
            key={s.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.08 }}
            className="relative rounded-2xl border border-border/70 bg-surface/70 p-6 backdrop-blur"
          >
            <span className="bg-gradient-to-r from-primary to-accent-2 bg-clip-text font-display text-3xl font-bold text-transparent">
              {s.n}
            </span>
            <h3 className="mt-3 font-semibold">{s.t}</h3>
            <p className="mt-2 break-words font-mono text-xs leading-relaxed text-muted-foreground">{s.d}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
