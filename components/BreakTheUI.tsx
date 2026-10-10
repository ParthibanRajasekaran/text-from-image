import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OCREngineClient } from '../src/core/ocr/engineClient';
import { analyzeWordContrast } from '../src/core/analysis/contrast';
import { renderVerdict, type Verdict } from '../src/core/analysis/verdict';
import { BUGS, EXPECTED_TOTAL, domVerdict, type BugId, type DomSnapshot, type DomVerdict } from '../src/core/playground/bugs';
import { rasterizeElement } from '../src/core/playground/rasterize';
import { readImageData } from './HeroDemo';
import { DiffView } from './DiffView';

const CARD_CSS = `
.btu-card{box-sizing:border-box;width:340px;padding:20px;background:#fff;color:#111827;font-family:Arial,Helvetica,sans-serif;border:1px solid #d1d5db}
.btu-card h3{margin:0 0 12px;font-size:18px;font-weight:700}
.btu-row{display:flex;justify-content:space-between;font-size:16px;margin:6px 0}
.btu-total{display:block;margin-top:14px;padding-top:12px;border-top:1px solid #d1d5db;font-size:20px;font-weight:700}
.btu-pay{display:block;margin-top:14px;padding:10px;background:#1d4ed8;color:#fff;text-align:center;font-size:16px;font-weight:700}
.b-currency .btu-cur{font-size:0}
.b-currency .btu-cur::after{content:'\\20AC';font-size:20px}
.b-invisible .btu-total{color:#fefefe}
.b-truncated .btu-total{width:92px;overflow:hidden;white-space:nowrap}
.b-covered .btu-total{position:relative}
.b-covered .btu-total::after{content:'';position:absolute;left:-6px;right:-6px;top:0;bottom:-4px;background:#fff}
`;

export const readDom = (el: HTMLElement): DomSnapshot => {
  const cs = getComputedStyle(el);
  return {
    text: el.textContent ?? '',
    displayed: cs.display !== 'none' && cs.visibility !== 'hidden',
    hasSize: el.getClientRects().length > 0,
  };
};

type Phase = 'idle' | 'running' | 'done' | 'error';

interface Outcome {
  dom: DomVerdict;
  pixels: Verdict;
}

export interface BreakTheUIProps {
  rasterize?: (el: HTMLElement) => Promise<Blob>;
  readPixels?: typeof readImageData;
  createEngine?: () => Pick<OCREngineClient, 'init' | 'recognize' | 'terminate' | 'isReady'>;
  readDomSnapshot?: (el: HTMLElement) => DomSnapshot;
}

