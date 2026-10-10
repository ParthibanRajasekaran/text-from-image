import type { OCRLine, OCRWord } from '../ocr/types';
import type { ContrastResult } from './contrast';
import { classifyWords, findTargetLine } from './classify';

export type VerdictReason = 'not-visible' | 'mismatch' | 'low-contrast';

export interface Verdict {
  pass: boolean;
  reason?: VerdictReason;
  /** The line OCR read where the expected text should be, if any. */
  seen: string | null;
  headline: string;
}

export interface VerdictInput {
  lines: readonly OCRLine[];
  words: readonly OCRWord[];
  contrasts: ReadonlyArray<ContrastResult | null>;
  expected: string;
}

/** What a visible-output assertion would conclude from the pixels, in one place so it can be tested. */
export function renderVerdict({ lines, words, contrasts, expected }: VerdictInput): Verdict {
  const target = findTargetLine(lines, expected);
  if (!target) {
    return { pass: false, reason: 'not-visible', seen: null, headline: 'The text is not visible in the rendered pixels.' };
  }
  const seen = target.line.text.trim();
  if (!target.contained) {
    return { pass: false, reason: 'mismatch', seen, headline: 'The pixels show different text than expected.' };
  }
  const b = target.line.bbox;
  const unreadable = classifyWords({ words, contrasts, target }).some(
    (c) =>
      c.reason === 'contrast' &&
      (c.word.bbox.x0 + c.word.bbox.x1) / 2 >= b.x0 &&
      (c.word.bbox.x1 + c.word.bbox.x0) / 2 <= b.x1 &&
      (c.word.bbox.y0 + c.word.bbox.y1) / 2 >= b.y0 &&
      (c.word.bbox.y0 + c.word.bbox.y1) / 2 <= b.y1
  );
  if (unreadable) {
    return { pass: false, reason: 'low-contrast', seen, headline: 'The text is on screen but a person could not read it.' };
  }
  return { pass: true, seen, headline: 'The pixels show the expected text.' };
}
