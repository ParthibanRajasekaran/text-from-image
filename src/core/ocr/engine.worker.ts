/**
 * Local OCR engine: a persistent Web Worker.
 *
 * Unlike `recognizeLocal()` (which creates and tears down a Tesseract worker per call), this
 * keeps one initialised engine alive, so the second and later images skip the engine and
 * language-data load.
 *
 * Protocol (see types.ts). Every request carries an `id`; the reply carries the same `id`.
 *   INIT       { lang? }   load the engine and language data (idempotent for the same lang)
 *   RECOGNIZE  { image, offline? }  run OCR; initialises with 'eng' first if INIT was not sent.
 *              The reply carries `network`: what the worker itself requested during the run.
 *              With offline: true, fetch / XHR in the worker are refused for the run, which only
 *              succeeds if INIT already loaded everything.
 *   TERMINATE              free the engine; the worker can be INIT-ed again afterwards
 * While recognising, `PROGRESS` messages (same id) report { status, progress 0-1 }.
 *
 * Nothing here touches the network except loading the self-hosted files from /ocr/ (see
 * tesseractConfig.ts).
 *
 * The message handling lives in `createEngineController`, which does not depend on the
 * worker global, so it can be unit-tested with a fake recogniser.
 */

import { startNetworkProof } from '../privacy/networkProof';
import { getTesseractWorkerOptions } from './tesseractConfig';
import type {
  BBox,
  EngineRequest,
  EngineResponse,
  OCRImageInput,
  OCRLine,
  OCRResult,
  OCRWord,
} from './types';

export type { BBox, EngineRequest, EngineResponse, OCRLine, OCRResult, OCRWord } from './types';

/** The part of a Tesseract.js worker that the engine uses. */
export interface Recognizer {
  recognize(image: OCRImageInput): Promise<{ data: RawData }>;
  terminate(): Promise<unknown>;
}

interface RawBox {
  text: string;
  confidence: number;
  bbox: BBox;
}
interface RawData {
  text: string;
  words?: RawBox[];
  lines?: RawBox[];
  blocks?: Array<{
    paragraphs: Array<{ lines: Array<RawBox & { words: RawBox[] }> }>;
  }> | null;
}

export type RecognizerFactory = (
  lang: string,
  onProgress: (status: string, progress: number) => void
) => Promise<Recognizer>;

export const defaultRecognizerFactory: RecognizerFactory = async (lang, onProgress) => {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker(lang, 1, {
    ...getTesseractWorkerOptions(),
    logger: (m) => onProgress(m.status, m.progress),
  });
  return worker as unknown as Recognizer;
};

const copyBox = (b: RawBox) => ({
  text: b.text.trim(),
  bbox: { x0: b.bbox.x0, y0: b.bbox.y0, x1: b.bbox.x1, y1: b.bbox.y1 },
  confidence: b.confidence,
});

/** Turn Tesseract's result into plain, cloneable OCRResult data. */
export function toOCRResult(data: RawData, durationMs: number, memoryBytes?: number): OCRResult {
  let rawLines = data.lines;
  let rawWords = data.words;
  if ((!rawLines || !rawWords) && data.blocks) {
    const lines = data.blocks.flatMap((b) => b.paragraphs.flatMap((p) => p.lines));
    rawLines ??= lines;
    rawWords ??= lines.flatMap((l) => l.words);
  }
  const words: OCRWord[] = (rawWords ?? []).map(copyBox).filter((w) => w.text.length > 0);
  const lines: OCRLine[] = (rawLines ?? []).map(copyBox).filter((l) => l.text.length > 0);
  return {
    text: data.text,
    words,
    lines,
    metrics: memoryBytes === undefined ? { durationMs } : { durationMs, memoryBytes },
  };
}

function heapBytes(): number | undefined {
  // Non-standard, Chromium only.
  const mem = (globalThis.performance as unknown as { memory?: { usedJSHeapSize?: number } })
    ?.memory;
  return mem?.usedJSHeapSize;
}

export interface EngineController {
  handle(request: EngineRequest): Promise<void>;
}

export function createEngineController(
  post: (response: EngineResponse) => void,
  factory: RecognizerFactory = defaultRecognizerFactory,
  now: () => number = () => performance.now()
): EngineController {
  let recognizer: Recognizer | null = null;
  let lang: string | null = null;
  let starting: Promise<Recognizer> | null = null;
  let activeId = -1;

  async function ensure(wanted: string): Promise<Recognizer> {
    if (recognizer && lang === wanted) return recognizer;
    if (starting && lang === wanted) return starting;
    if (recognizer) {
      await recognizer.terminate();
      recognizer = null;
    }
    lang = wanted;
    const p = factory(wanted, (status, progress) =>
      post({ id: activeId, action: 'PROGRESS', ok: true, status, progress })
    );
    starting = p;
    try {
      recognizer = await p;
      return recognizer;
    } catch (e) {
      lang = null;
      throw e;
    } finally {
      starting = null;
    }
  }

  // Requests are handled one at a time, in order: Tesseract can only run one job per worker.
  let queue: Promise<void> = Promise.resolve();

  async function run(request: EngineRequest): Promise<void> {
    activeId = request.id;
    try {
      switch (request.action) {
        case 'INIT': {
          await ensure(request.lang ?? 'eng');
          post({ id: request.id, action: 'INIT', ok: true });
          return;
        }
        case 'RECOGNIZE': {
          const r = await ensure(lang ?? 'eng');
          const proof = startNetworkProof({ offline: request.offline === true });
          const t0 = now();
          let data: RawData;
          try {
            ({ data } = await r.recognize(request.image));
          } finally {
            proof.stop(); // always restore fetch / XHR, even if recognition threw
          }
          const durationMs = Math.round(now() - t0);
          const network = proof.getAudit();
          post({
            id: request.id,
            action: 'RECOGNIZE',
            ok: true,
            result: toOCRResult(data, durationMs, heapBytes()),
            network,
          });
          return;
        }
        case 'TERMINATE': {
          const r = recognizer;
          recognizer = null;
          lang = null;
          if (r) await r.terminate();
          post({ id: request.id, action: 'TERMINATE', ok: true });
          return;
        }
        default: {
          const unknown = request as { id: number; action: string };
          post({
            id: unknown.id,
            action: unknown.action as EngineRequest['action'],
            ok: false,
            error: `Unknown action: ${String(unknown.action)}`,
          });
        }
      }
    } catch (e) {
      post({
        id: request.id,
        action: request.action,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return {
    handle(request) {
      queue = queue.then(() => run(request));
      return queue;
    },
  };
}

// --- Worker wiring ---------------------------------------------------------------------
// Only attach when this file really is the worker's entry point. Importing it from tests or
// the main thread (for the types or createEngineController) must have no side effects.
declare const WorkerGlobalScope: { new (): unknown } | undefined;

const inWorker =
  typeof WorkerGlobalScope !== 'undefined' &&
  typeof self !== 'undefined' &&
  self instanceof (WorkerGlobalScope as unknown as new () => object);

if (inWorker) {
  const scope = self as unknown as {
    postMessage(message: EngineResponse): void;
    addEventListener(type: 'message', listener: (e: MessageEvent<EngineRequest>) => void): void;
  };
  const controller = createEngineController((r) => scope.postMessage(r));
  scope.addEventListener('message', (e) => {
    void controller.handle(e.data);
  });
}
