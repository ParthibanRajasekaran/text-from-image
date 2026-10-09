/**
 * WCAG 2.1 contrast analysis for OCR words.
 *
 * Given the pixels behind a word's bounding box, find the text colour and the background
 * colour, then compute the WCAG contrast ratio between them.
 *
 * Relative luminance (WCAG 2.1, https://www.w3.org/TR/WCAG21/#dfn-relative-luminance):
 *     L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * where R, G and B are the *linearised* sRGB channels:
 *     c = C / 255;  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
 * (the weights only give a correct answer on linearised values, so we linearise first;
 * black on white then comes out at exactly 21:1.)
 *
 * Contrast ratio:  (L1 + 0.05) / (L2 + 0.05), with L1 the lighter colour.
 *
 * Separating text from background: k-means with k = 2 over the pixels in the box, in RGB
 * space. The cluster with fewer pixels is the text (ink covers less of a word box than
 * the background does). Anti-aliased edge pixels sit between the two colours and would
 * pull the text centroid towards the background, so the text colour is taken from the
 * "core" of the text cluster: the quarter of its pixels farthest from the background.
 *
 * No DOM, no canvas: works on anything shaped like ImageData, in a worker or in Node.
 *
 * Single source of truth: the website (src/core/analysis/contrast.ts re-exports this file) and
 * the Playwright / Cypress matchers use the same code.
 */

export interface BBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export const WCAG_MIN_RATIO_NORMAL = 4.5;
export const WCAG_MIN_RATIO_LARGE = 3;

