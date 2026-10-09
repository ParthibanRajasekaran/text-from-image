import React, { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { OCREngineClient } from '../src/core/ocr/engineClient';
import type { OCRLine, OCRResult } from '../src/core/ocr/types';
import { analyzeWordContrast, type ContrastResult, type ImageDataLike } from '../src/core/analysis/contrast';
import {
  classifyWords,
  findTargetLine,
  LOW_CONFIDENCE,
  type ClassifiedWord,
  type WordStatus,
} from '../src/core/analysis/classify';
import {
  emptyAudit,
  mergeAudits,
  startNetworkProof,
  type NetworkAudit,
} from '../src/core/privacy/networkProof';
import { SnippetExport } from './SnippetExport';

/** Box colours. Green = passed, amber = low confidence (< 80%), rose = contrast failure or text mismatch. */
export const STATUS_COLORS: Record<WordStatus, string> = {
  pass: '#4ADE80',
  'low-confidence': '#FBBF24',
  fail: '#FB7185',
};

/** The scan line and the reveal share one timing. */
export const SCAN_MS = 700;
export const SCAN_EASING = 'cubic-bezier(.2,.8,.2,1)';

const MAX_PIXEL_SIDE = 4096; // larger images are downscaled for the contrast pass only
const SAMPLE_URL = '/demo/checkout-sample.png';
const ACCEPT = 'image/png,image/jpeg,image/webp';

interface Pixels {
  image: ImageDataLike;
  width: number;
  height: number;
  /** pixel-grid size / original size (1 unless downscaled) */
  scale: number;
}

export async function readImageData(file: Blob): Promise<Pixels> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_PIXEL_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas is not available in this browser');
    ctx.drawImage(bitmap, 0, 0, w, h);
    return { image: ctx.getImageData(0, 0, w, h), width: bitmap.width, height: bitmap.height, scale };
  } finally {
    bitmap.close();
  }
}

type Phase = 'idle' | 'loading-engine' | 'reading' | 'done' | 'error';

interface Analysis {
  result: OCRResult;
  contrasts: Array<ContrastResult | null>;
  width: number;
  height: number;
}

export interface HeroDemoProps {
  className?: string;
  /** Test seams. */
  createEngine?: () => Pick<OCREngineClient, 'init' | 'recognize' | 'terminate' | 'isReady'>;
  readPixels?: (file: Blob) => Promise<Pixels>;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    (notify) => {
      const mq = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION_QUERY) : null;
      mq?.addEventListener?.('change', notify);
      return () => mq?.removeEventListener?.('change', notify);
    },
    () => (typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION_QUERY).matches : false),
    () => false
  );

