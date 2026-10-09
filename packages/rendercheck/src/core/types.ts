import type { BBox } from './contrast';

export type { BBox };

export interface OCRWord {
  text: string;
  bbox: BBox;
  /** 0-100 */
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
  metrics: { durationMs: number; memoryBytes?: number };
}

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AssertionOptions {
  /** Only look at this part of the screenshot (pixels from its top-left corner). */
  region?: Region;
  /** Minimum OCR confidence, 0-100, of the words that make up the match. Default 80. */
  minConfidence?: number;
  /** Minimum WCAG contrast ratio of the matched words. Not checked unless set (e.g. 4.5). */
  minContrastRatio?: number;
  /** Require the region's text to equal the expected text, instead of containing it. */
  exact?: boolean;
  /** Match upper/lower case loosely. Default false: "PAY NOW" is not "Pay now". */
  ignoreCase?: boolean;
  /**
   * With a Locator: also compare against the element's DOM text (`innerText`). Default true.
   * Fails when the DOM and the pixels disagree.
   */
  dom?: boolean;
  /** Playwright: keep retrying for this long (ms) until the assertion holds. Default 5000; 0 = once. */
  timeout?: number;
  /** Playwright: pause between attempts (ms). Default 250. */
  interval?: number;
  /** Playwright page screenshots: capture the whole scrollable page. */
  fullPage?: boolean;
  /** Tesseract language data directory, if you need a language other than English. */
  langPath?: string;
  /** Tesseract language code. Default 'eng'. */
  lang?: string;
}

export type FailureKind =
  | 'NOT_FOUND'
  | 'LOW_CONFIDENCE'
  | 'INSUFFICIENT_CONTRAST'
  | 'DOM_MISMATCH';

export interface VerifyReport {
  pass: boolean;
  failure?: FailureKind;
  expected: string;
  /** What OCR read: the closest line, or all the text if nothing was close. */
  read: string;
  /** Mean OCR confidence (0-100) of the words behind `read`. */
  confidence: number;
  /** 0..1 similarity between `expected` and `read`. */
  similarity: number;
  /** Lowest contrast ratio among the matched words, when it was measured. */
  minContrast?: number;
  /**
   * Where on the screenshot the failing text is: the line that best explains the expected text,
   * in screenshot pixels. Absent when OCR read no text at all.
   */
  box?: Region;
  /** Multi-line, human readable. Empty when the assertion passes. */
  message: string;
  ocr: OCRResult;
}