/** A checkout card you can break. A DOM assertion and a pixel assertion run on the same broken card. */
export function BreakTheUI({
  rasterize = rasterizeElement,
  readPixels = readImageData,
  createEngine,
  readDomSnapshot = readDom,
}: BreakTheUIProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<ReturnType<NonNullable<BreakTheUIProps['createEngine']>> | null>(null);
  const token = useRef(0);
  const [active, setActive] = useState<ReadonlySet<BugId>>(new Set());
  const [phase, setPhase] = useState<Phase>('idle');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      token.current++;
      void engineRef.current?.terminate();
      engineRef.current = null;
    },
    []
  );

  const toggle = (id: BugId) => {
    token.current++; // a result for a different card is stale
    setOutcome(null);
    setError(null);
    setPhase('idle');
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const run = useCallback(async () => {
    const card = cardRef.current;
    const total = totalRef.current;
    if (!card || !total) return;
    const mine = ++token.current;
    setPhase('running');
    setOutcome(null);
    setError(null);
    try {
      const dom = domVerdict(readDomSnapshot(total));
      const file = await rasterize(card);
      const pixels = await readPixels(file);
      engineRef.current ??= (createEngine ?? (() => new OCREngineClient()))();
      const engine = engineRef.current;
      if (!engine.isReady) await engine.init('eng');
      if (mine !== token.current) return;
      const { result } = await engine.recognize(file, { offline: true });
      if (mine !== token.current) return;
      const contrasts = result.words.map((w) =>
        analyzeWordContrast(
          pixels.image,
          {
            x0: w.bbox.x0 * pixels.scale,
            y0: w.bbox.y0 * pixels.scale,
            x1: w.bbox.x1 * pixels.scale,
            y1: w.bbox.y1 * pixels.scale,
          },
          { pixelScale: pixels.scale }
        )
      );
      setOutcome({
        dom,
        pixels: renderVerdict({ lines: result.lines, words: result.words, contrasts, expected: EXPECTED_TOTAL }),
      });
      setPhase('done');
    } catch (e) {
      if (mine !== token.current) return;
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setPhase('error');
    }
  }, [rasterize, readPixels, createEngine, readDomSnapshot]);

  const cardClass = ['btu-card', ...[...active].map((id) => `b-${id}`)].join(' ');

  return (
    <section
      id="break-the-ui"
      data-testid="break-the-ui"
      aria-labelledby="btu-title"
      className="mb-12 rounded-lg border border-border bg-surface/50 p-4 sm:p-6"
    >
      <h2 id="btu-title" className="text-2xl font-bold text-foreground mb-2">
        Break the UI
      </h2>
      <p className="text-muted-foreground mb-5 max-w-2xl">
        Switch on a bug, then run both checks on the same card. A DOM assertion reads the code. RenderCheck reads the
        pixels, locally, in this tab.
      </p>

      <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
        <div className="min-w-0 overflow-x-auto">
          {/* The card carries its own styles so it can be painted to an image. */}
          <div ref={cardRef} className={cardClass} data-testid="btu-card">
            <style>{CARD_CSS}</style>
            <h3>Order summary</h3>
            <div className="btu-row"><span>Standard plan</span><span>$12.00</span></div>
            <div className="btu-row"><span>Tax</span><span>$2.00</span></div>
            <span ref={totalRef} className="btu-total" data-testid="btu-total">
              Total: <span className="btu-cur">$</span>14.00
            </span>
            <span className="btu-pay">Pay now</span>
          </div>
        </div>

        <div className="min-w-0">
          <fieldset className="mb-4">
            <legend className="text-sm font-medium text-foreground mb-2">Bugs to introduce</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {BUGS.map((b) => (
                <label
                  key={b.id}
                  className="flex min-h-11 items-center gap-3 rounded-md border border-border px-3 text-sm text-foreground cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={active.has(b.id)}
                    onChange={() => toggle(b.id)}
                    data-testid={`btu-bug-${b.id}`}
                    className="h-4 w-4"
                  />
                  <span>{b.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={run}
            disabled={phase === 'running'}
            data-testid="btu-run"
            className="min-h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {phase === 'running' ? 'Reading the pixels…' : 'Run both checks'}
          </button>

          <div role="status" aria-live="polite" className="mt-4 space-y-3">
            {phase === 'error' && <p className="text-sm text-red-800 dark:text-red-300">{error}</p>}
            {outcome && (
              <div className="grid gap-3 md:grid-cols-2" data-testid="btu-results">
                <ResultCard
                  testId="btu-dom"
                  title="What a DOM test sees"
                  pass={outcome.dom.pass}
                  detail={outcome.dom.headline}
                />
                <ResultCard
                  testId="btu-pixels"
                  title="What RenderCheck sees"
                  pass={outcome.pixels.pass}
                  detail={outcome.pixels.headline}
                >
                  {outcome.pixels.reason === 'mismatch' && outcome.pixels.seen && (
                    <DiffView expected={EXPECTED_TOTAL} read={outcome.pixels.seen} className="mt-2" />
                  )}
                </ResultCard>
              </div>
            )}
            {outcome && outcome.dom.pass && !outcome.pixels.pass && (
              <p className="text-sm text-foreground" data-testid="btu-gap">
                The DOM test passed and the user still sees a broken page. That gap is what RenderCheck closes.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({
  testId,
  title,
  pass,
  detail,
  children,
}: {
  testId: string;
  title: string;
  pass: boolean;
  detail: string;
  children?: React.ReactNode;
}) {
  return (
    <div data-testid={testId} data-pass={pass} className="rounded-md border border-border p-3 min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p
        className={`mt-1 text-lg font-bold ${pass ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}
      >
        {pass ? 'PASS' : 'FAIL'}
      </p>
      <p className="text-sm text-foreground">{detail}</p>
      {children}
    </div>
  );
}

export default BreakTheUI;
