export { verifyText, evaluateOcr, DEFAULT_MIN_CONFIDENCE } from './verify';
export type { VerifyInput } from './verify';
export { recognize, shutdown, defaultLangPath } from './ocr';
export type { RecognizeOptions } from './ocr';
export { decodeImage } from './image';
export {
  analyzeWordContrast,
  analyzeWords,
  contrastBetween,
  contrastRatio,
  relativeLuminance,
  WCAG_MIN_RATIO_LARGE,
  WCAG_MIN_RATIO_NORMAL,
} from './contrast';
export type { ContrastResult, ContrastOptions, ImageDataLike, RGB, BBox } from './contrast';
export { normalizeText, similarity, highlightDiff } from './text';
export type {
  AssertionOptions,
  FailureKind,
  OCRLine,
  OCRResult,
  OCRWord,
  Region,
  VerifyReport,
} from './types';
