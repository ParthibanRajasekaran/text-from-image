/**
 * Turns OCR output + contrast analysis (+ an optional expected string) into the per-word
 * verdicts that the demo draws:
 *
 *   pass            green  the word was read with enough confidence and is legible
 *   low-confidence  amber  OCR confidence below LOW_CONFIDENCE (80)
 *   fail            rose   contrast below WCAG minimum, or part of a line that does not match the
 *                          expected text
 *
 * Fail wins over low-confidence.
 */

import type { OCRLine, OCRWord } from '../ocr/types';
import type { ContrastResult } from './contrast';
import { normalizeText, similarity } from '../../../packages/rendercheck/src/core/text';

// One implementation of text comparison, shared with the Playwright / Cypress matchers.
export { normalizeText, similarity };

export const LOW_CONFIDENCE = 80;

export type WordStatus = 'pass' | 'low-confidence' | 'fail';
export type FailReason = 'contrast' | 'mismatch';

export interface ClassifiedWord {
  word: OCRWord;
  contrast: ContrastResult | null;
  status: WordStatus;
  reason?: FailReason;
}

export interface TargetMatch {
  line: OCRLine;
  /** 0..1, 1 when the text is identical after normalisation. */
  similarity: number;
  /** The expected text occurs verbatim (after normalisation) in the line. */
  contained: boolean;
}

/**
 * The line the expected text most likely refers to: the best match, if it is at least
 * `minSimilarity` similar (or contains the expected text). A line that contains the expected
 * text always wins, shortest first.
 */
export function findTargetLine(
  lines: readonly OCRLine[],
  expected: string,
  minSimilarity = 0.5
): TargetMatch | null {
  const want = normalizeText(expected);
  if (!want) return null;
  let best: TargetMatch | null = null;
  for (const line of lines) {
    const have = normalizeText(line.text);
    const contained = have.includes(want);
    const sim = contained ? 1 : similarity(have, want);
    const candidate: TargetMatch = { line, similarity: sim, contained };
    const better =
      !best ||
      (candidate.contained && !best.contained) ||
      (candidate.contained === best.contained &&
        (candidate.similarity > best.similarity ||
          (candidate.contained && candidate.similarity === best.similarity && have.length < normalizeText(best.line.text).length)));
    if (better) best = candidate;
  }
  return best && (best.contained || best.similarity >= minSimilarity) ? best : null;
}

const inside = (w: OCRWord, line: OCRLine): boolean => {
  const cx = (w.bbox.x0 + w.bbox.x1) / 2;
  const cy = (w.bbox.y0 + w.bbox.y1) / 2;
  return cx >= line.bbox.x0 && cx <= line.bbox.x1 && cy >= line.bbox.y0 && cy <= line.bbox.y1;
};

export interface ClassifyInput {
  words: readonly OCRWord[];
  /** Same order and length as `words`; null where contrast could not be measured. */
  contrasts: ReadonlyArray<ContrastResult | null>;
  /** If set, the best-matching line must contain this text, or its words are marked as a mismatch. */
  target?: TargetMatch | null;
}

export function classifyWords({ words, contrasts, target }: ClassifyInput): ClassifiedWord[] {
  const mismatched = target && !target.contained ? target.line : null;
  return words.map((word, i) => {
    const contrast = contrasts[i] ?? null;
    if (contrast?.flag === 'INSUFFICIENT_CONTRAST') {
      return { word, contrast, status: 'fail', reason: 'contrast' };
    }
    if (mismatched && inside(word, mismatched)) {
      return { word, contrast, status: 'fail', reason: 'mismatch' };
    }
    if (word.confidence < LOW_CONFIDENCE) return { word, contrast, status: 'low-confidence' };
    return { word, contrast, status: 'pass' };
  });
}
