import type { NetworkAudit } from '../privacy/networkProof';

/**
 * Shared types for the local OCR pipeline (src/core/ocr).
 *
 * Coordinates are in image pixels, origin top-left, x1/y1 exclusive-ish as Tesseract
 * reports them (x1 >= x0, y1 >= y0). Confidence is 0-100.
 */

export interface BBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface OCRWord {
  text: string;
  bbox: BBox;
  confidence: number;
}

export interface OCRLine {
  text: string;
  bbox: BBox;
  confidence: number;
}

export interface OCRResult {
  text: string;
  words: OCRWord[];
  lines: OCRLine[];
  metrics: {
    durationMs: number;
    /** JS heap in use after recognition. Only available in Chromium (`performance.memory`). */
    memoryBytes?: number;
  };
}

/** Image data the worker accepts. All of these can be structured-cloned to a worker. */
export type OCRImageInput = Blob | ArrayBuffer | Uint8Array;

export type EngineRequest =
  | { id: number; action: 'INIT'; lang?: string }
  | {
      id: number;
      action: 'RECOGNIZE';
      image: OCRImageInput;
      /** Refuse fetch / XHR / sendBeacon inside the worker for this run (see networkProof.ts). */
      offline?: boolean;
    }
  | { id: number; action: 'TERMINATE' };

export type EngineResponse =
  | { id: number; action: 'INIT' | 'TERMINATE'; ok: true }
  | {
      id: number;
      action: 'RECOGNIZE';
      ok: true;
      result: OCRResult;
      /** Requests the worker itself made during the run. The nested Tesseract worker is not covered. */
      network: NetworkAudit;
    }
  | { id: number; action: EngineRequest['action']; ok: false; error: string }
  | { id: number; action: 'PROGRESS'; ok: true; status: string; progress: number };
