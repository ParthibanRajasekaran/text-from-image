import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OCREngineClient } from '../src/core/ocr/engineClient';
import type { OCRResult } from '../src/core/ocr/types';
import { emptyAudit, mergeAudits, startNetworkProof, type NetworkAudit } from '../src/core/privacy/networkProof';
import { KINDS, KIND_LABEL, detect, type Box, type Finding, type RedactKind } from '../src/core/redact/detect';
import { boxFromDrag, renderRedacted } from '../src/core/redact/apply';

type Phase = 'idle' | 'loading-engine' | 'reading' | 'done' | 'error';
type Engine = Pick<OCREngineClient, 'init' | 'recognize' | 'terminate' | 'isReady'>;

const ACCEPT = 'image/png,image/jpeg,image/webp';
const MIN_DRAG = 6; // px in image space; smaller is a click

export interface RedactToolProps {
  /** Replace the OCR engine (tests). */
  createEngine?: () => Engine;
  /** Measure an image (tests, where there is no image decoder). */
  readSize?: (file: Blob) => Promise<{ width: number; height: number }>;
  /** Produce the redacted PNG (tests). */
  render?: (file: Blob, boxes: readonly Box[]) => Promise<Blob>;
}

async function defaultReadSize(file: Blob) {
  const bmp = await createImageBitmap(file);
  try {
    return { width: bmp.width, height: bmp.height };
  } finally {
    bmp.close();
  }
}

const button =
  'inline-flex min-h-[44px] items-center justify-center rounded-md border border-border bg-muted/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50';
