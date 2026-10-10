/**
 * The assertion itself, independent of any test runner: given a screenshot and the text you
 * expect, say whether a user would see it, and if not, why.
 */
import { analyzeWordContrast, type BBox } from './contrast';
import { decodeImage } from './image';
import { recognize } from './ocr';
import { highlightDiff, normalizeText, similarity } from './text';
import type { AssertionOptions, FailureKind, OCRLine, OCRResult, OCRWord, Region, VerifyReport } from './types';

export const DEFAULT_MIN_CONFIDENCE = 80;

export interface VerifyInput {
  /** PNG or JPEG bytes. */
  image: Uint8Array;
  expected: string;
  options?: AssertionOptions;
  /** The element's DOM text (`innerText`), if you want the pixels compared with the DOM. */
  domText?: string;
}

const q = (s: string) => `"[${s}]"`; // the quoted-and-bracketed form used in failure messages
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const pct = (n: number) => `${Math.round(n)}%`;

function wordsInside(words: OCRWord[], box: BBox): OCRWord[] {
  return words.filter((w) => {
    const cx = (w.bbox.x0 + w.bbox.x1) / 2;
    const cy = (w.bbox.y0 + w.bbox.y1) / 2;
    return cx >= box.x0 && cx <= box.x1 && cy >= box.y0 && cy <= box.y1;
  });
}

/** Works out what OCR read, relative to the expected text. Pure: no OCR, no image. */
export function evaluateOcr(
  ocr: OCRResult,
  expected: string,
  options: AssertionOptions = {}
): Pick<VerifyReport, 'pass' | 'read' | 'confidence' | 'similarity'> & { matchedWords: OCRWord[]; found: boolean; box?: Region } {
  const ic = options.ignoreCase === true;
  const want = normalizeText(expected, ic);
  const lines: OCRLine[] = ocr.lines.length ? ocr.lines : [{ text: ocr.text, bbox: { x0: 0, y0: 0, x1: Infinity, y1: Infinity }, confidence: mean(ocr.words.map((w) => w.confidence)) }];
  const joined = normalizeText(lines.map((l) => l.text).join(' '), ic);

  const found = options.exact ? joined === want : joined.includes(want);

  // The line that best explains the expected text.
  let best: { line: OCRLine; sim: number; contains: boolean } | null = null;
  for (const line of lines) {
    const have = normalizeText(line.text, ic);
    const contains = have.includes(want);
    const sim = contains ? 1 : similarity(have, want, ic);
    if (!best || (contains && !best.contains) || (contains === best.contains && sim > best.sim)) best = { line, sim, contains };
  }

  let read: string;
  let matchedWords: OCRWord[];
  let sim: number;
  let box: Region | undefined;
  if (best && (best.contains || best.sim >= 0.5)) {
    const b = best.line.bbox;
    if (Number.isFinite(b.x1) && Number.isFinite(b.y1)) box = { x: b.x0, y: b.y0, width: b.x1 - b.x0, height: b.y1 - b.y0 };
    read = best.line.text.trim();
    matchedWords = wordsInside(ocr.words, best.line.bbox);
    sim = best.sim;
  } else {
    read = ocr.text.replace(/\s+/g, ' ').trim();
    matchedWords = ocr.words;
    sim = read ? similarity(read, expected, ic) : 0;
  }
  if (!matchedWords.length) matchedWords = ocr.words;
  const confidence = mean(matchedWords.map((w) => w.confidence));
  return { pass: found, found, read, confidence, similarity: sim, matchedWords, box };
}

