/**
 * Tesseract.js configuration: self-hosted OCR assets.
 *
 * Single source of truth for where the OCR engine files come from. Nothing here
 * points at a CDN. The files live in public/ocr/ and are copied there by
 * `npm run vendor:ocr` (see scripts/vendor-ocr-assets.mjs).
 *
 * Why these paths (tesseract.js 5.1.1):
 * - workerPath: a classic worker script. `workerBlobURL: false` makes Tesseract create the
 *   worker straight from this same-origin URL. With the default (true) it builds a blob
 *   wrapper that calls importScripts(workerPath), which fails for a root-relative path
 *   because a blob worker has no base URL to resolve it against.
 * - corePath: a DIRECTORY. Tesseract picks the file itself, using SIMD feature detection:
 *   tesseract-core-simd-lstm.wasm.js, or tesseract-core-lstm.wasm.js as the fallback. These
 *   `.wasm.js` files carry the WebAssembly inline, so a separate `.wasm` file is not fetched.
 *   (A path ending in ".wasm" would be treated as a directory and 404.)
 * - langPath: a directory holding `<lang>.traineddata.gz` (gzip is the default).
 */

const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/?$/, '/');

export const OCR_ASSET_DIR = `${BASE}ocr`;

export interface LocalTesseractOptions {
  workerPath: string;
  corePath: string;
  langPath: string;
  workerBlobURL: false;
  gzip: true;
}

export function getTesseractWorkerOptions(): LocalTesseractOptions {
  return {
    workerPath: `${OCR_ASSET_DIR}/worker.min.js`,
    corePath: OCR_ASSET_DIR,
    langPath: OCR_ASSET_DIR,
    workerBlobURL: false,
    gzip: true,
  };
}

type TesseractModule = typeof import('tesseract.js');
type RecognizeInput = Parameters<
  Awaited<ReturnType<TesseractModule['createWorker']>>['recognize']
>[0];

export interface RecognizeLocalOptions {
  logger?: (info: { status: string; progress: number }) => void;
}

/**
 * Drop-in replacement for `Tesseract.recognize(image, lang, options)` that uses the
 * self-hosted assets. Like the original, it creates a worker for the call and always
 * terminates it afterwards.
 */
export async function recognizeLocal(
  image: RecognizeInput,
  lang = 'eng',
  options: RecognizeLocalOptions = {}
) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker(lang, 1, {
    ...getTesseractWorkerOptions(),
    logger: options.logger,
  });
  try {
    return await worker.recognize(image);
  } finally {
    await worker.terminate();
  }
}