const primary =
  'inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export function RedactTool({ createEngine, readSize = defaultReadSize, render = renderRedacted }: RedactToolProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [audit, setAudit] = useState<NetworkAudit>(emptyAudit());
  const [kinds, setKinds] = useState<Set<RedactKind>>(new Set(KINDS));
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [manual, setManual] = useState<Box[]>([]);
  const [drawMode, setDrawMode] = useState(false);
  const [drag, setDrag] = useState<{ from: { x: number; y: number }; to: { x: number; y: number } } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState('');
  const [busyExport, setBusyExport] = useState(false);

  const engineRef = useRef<Engine | null>(null);
  const urlRef = useRef<string | null>(null);
  const runToken = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      void engineRef.current?.terminate();
      engineRef.current = null;
    },
    []
  );

  const findings = useMemo<Finding[]>(() => (result ? detect(result, kinds) : []), [result, kinds]);
  const active = useMemo(() => findings.filter((f) => !skipped.has(f.id)), [findings, skipped]);
  const boxes = useMemo<Box[]>(() => [...active.map((f) => f.box), ...manual], [active, manual]);

  const run = useCallback(
    async (f: File) => {
      const token = ++runToken.current;
      const stale = () => token !== runToken.current;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(f); // browser memory only
      urlRef.current = url;
      setFile(f);
      setImageUrl(url);
      setResult(null);
      setSkipped(new Set());
      setManual([]);
      setDrawMode(false);
      setError(null);
      setNotice('');
      setAudit(emptyAudit());
      try {
        const dims = await readSize(f);
        if (stale()) return;
        setSize(dims);
        engineRef.current ??= (createEngine ?? (() => new OCREngineClient()))();
        const engine = engineRef.current;
        if (!engine.isReady) {
          setPhase('loading-engine');
          await engine.init('eng');
          if (stale()) return;
        }
        setPhase('reading');
        const proof = startNetworkProof();
        let outcome: Awaited<ReturnType<Engine['recognize']>>;
        try {
          outcome = await engine.recognize(f);
        } finally {
          proof.stop();
        }
        if (stale()) return;
        setAudit(mergeAudits(proof.getAudit(), outcome.network));
        setResult(outcome.result);
        setPhase('done');
      } catch (e) {
        if (stale()) return;
        setPhase('error');
        setError((e as Error)?.message || 'Could not read that image.');
      }
    },
    [createEngine, readSize]
  );

  const accept = useCallback(
    (files: FileList | File[] | null | undefined) => {
      const f = files && Array.from(files).find((x) => x.type.startsWith('image/'));
      if (f) void run(f);
      else if (files && files.length) setError('Please choose a PNG, JPG or WebP image.');
    },
    [run]
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = Array.from(e.clipboardData?.files ?? []).find((x) => x.type.startsWith('image/'));
      if (f) void run(f);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [run]);

  const say = (m: string) => {
    setNotice(m);
    window.setTimeout(() => setNotice(''), 4000);
  };

  const toImagePoint = (e: React.PointerEvent) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * size!.width, y: ((e.clientY - r.top) / r.height) * size!.height };
  };

  const download = async () => {
    if (!file) return;
    setBusyExport(true);
    try {
      const blob = await render(file, boxes);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.[^.]+$/, '') || 'image'}-redacted.png`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      say(`Downloaded with ${boxes.length} area${boxes.length === 1 ? '' : 's'} covered.`);
    } catch {
      say('Could not create the image.');
    } finally {
      setBusyExport(false);
    }
  };

  const copy = async () => {
    if (!file) return;
    try {
      if (!navigator.clipboard || typeof ClipboardItem === 'undefined') throw new Error('unsupported');
      const blob = await render(file, boxes);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      say('Image copied.');
    } catch {
      say('Copying images is not supported here. Use Download.');
    }
  };

  const busy = phase === 'loading-engine' || phase === 'reading';
  const status =
    phase === 'loading-engine'
      ? 'Loading the OCR engine. This is the only step that uses the network, and it loads files from this site.'
      : phase === 'reading'
        ? 'Reading the text in your image…'
        : phase === 'done'
          ? findings.length
            ? `Found ${findings.length} item${findings.length === 1 ? '' : 's'} that look sensitive.`
            : 'Nothing that looks sensitive was found. That does not prove there is none: check the image yourself.'
          : 'Drop an image, paste one, or choose a file.';

  return (
    <div className="space-y-6" data-testid="redact-tool">
      {!imageUrl && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            accept(e.dataTransfer.files);
          }}
          className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors focus-within:ring-2 focus-within:ring-primary ${
            dragOver ? 'border-primary bg-primary/10' : 'border-border bg-muted/30 hover:bg-muted/50'
          }`}
        >
          <span className="text-base font-medium text-foreground">Drop an image here, or click to choose</span>
          <span className="text-sm text-muted-foreground">PNG, JPG or WebP · you can also paste with ⌘V / Ctrl+V</span>
          <input
            data-testid="redact-input"
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => {
              accept(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      )}

      <p role="status" aria-live="polite" className="text-sm text-muted-foreground" data-testid="redact-status">
        {status}
      </p>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {imageUrl && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div
              ref={stageRef}
              data-testid="redact-stage"
              className="relative w-full overflow-hidden rounded-lg border border-border bg-muted"
              style={size ? { aspectRatio: `${size.width} / ${size.height}` } : undefined}
            >
              <img src={imageUrl} alt="Your image, with the areas to cover outlined" className="block h-full w-full select-none" draggable={false} />
              {size && (
                <svg
                  viewBox={`0 0 ${size.width} ${size.height}`}
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                  style={{ touchAction: drawMode ? 'none' : 'auto', cursor: drawMode ? 'crosshair' : 'default' }}
                  onPointerDown={(e) => {
                    if (!drawMode) return;
                    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
                    const p = toImagePoint(e);
                    setDrag({ from: p, to: p });
                  }}
                  onPointerMove={(e) => drag && setDrag({ ...drag, to: toImagePoint(e) })}
                  onPointerUp={() => {
                    if (!drag || !size) return;
                    const b = boxFromDrag(drag.from, drag.to, size.width, size.height);
                    setDrag(null);
                    if (b.width >= MIN_DRAG && b.height >= MIN_DRAG) setManual((m) => [...m, b]);
                  }}
                >
                  {boxes.map((b, i) => (
                    <rect
                      key={i}
                      data-testid="redact-box"
                      x={b.x - 3}
                      y={b.y - 3}
                      width={b.width + 6}
                      height={b.height + 6}
                      fill="#000"
                      fillOpacity={0.88}
                      stroke="#ef4444"
                      strokeWidth={Math.max(2, size.width / 400)}
                    />
                  ))}
                  {drag && (
                    <rect
                      {...(() => {
                        const b = boxFromDrag(drag.from, drag.to, size.width, size.height);
                        return { x: b.x, y: b.y, width: b.width, height: b.height };
                      })()}
                      fill="#ef4444"
                      fillOpacity={0.25}
                      stroke="#ef4444"
                      strokeDasharray="6 4"
                      strokeWidth={Math.max(2, size.width / 400)}
                    />
                  )}
                </svg>
              )}
              {busy && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <span className="rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground shadow">
                    {phase === 'loading-engine' ? 'Loading engine…' : 'Reading…'}
                  </span>
                </div>
              )}
            </div>
            <p className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground">
              OCR can miss text. Look over the whole image, and draw a box over anything it did not catch, before you share it.
            </p>
          </div>

          <aside className="space-y-5" aria-label="What will be covered">
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-foreground">Look for</legend>
              {KINDS.map((k) => (
                <label key={k} className="flex min-h-[44px] items-center gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={kinds.has(k)}
                    onChange={() =>
                      setKinds((prev) => {
                        const n = new Set(prev);
                        if (n.has(k)) n.delete(k);
                        else n.add(k);
                        return n;
                      })
                    }
                  />
                  {KIND_LABEL[k]}
                </label>
              ))}
            </fieldset>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Found ({findings.length})
              </h3>
              {findings.length === 0 && <p className="text-sm text-muted-foreground">Nothing yet.</p>}
              <ul className="space-y-1" data-testid="redact-findings">
                {findings.map((f) => (
                  <li key={f.id}>
                    <label className="flex min-h-[44px] items-start gap-3 text-sm text-foreground">
                      <input
                        type="checkbox"
                        className="mt-1 h-5 w-5"
                        checked={!skipped.has(f.id)}
                        onChange={() =>
                          setSkipped((prev) => {
                            const n = new Set(prev);
                            if (n.has(f.id)) n.delete(f.id);
                            else n.add(f.id);
                            return n;
                          })
                        }
                      />
                      <span className="min-w-0">
                        <span className="block text-xs text-muted-foreground">{KIND_LABEL[f.kind]}</span>
                        <span className="block break-all font-mono">{f.text}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <button type="button" aria-pressed={drawMode} onClick={() => setDrawMode((d) => !d)} className={`${button} w-full ${drawMode ? 'ring-2 ring-primary' : ''}`}>
                {drawMode ? 'Drawing: drag on the image' : 'Draw a box to cover more'}
              </button>
              {manual.length > 0 && (
                <ul className="space-y-1">
                  {manual.map((b, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 text-sm text-foreground">
                      <span>Box {i + 1}: {Math.round(b.width)}×{Math.round(b.height)} px</span>
                      <button type="button" className={button} onClick={() => setManual((m) => m.filter((_, j) => j !== i))}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <button type="button" className={`${primary} w-full`} disabled={phase !== 'done' || boxes.length === 0 || busyExport} onClick={download}>
                Download redacted image
              </button>
              <button type="button" className={`${button} w-full`} disabled={phase !== 'done' || boxes.length === 0 || busyExport} onClick={copy}>
                Copy redacted image
              </button>
              <button
                type="button"
                className={`${button} w-full`}
                onClick={() => {
                  runToken.current++;
                  if (urlRef.current) URL.revokeObjectURL(urlRef.current);
                  urlRef.current = null;
                  setImageUrl(null);
                  setFile(null);
                  setResult(null);
                  setPhase('idle');
                  setError(null);
                }}
              >
                Start over
              </button>
              <p role="status" aria-live="polite" className="min-h-[1.25rem] text-sm text-muted-foreground">
                {notice}
              </p>
            </div>

            {phase === 'done' && (
              <p className="text-xs text-muted-foreground" data-testid="redact-proof">
                {audit.verifiedZeroUpload
                  ? `0 bytes uploaded while reading this image (${audit.requests.length} request${audit.requests.length === 1 ? '' : 's'} checked).`
                  : `${audit.totalOutboundBytes} bytes were sent while reading this image. This should not happen: please report it.`}
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
