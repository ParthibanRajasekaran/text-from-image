/**
 * Shared by the CLI and the MCP server: run one assertion and return a small, stable,
 * machine-readable result (no OCR internals), so an agent or a script can act on it.
 */
import fs from 'node:fs';
import { evaluateOcr, verifyText } from '../core/verify';
import { recognize } from '../core/ocr';
import type { AssertionOptions, FailureKind, Region } from '../core/types';

export interface VerifyResult {
  pass: boolean;
  failure?: FailureKind;
  expected: string;
  read: string;
  confidence: number;
  similarity: number;
  minContrast?: number;
  box?: Region;
  message: string;
}

export interface ReadResult {
  text: string;
  lines: { text: string; confidence: number; box: Region }[];
  durationMs: number;
}

export function loadImage(source: { path?: string; base64?: string }): Uint8Array {
  if (source.base64) return new Uint8Array(Buffer.from(source.base64.replace(/^data:image\/\w+;base64,/, ''), 'base64'));
  if (!source.path) throw new Error('Provide an image file path or base64 image data');
  if (!fs.existsSync(source.path)) throw new Error(`Image not found: ${source.path}`);
  return new Uint8Array(fs.readFileSync(source.path));
}

export async function runVerify(image: Uint8Array, expected: string, options: AssertionOptions = {}): Promise<VerifyResult> {
  const r = await verifyText({ image, expected, options });
  return {
    pass: r.pass,
    ...(r.failure ? { failure: r.failure } : {}),
    expected: r.expected,
    read: r.read,
    confidence: r.confidence,
    similarity: Math.round(r.similarity * 100) / 100,
    ...(r.minContrast !== undefined ? { minContrast: Math.round(r.minContrast * 100) / 100 } : {}),
    ...(r.box ? { box: r.box } : {}),
    message: r.message,
  };
}

export async function runRead(image: Uint8Array, options: AssertionOptions = {}): Promise<ReadResult> {
  const ocr = await recognize(image, { region: options.region, lang: options.lang, langPath: options.langPath });
  return {
    text: ocr.text.trim(),
    lines: ocr.lines.map((l) => ({
      text: l.text.trim(),
      confidence: Math.round(l.confidence),
      box: { x: l.bbox.x0, y: l.bbox.y0, width: l.bbox.x1 - l.bbox.x0, height: l.bbox.y1 - l.bbox.y0 },
    })),
    durationMs: ocr.metrics.durationMs,
  };
}

export { evaluateOcr };