const pct = (n: number) => `${Math.round(n)}%`;
const bytes = (n: number) => (n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`);

export function HeroDemo({ className = '', createEngine, readPixels = readImageData }: HeroDemoProps) {
  const uid = useId();
  const engineRef = useRef<NonNullable<ReturnType<NonNullable<HeroDemoProps['createEngine']>>> | null>(null);
  const runToken = useRef(0);
  const urlRef = useRef<string | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [runId, setRunId] = useState(0);
  const [progress, setProgress] = useState<{ status: string; progress: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [expected, setExpected] = useState('');
  const [offline, setOffline] = useState(false);
  const [audit, setAudit] = useState<NetworkAudit>(emptyAudit);
  const [auditLive, setAuditLive] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // Free the image URL and the engine when the component goes away.
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      void engineRef.current?.terminate();
      engineRef.current = null;
    },
    []
  );

  const getEngine = useCallback(() => {
    engineRef.current ??= (createEngine ?? (() => new OCREngineClient()))();
    return engineRef.current;
  }, [createEngine]);

  const run = useCallback(
    async (file: Blob) => {
      const token = ++runToken.current;
      setRunId(token);
      const stale = () => token !== runToken.current;

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(file); // browser memory only; never sent anywhere
      urlRef.current = url;
      setImageUrl(url);
      setAnalysis(null);
      setSelectedLine(null);
      setRevealed(false);
      setError(null);
      setAudit(emptyAudit());
      setProgress(null);

      try {
        const engine = getEngine();
        const pixels = await readPixels(file);
        if (stale()) return;

        // Loading the engine is the one step that needs the network (same-origin files from
        // /ocr/). It is done before the audited run so "offline" means what it says.
        if (!engine.isReady) {
          setPhase('loading-engine');
          await engine.init('eng', (status, p) => !stale() && setProgress({ status, progress: p }));
          if (stale()) return;
        }

        setPhase('reading');
        setAuditLive(true);
        const proof = startNetworkProof({ offline });
        const unsubscribe = proof.subscribe(() => !stale() && setAudit(proof.getAudit()));
        let outcome: Awaited<ReturnType<typeof engine.recognize>>;
        try {
          outcome = await engine.recognize(file, {
            offline,
            onProgress: (status, p) => !stale() && setProgress({ status, progress: p }),
          });
        } finally {
          unsubscribe();
          proof.stop();
        }
        if (stale()) return;
        setAuditLive(false);
        setAudit(mergeAudits(proof.getAudit(), outcome.network));

        const contrasts = outcome.result.words.map((w) =>
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
        setAnalysis({ result: outcome.result, contrasts, width: pixels.width, height: pixels.height });
        setPhase('done');
        // Two frames: let the overlay mount hidden first so the CSS transition has a start state.
        requestAnimationFrame(() => requestAnimationFrame(() => !stale() && setRevealed(true)));
      } catch (e) {
        if (stale()) return;
        setAuditLive(false);
        setPhase('error');
        setError(
          offline && /offline mode|network/i.test(String((e as Error)?.message))
            ? `Offline mode refused a network call: ${(e as Error).message}`
            : (e as Error)?.message || 'Could not read that image.'
        );
      }
    },
    [getEngine, offline, readPixels]
  );

  const acceptFiles = useCallback(
    (files: FileList | File[] | null | undefined) => {
      const file = files && Array.from(files).find((f) => f.type.startsWith('image/'));
      if (file) void run(file);
      else if (files && files.length) setError('Please choose a PNG, JPG or WebP image.');
    },
    [run]
  );

  // Paste a screenshot from the clipboard.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files && files.length) {
        e.preventDefault();
        acceptFiles(files);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [acceptFiles]);

  const loadSample = useCallback(async () => {
    try {
      const res = await fetch(SAMPLE_URL);
      if (!res.ok) throw new Error(`Sample image failed to load (${res.status})`);
      await run(await res.blob());
    } catch (e) {
      setPhase('error');
      setError((e as Error).message);
    }
  }, [run]);

  // Verdicts are recomputed from the stored OCR result when the expected text changes: no new OCR run.
  const target = useMemo(
    () => (analysis && expected.trim() ? findTargetLine(analysis.result.lines, expected) : null),
    [analysis, expected]
  );
  const words: ClassifiedWord[] = useMemo(
    () => (analysis ? classifyWords({ words: analysis.result.words, contrasts: analysis.contrasts, target }) : []),
    [analysis, target]
  );
  const counts = useMemo(() => {
    const c: Record<WordStatus, number> = { pass: 0, 'low-confidence': 0, fail: 0 };
    words.forEach((w) => (c[w.status] += 1));
    return c;
  }, [words]);

  const lines = useMemo<OCRLine[]>(() => analysis?.result.lines ?? [], [analysis]);
  const lineIndexOf = useCallback(
    (cx: number, cy: number) => lines.findIndex((l) => cx >= l.bbox.x0 && cx <= l.bbox.x1 && cy >= l.bbox.y0 && cy <= l.bbox.y1),
    [lines]
  );
  // The line used for the snippet: the user's pick, else the expected-text match, else the first failing line, else the first.
  const activeLineIndex = useMemo(() => {
    if (!lines.length) return -1;
    if (selectedLine !== null && lines[selectedLine]) return selectedLine;
    if (target) return lines.indexOf(target.line);
    const firstFail = words.find((w) => w.status === 'fail');
    if (firstFail) {
      const i = lineIndexOf((firstFail.word.bbox.x0 + firstFail.word.bbox.x1) / 2, (firstFail.word.bbox.y0 + firstFail.word.bbox.y1) / 2);
      if (i >= 0) return i;
    }
    return 0;
  }, [lines, selectedLine, target, words, lineIndexOf]);
  const activeLine: OCRLine | undefined = lines[activeLineIndex];

  const mismatch = target && !target.contained ? target : null;
  const transition = reducedMotion ? 'none' : `${SCAN_MS}ms ${SCAN_EASING}`;
  const busy = phase === 'loading-engine' || phase === 'reading';

  const statusText = (() => {
    if (phase === 'loading-engine')
      return `Loading the OCR engine${progress?.progress ? ` (${pct(progress.progress * 100)})` : ''}. This is the only step that uses the network.`;
    if (phase === 'reading') return `Reading the image${progress?.status === 'recognizing text' ? ` (${pct(progress.progress * 100)})` : ''}…`;
    if (phase === 'done') {
      const base = `${words.length} words: ${counts.pass} passed, ${counts['low-confidence']} low confidence, ${counts.fail} failed.`;
      if (mismatch)
        return `${base} Expected to find text "${expected.trim()}" but OCR read "${mismatch.line.text.trim()}" (Confidence: ${Math.round(mismatch.line.confidence)}%).`;
      if (expected.trim() && !target) return `${base} The expected text was not found in the image.`;
      return base;
    }
    if (phase === 'error') return error ?? 'Something went wrong.';
    return 'Drop a screenshot, paste one, or try the sample.';
  })();

  return (
    <section
      data-testid="hero-demo"
      aria-labelledby={`${uid}-title`}
      className={`rounded-2xl border border-white/10 bg-[#0B0D12] p-4 text-zinc-100 sm:p-6 ${className}`}
    >
      <header className="mb-4">
        <h2 id={`${uid}-title`} className="text-xl font-semibold tracking-tight sm:text-2xl">
          See what your users see
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Drop a screenshot. RenderCheck reads it in your browser, checks every word's confidence and contrast,
          and writes the Playwright assertion for you.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Stage */}
        <div>
          {!imageUrl ? (
            <label
              data-testid="hero-demo-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                acceptFiles(e.dataTransfer.files);
              }}
              className={`flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors focus-within:ring-2 focus-within:ring-sky-400 ${
                dragging ? 'border-sky-400 bg-sky-400/10' : 'border-white/20 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-base font-medium">Drop a screenshot here, or click to choose</span>
              <span className="text-sm text-zinc-400">PNG, JPG or WebP · you can also paste with ⌘V / Ctrl+V</span>
              <input
                data-testid="hero-demo-input"
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={(e) => {
                  acceptFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          ) : (
            <div
              data-testid="hero-demo-stage"
              className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black"
              style={{ aspectRatio: analysis ? `${analysis.width} / ${analysis.height}` : undefined, minHeight: analysis ? undefined : 160 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                acceptFiles(e.dataTransfer.files);
              }}
            >
              <img
                src={imageUrl}
                alt="Your screenshot, with detected text outlined"
                className={`block w-full select-none ${analysis ? 'h-full' : 'h-auto'}`}
                draggable={false}
              />
              {analysis && (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: revealed ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
                      transition: `clip-path ${transition}`,
                    }}
                  >
                    <svg
                      data-testid="hero-demo-overlay"
                      className="absolute inset-0 h-full w-full"
                      viewBox={`0 0 ${analysis.width} ${analysis.height}`}
                      preserveAspectRatio="none"
                      role="img"
                      aria-label={`${words.length} detected words outlined: ${counts.pass} passed, ${counts['low-confidence']} low confidence, ${counts.fail} failed`}
                    >
                      {words.map((w, i) => {
                        const { x0, y0, x1, y1 } = w.word.bbox;
                        const color = STATUS_COLORS[w.status];
                        return (
                          <rect
                            key={i}
                            data-testid="hero-demo-box"
                            data-status={w.status}
                            data-reason={w.reason ?? ''}
                            data-text={w.word.text}
                            x={x0}
                            y={y0}
                            width={Math.max(1, x1 - x0)}
                            height={Math.max(1, y1 - y0)}
                            rx={2}
                            fill={color}
                            fillOpacity={0.14}
                            stroke={color}
                            strokeWidth={2}
                            vectorEffect="non-scaling-stroke"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              const j = lineIndexOf((x0 + x1) / 2, (y0 + y1) / 2);
                              if (j >= 0) setSelectedLine(j);
                            }}
                          >
                            <title>{`${w.word.text} · confidence ${Math.round(w.word.confidence)}%${
                              w.contrast && Number.isFinite(w.contrast.ratio)
                                ? ` · contrast ${w.contrast.ratio.toFixed(2)}:1 (needs ${w.contrast.threshold}:1)`
                                : ''
                            }`}</title>
                          </rect>
                        );
                      })}
                      {activeLine && (
                        <rect
                          data-testid="hero-demo-selection"
                          x={activeLine.bbox.x0 - 4}
                          y={activeLine.bbox.y0 - 4}
                          width={activeLine.bbox.x1 - activeLine.bbox.x0 + 8}
                          height={activeLine.bbox.y1 - activeLine.bbox.y0 + 8}
                          rx={4}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          strokeDasharray="6 4"
                          vectorEffect="non-scaling-stroke"
                          pointerEvents="none"
                        />
                      )}
                    </svg>
                  </div>
                  <div
                    data-testid="hero-demo-scanline"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 right-0 h-0.5"
                    style={{
                      top: revealed ? '100%' : '0%',
                      opacity: revealed ? 0 : 1,
                      transition: `top ${transition}, opacity ${transition}`,
                      background: 'linear-gradient(90deg, transparent, #38BDF8 20%, #38BDF8 80%, transparent)',
                      boxShadow: '0 0 18px 4px rgba(56,189,248,.55)',
                    }}
                  />
                </>
              )}
              {busy && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm">
                  <span className="rounded-full bg-black/70 px-3 py-1">{phase === 'loading-engine' ? 'Loading engine…' : 'Reading…'}</span>
                </div>
              )}
            </div>
          )}

          <p
            role="status"
            aria-live="polite"
            data-testid="hero-demo-status"
            data-phase={phase}
            data-run={runId}
            className={`mt-3 text-sm ${phase === 'error' ? 'text-rose-300' : mismatch ? 'text-rose-300' : 'text-zinc-300'}`}
          >
            {statusText}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="hero-demo-sample"
              onClick={() => void loadSample()}
              disabled={busy}
              className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
            >
              Try a sample checkout
            </button>
            {imageUrl && (
              <label className="inline-flex cursor-pointer items-center rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium focus-within:ring-2 focus-within:ring-sky-400 hover:bg-white/10">
                Choose another image
                <input
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  data-testid="hero-demo-input-again"
                  onChange={(e) => {
                    acceptFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
            <Legend />
          </div>
        </div>

        {/* Controls and privacy proof */}
        <aside className="flex flex-col gap-4">
          <div>
            <label htmlFor={`${uid}-expected`} className="text-sm font-medium">
              Expected text <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <input
              id={`${uid}-expected`}
              data-testid="hero-demo-expected"
              type="text"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder="e.g. Total: $14.00"
              className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <p className="mt-1 text-xs text-zinc-400">If the closest line differs, its words turn rose and the difference is shown.</p>
          </div>

          <section
            data-testid="hero-demo-privacy"
            aria-label="Network audit"
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Network audit</h3>
              <AuditBadge audit={audit} live={auditLive} ran={phase === 'done'} />
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-zinc-400">Bytes uploaded</dt>
                <dd data-testid="hero-demo-bytes" className="font-mono">
                  {bytes(audit.totalOutboundBytes)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400">Requests seen</dt>
                <dd data-testid="hero-demo-requests" className="font-mono">
                  {audit.requests.length}
                </dd>
              </div>
            </dl>
            {audit.requests.length > 0 && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-zinc-300">Show requests</summary>
                <ul className="mt-1 max-h-32 space-y-0.5 overflow-auto font-mono text-zinc-400">
                  {audit.requests.map((r, i) => (
                    <li key={i} className="truncate" title={r.url}>
                      {r.method} {r.url.replace(/^https?:\/\/[^/]+/, '')} · {bytes(r.size)}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm">
              <input
                data-testid="hero-demo-offline-toggle"
                type="checkbox"
                checked={offline}
                onChange={(e) => setOffline(e.target.checked)}
                disabled={busy}
                className="mt-0.5 h-4 w-4 accent-sky-400"
              />
              <span>
                Run in Offline Mode
                <span className="block text-xs text-zinc-400">
                  The engine loads first. The scan itself then runs with fetch, XHR and beacons blocked.
                </span>
              </span>
            </label>
            <p className="mt-2 text-xs text-zinc-500">
              Watched: this page and the OCR worker. The bundled Tesseract worker is not instrumented; this site's
              Content-Security-Policy (<code>connect-src 'self'</code>) stops it contacting other origins.
            </p>
          </section>
        </aside>
      </div>

      {analysis && lines.length > 0 && activeLine && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Lines read</h3>
            <ul data-testid="hero-demo-lines" className="space-y-1">
              {lines.map((l, i) => {
                const lineWords = words.filter((w) => {
                  const cx = (w.word.bbox.x0 + w.word.bbox.x1) / 2;
                  const cy = (w.word.bbox.y0 + w.word.bbox.y1) / 2;
                  return cx >= l.bbox.x0 && cx <= l.bbox.x1 && cy >= l.bbox.y0 && cy <= l.bbox.y1;
                });
                const status: WordStatus = lineWords.some((w) => w.status === 'fail')
                  ? 'fail'
                  : lineWords.some((w) => w.status === 'low-confidence')
                    ? 'low-confidence'
                    : 'pass';
                const reason = lineWords.find((w) => w.reason)?.reason;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setSelectedLine(i)}
                      aria-pressed={i === activeLineIndex}
                      className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm ${
                        i === activeLineIndex ? 'border-white/40 bg-white/10' : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: STATUS_COLORS[status] }}
                      />
                      <span className="min-w-0 flex-1 truncate">{l.text.trim()}</span>
                      <span className="shrink-0 text-xs text-zinc-400">
                        {Math.round(l.confidence)}%
                        {reason === 'contrast' ? ' · low contrast' : reason === 'mismatch' ? ' · mismatch' : status === 'low-confidence' ? ` · below ${LOW_CONFIDENCE}%` : ''}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-zinc-500">
              {analysis.result.metrics.durationMs} ms in the OCR engine. Click a line, or a box on the image, to
              build the assertion for it.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Playwright assertion</h3>
            <SnippetExport
              expectedText={expected.trim() || activeLine.text.trim()}
              region={{
                x: activeLine.bbox.x0,
                y: activeLine.bbox.y0,
                width: activeLine.bbox.x1 - activeLine.bbox.x0,
                height: activeLine.bbox.y1 - activeLine.bbox.y0,
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function Legend() {
  const items: Array<[WordStatus, string]> = [
    ['pass', 'Passed'],
    ['low-confidence', `Confidence < ${LOW_CONFIDENCE}%`],
    ['fail', 'Contrast or text mismatch'],
  ];
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400" aria-label="Legend">
      {items.map(([s, label]) => (
        <li key={s} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_COLORS[s] }} />
          {label}
        </li>
      ))}
    </ul>
  );
}

function AuditBadge({ audit, live, ran }: { audit: NetworkAudit; live: boolean; ran: boolean }) {
  if (live) return <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-xs text-sky-300">Watching…</span>;
  if (!ran) return <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">Idle</span>;
  return audit.verifiedZeroUpload ? (
    <span data-testid="hero-demo-verified" className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-300">
      0 bytes uploaded ✓
    </span>
  ) : (
    <span data-testid="hero-demo-verified" className="rounded-full bg-rose-400/15 px-2 py-0.5 text-xs text-rose-300">
      Upload detected
    </span>
  );
}

export default HeroDemo;