export async function verifyText({ image, expected, options = {}, domText }: VerifyInput): Promise<VerifyReport> {
  if (!expected || !expected.trim()) throw new Error('RenderCheck: the expected text cannot be empty');
  const minConfidence = options.minConfidence ?? DEFAULT_MIN_CONFIDENCE;
  const ic = options.ignoreCase === true;

  const ocr = await recognize(image, { region: options.region, lang: options.lang, langPath: options.langPath });
  const ev = evaluateOcr(ocr, expected, options);
  const regionNote = options.region
    ? `\n  Region: x=${options.region.x}, y=${options.region.y}, width=${options.region.width}, height=${options.region.height}`
    : '';

  const report = (failure: FailureKind | undefined, message: string, extra: Partial<VerifyReport> = {}): VerifyReport => ({
    pass: !failure,
    failure,
    expected,
    read: ev.read,
    confidence: Math.round(ev.confidence),
    similarity: ev.similarity,
    box: ev.box,
    message: failure ? message + regionNote : '',
    ocr,
    ...extra,
  });

  const domHas = domText === undefined ? undefined : normalizeText(domText, ic).includes(normalizeText(expected, ic));
  const checkDom = options.dom !== false && domText !== undefined;

  // 1. Is the text there at all?
  if (!ev.found) {
    const head = ev.read
      ? `Expected to find text ${q(expected)} but OCR read ${q(ev.read)} (Confidence: ${pct(ev.confidence)})`
      : `Expected to find text ${q(expected)} but OCR read no text`;
    const lines = [head];
    if (ev.read && ev.similarity > 0 && ev.similarity < 1) {
      const d = highlightDiff(normalizeText(expected, ic), normalizeText(ev.read, ic));
      if (d.expected !== d.actual) lines.push(`  Diff: ${d.expected}  →  ${d.actual}`);
    }
    if (checkDom && domHas) {
      lines.push('  The DOM contains this text, but it is not visible in the rendered pixels (hidden, clipped, covered, or too faint to read).');
    }
    return report('NOT_FOUND', lines.join('\n'));
  }

  // 2. Found. Is the DOM telling the same story?
  if (checkDom && domHas === false) {
    return report(
      'DOM_MISMATCH',
      `OCR read ${q(ev.read)} on screen (Confidence: ${pct(ev.confidence)}) but the DOM text does not contain ${q(expected)}\n  DOM text: ${q(normalizeText(domText as string, true).slice(0, 200))}`
    );
  }

  // 3. Read with enough confidence?
  if (ev.confidence < minConfidence) {
    return report(
      'LOW_CONFIDENCE',
      `Found text ${q(expected)} but OCR confidence was ${pct(ev.confidence)}, below the required ${minConfidence}%`
    );
  }

  // 4. Legible?
  if (options.minContrastRatio !== undefined) {
    const decoded = decodeImage(image);
    const results = ev.matchedWords.map((w) => ({
      word: w,
      c: analyzeWordContrast(decoded, w.bbox, { largeText: false }),
    }));
    const ratios = results.map((r) => r.c.ratio).filter(Number.isFinite);
    const minContrast = ratios.length ? Math.min(...ratios) : undefined;
    const bad = results.filter((r) => Number.isFinite(r.c.ratio) && r.c.ratio < (options.minContrastRatio as number));
    if (bad.length) {
      bad.sort((a, b) => a.c.ratio - b.c.ratio);
      const rgb = (c?: { r: number; g: number; b: number }) => (c ? `rgb(${c.r}, ${c.g}, ${c.b})` : '?');
      const worst = bad
        .slice(0, 3)
        .map((r) => `"${r.word.text}" ${r.c.ratio.toFixed(2)}:1 (${rgb(r.c.textColor)} on ${rgb(r.c.backgroundColor)})`)
        .join(', ');
      return report(
        'INSUFFICIENT_CONTRAST',
        `Found text ${q(expected)} (Confidence: ${pct(ev.confidence)}) but it is not legible: contrast must be at least ${options.minContrastRatio}:1, and ${bad.length} of ${results.length} word(s) fall short: ${worst}`,
        { minContrast }
      );
    }
    return report(undefined, '', { minContrast });
  }

  return report(undefined, '');
}