export interface ImageDataLike {
  /** RGBA, 4 bytes per pixel, row-major. */
  data: Uint8ClampedArray | Uint8Array | number[];
  width: number;
  height: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export type ContrastFlag = 'INSUFFICIENT_CONTRAST' | 'NO_SAMPLE';

export interface ContrastResult {
  /** Contrast ratio from 1 to 21. NaN when there were no pixels to sample. */
  ratio: number;
  /** The minimum ratio that applied (3 for large text, 4.5 for normal text). */
  threshold: number;
  isLargeText: boolean;
  passes: boolean;
  /** Set when the word fails; absent when it passes. */
  flag?: ContrastFlag;
  textColor?: RGB;
  backgroundColor?: RGB;
  sampledPixels: number;
}

export interface ContrastOptions {
  /**
   * Treat the word as large text (WCAG: at least 18pt, or 14pt bold, i.e. about 24px / 18.66px
   * bold). 'auto' (default) decides from the box height: >= `largeTextMinHeightPx`.
   */
  largeText?: boolean | 'auto';
  /** Box height, in CSS pixels, at or above which 'auto' counts as large. Default 24. */
  largeTextMinHeightPx?: number;
  /** Image pixels per CSS pixel (devicePixelRatio of the screenshot). Default 1. */
  pixelScale?: number;
  /** Cap on pixels sampled per box. Larger boxes are strided. Default 20000. */
  maxSamples?: number;
}

/** sRGB channel (0-255) to linear light (0-1). */
function linearise(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance({ r, g, b }: RGB): number {
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/** WCAG contrast ratio of two luminances, in either order. */
export function contrastRatio(l1: number, l2: number): number {
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

export function contrastBetween(a: RGB, b: RGB): number {
  return contrastRatio(relativeLuminance(a), relativeLuminance(b));
}

type Pixel = [number, number, number];

function dist2(p: Pixel, c: Pixel): number {
  const dr = p[0] - c[0];
  const dg = p[1] - c[1];
  const db = p[2] - c[2];
  return dr * dr + dg * dg + db * db;
}

function mean(pixels: Pixel[]): Pixel {
  let r = 0;
  let g = 0;
  let b = 0;
  for (const p of pixels) {
    r += p[0];
    g += p[1];
    b += p[2];
  }
  const n = pixels.length || 1;
  return [r / n, g / n, b / n];
}

const toRGB = (p: Pixel): RGB => ({ r: Math.round(p[0]), g: Math.round(p[1]), b: Math.round(p[2]) });

/** Copy the RGB of every pixel inside the box (clamped to the image), striding if large. */
function samplePixels(image: ImageDataLike, bbox: BBox, maxSamples: number): Pixel[] {
  const x0 = Math.max(0, Math.floor(bbox.x0));
  const y0 = Math.max(0, Math.floor(bbox.y0));
  const x1 = Math.min(image.width, Math.ceil(bbox.x1));
  const y1 = Math.min(image.height, Math.ceil(bbox.y1));
  if (x1 <= x0 || y1 <= y0) return [];

  const area = (x1 - x0) * (y1 - y0);
  const stride = Math.max(1, Math.ceil(Math.sqrt(area / maxSamples)));
  const out: Pixel[] = [];
  const { data, width } = image;
  for (let y = y0; y < y1; y += stride) {
    for (let x = x0; x < x1; x += stride) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      // Fully transparent pixels carry no colour information.
      if (a === 0) continue;
      out.push([data[i], data[i + 1], data[i + 2]]);
    }
  }
  return out;
}

interface Split {
  text: Pixel;
  background: Pixel;
}

/** k-means, k = 2. Returns null when every sampled pixel is the same colour. */
function splitTextAndBackground(pixels: Pixel[]): Split | null {
  // Seed with the darkest and lightest pixels: they are the two most likely poles.
  let lo = pixels[0];
  let hi = pixels[0];
  let loL = Infinity;
  let hiL = -Infinity;
  for (const p of pixels) {
    const l = 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
    if (l < loL) {
      loL = l;
      lo = p;
    }
    if (l > hiL) {
      hiL = l;
      hi = p;
    }
  }
  if (lo[0] === hi[0] && lo[1] === hi[1] && lo[2] === hi[2]) return null;

  let c0: Pixel = [...lo];
  let c1: Pixel = [...hi];
  let a: Pixel[] = [];
  let b: Pixel[] = [];
  for (let iter = 0; iter < 12; iter++) {
    a = [];
    b = [];
    for (const p of pixels) (dist2(p, c0) <= dist2(p, c1) ? a : b).push(p);
    if (a.length === 0 || b.length === 0) break;
    const n0 = mean(a);
    const n1 = mean(b);
    const moved = dist2(n0, c0) + dist2(n1, c1);
    c0 = n0;
    c1 = n1;
    if (moved < 0.25) break;
  }
  if (a.length === 0 || b.length === 0) return null;

  // Fewer pixels = ink. On an exact tie, call the darker cluster the text.
  const darkerIsA = c0[0] + c0[1] + c0[2] <= c1[0] + c1[1] + c1[2];
  const aIsText = a.length < b.length || (a.length === b.length && darkerIsA);
  const textPixels = aIsText ? a : b;
  const background = aIsText ? c1 : c0;

  // Core of the ink: the quarter of text pixels farthest from the background.
  const byDistance = [...textPixels].sort((p, q) => dist2(q, background) - dist2(p, background));
  const core = byDistance.slice(0, Math.max(1, Math.ceil(byDistance.length / 4)));
  return { text: mean(core), background };
}

/** Contrast of the text inside one bounding box against the background around it. */
export function analyzeWordContrast(
  image: ImageDataLike,
  bbox: BBox,
  options: ContrastOptions = {}
): ContrastResult {
  const { largeText = 'auto', largeTextMinHeightPx = 24, pixelScale = 1, maxSamples = 20000 } = options;

  const heightCssPx = (bbox.y1 - bbox.y0) / pixelScale;
  const isLargeText = largeText === 'auto' ? heightCssPx >= largeTextMinHeightPx : largeText;
  const threshold = isLargeText ? WCAG_MIN_RATIO_LARGE : WCAG_MIN_RATIO_NORMAL;

  const pixels = samplePixels(image, bbox, maxSamples);
  if (pixels.length === 0) {
    return { ratio: NaN, threshold, isLargeText, passes: false, flag: 'NO_SAMPLE', sampledPixels: 0 };
  }

  const split = splitTextAndBackground(pixels);
  if (!split) {
    // One flat colour: nothing to read, so as far as a user is concerned the contrast is 1:1.
    const flat = toRGB(pixels[0]);
    return {
      ratio: 1,
      threshold,
      isLargeText,
      passes: false,
      flag: 'INSUFFICIENT_CONTRAST',
      textColor: flat,
      backgroundColor: flat,
      sampledPixels: pixels.length,
    };
  }

  const text = toRGB(split.text);
  const background = toRGB(split.background);
  const ratio = contrastBetween(text, background);
  const passes = ratio >= threshold;
  return {
    ratio,
    threshold,
    isLargeText,
    passes,
    ...(passes ? {} : { flag: 'INSUFFICIENT_CONTRAST' as const }),
    textColor: text,
    backgroundColor: background,
    sampledPixels: pixels.length,
  };
}

export interface WordContrast<W> {
  word: W;
  contrast: ContrastResult;
}

/** Analyse every word. `words` only needs a `bbox`. */
export function analyzeWords<W extends { bbox: BBox }>(
  image: ImageDataLike,
  words: readonly W[],
  options: ContrastOptions = {}
): WordContrast<W>[] {
  return words.map((word) => ({ word, contrast: analyzeWordContrast(image, word.bbox, options) }));
}
