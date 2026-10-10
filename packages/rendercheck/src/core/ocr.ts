/**
 * Local OCR for Node: Tesseract.js (WebAssembly) with the English language data that ships in
 * the `@tesseract.js-data/eng` dependency. Nothing is downloaded and nothing leaves the
 * machine: the language data is read from node_modules, the engine from `tesseract.js-core`,
 * and Tesseract's own cache is switched off so it writes nothing to disk.
 */
import path from 'node:path';
import { createRequire } from 'node:module';
import type { Worker } from 'tesseract.js';
import type { OCRLine, OCRResult, OCRWord, Region } from './types';

// `__filename` exists in CommonJS, in Vitest, and in the ESM build (tsup `shims` injects it).
const nodeRequire = createRequire(__filename);

/** Directory with `eng.traineddata.gz`. */
export function defaultLangPath(): string {
  const pkg = nodeRequire.resolve('@tesseract.js-data/eng/package.json');
  return path.join(path.dirname(pkg), '4.0.0_best_int');
}

export interface RecognizeOptions {
  region?: Region;
  lang?: string;
  langPath?: string;
}

interface RawBox {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

const copy = (b: RawBox): OCRWord => ({
  text: b.text.trim(),
  confidence: b.confidence,
  bbox: { x0: b.bbox.x0, y0: b.bbox.y0, x1: b.bbox.x1, y1: b.bbox.y1 },
});

// One engine per (language, data directory), reused between assertions: starting Tesseract takes
// about a second, recognising a screenshot takes a fraction of that.
const IDLE_MS = 3000;
const engines = new Map<string, { worker: Promise<Worker>; timer?: NodeJS.Timeout; busy: number }>();

function engineFor(lang: string, langPath: string) {
  const key = `${lang}|${langPath}`;
  let e = engines.get(key);
  if (!e) {
    const worker = import('tesseract.js').then(({ createWorker }) =>
      createWorker(lang, 1, {
        langPath,
        gzip: true,
        cacheMethod: 'none', // do not write traineddata files into the project directory
      })
    );
    e = { worker, busy: 0 };
    engines.set(key, e);
    worker.catch(() => engines.delete(key));
  }
  return { key, entry: e };
}

async function release(key: string) {
  const e = engines.get(key);
  if (!e) return;
  e.busy -= 1;
  if (e.busy > 0) return;
  // Stop the worker thread soon after the last use, so a test run can exit on its own.
  clearTimeout(e.timer);
  e.timer = setTimeout(() => {
    if (engines.get(key) === e && e.busy === 0) {
      engines.delete(key);
      void e.worker.then((w) => w.terminate()).catch(() => undefined);
    }
  }, IDLE_MS);
  e.timer.unref?.();
}

/** Stop every OCR engine now (they also stop by themselves a few seconds after last use). */
export async function shutdown(): Promise<void> {
  const all = [...engines.values()];
  engines.clear();
  await Promise.all(all.map((e) => e.worker.then((w) => w.terminate()).catch(() => undefined)));
}

/** Run OCR on a PNG/JPEG buffer. Word and line boxes are in full-image pixels, also with `region`. */
export async function recognize(image: Uint8Array, options: RecognizeOptions = {}): Promise<OCRResult> {
  const lang = options.lang ?? 'eng';
  const langPath = options.langPath ?? defaultLangPath();
  const { key, entry } = engineFor(lang, langPath);
  clearTimeout(entry.timer);
  entry.busy += 1;
  try {
    const worker = await entry.worker;
    const t0 = performance.now();
    const rectangle = options.region
      ? {
          left: Math.max(0, Math.round(options.region.x)),
          top: Math.max(0, Math.round(options.region.y)),
          width: Math.max(1, Math.round(options.region.width)),
          height: Math.max(1, Math.round(options.region.height)),
        }
      : undefined;
    const { data } = await worker.recognize(Buffer.from(image), rectangle ? { rectangle } : {});
    const durationMs = Math.round(performance.now() - t0);
    const words = ((data as unknown as { words?: RawBox[] }).words ?? []).map(copy).filter((w) => w.text);
    const lines = ((data as unknown as { lines?: RawBox[] }).lines ?? []).map(copy).filter((l) => l.text) as OCRLine[];
    return { text: data.text, words, lines, metrics: { durationMs } };
  } finally {
    await release(key);
  }
}
