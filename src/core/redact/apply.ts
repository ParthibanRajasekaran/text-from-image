/**
 * Apply redactions to an image. The output is a NEW bitmap: the original pixels under each box are
 * painted over before export, and a canvas export carries no EXIF or other metadata. There is no
 * layer to peel back, which is the point of redacting instead of annotating.
 */
import type { Box } from './detect';

/** Grow a box by `pad` on every side and keep it inside the image. */
export function padBox(box: Box, pad: number, width: number, height: number): Box {
  const x0 = Math.max(0, Math.floor(box.x - pad));
  const y0 = Math.max(0, Math.floor(box.y - pad));
  const x1 = Math.min(width, Math.ceil(box.x + box.width + pad));
  const y1 = Math.min(height, Math.ceil(box.y + box.height + pad));
  return { x: x0, y: y0, width: Math.max(0, x1 - x0), height: Math.max(0, y1 - y0) };
}

/** A box from two drag corners, in any direction, clamped to the image. */
export function boxFromDrag(a: { x: number; y: number }, b: { x: number; y: number }, width: number, height: number): Box {
  return padBox({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) }, 0, width, height);
}

export interface FillContext {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, w: number, h: number): void;
}

export const REDACTION_COLOR = '#000000';
/** Breathing room around OCR boxes, which are tight, so descenders and edges are covered. */
export const REDACTION_PAD = 3;

export function paintRedactions(ctx: FillContext, boxes: readonly Box[], width: number, height: number, pad = REDACTION_PAD): void {
  ctx.fillStyle = REDACTION_COLOR;
  for (const b of boxes) {
    const p = padBox(b, pad, width, height);
    if (p.width > 0 && p.height > 0) ctx.fillRect(p.x, p.y, p.width, p.height);
  }
}

/** Redact `source` and return a PNG. Needs a browser (canvas). */
export async function renderRedacted(source: Blob, boxes: readonly Box[]): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available in this browser.');
    ctx.drawImage(bitmap, 0, 0);
    paintRedactions(ctx, boxes, bitmap.width, bitmap.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the image.'))), 'image/png')
    );
  } finally {
    bitmap.close();
  }
}
