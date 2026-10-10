// Dynamic import for code splitting (the OCR library loads only when text is extracted)
import {
  OCRError,
  ErrorFactory,
  ErrorRecovery,
  validateFile,
  checkBrowserCompatibility,
} from '../utils/errorHandling';

/**
 * OCR service: Tesseract, run entirely in the browser.
 *
 * There used to be a second, "AI model" fallback that downloaded a model at runtime when Tesseract was
 * unsure. It is gone: the site's Content-Security-Policy (connect-src 'self') blocks that download, so in
 * production it could only fail, and it turned a low-confidence result into an error. A low-confidence
 * result is now returned with its confidence, flagged `lowConfidence`, so the caller can show it.
 *
 * Nothing is uploaded and nothing is fetched at recognition time.
 */

// Check browser compatibility on module load
try {
  checkBrowserCompatibility();
} catch (error) {
  console.error('Browser compatibility check failed:', error);
}

interface ExtractOptions {
  /** Confidence (0-100) below which the result is flagged `lowConfidence`. It is still returned. */
  minConfidence?: number;
  /** Minimum text length to count as having found text. */
  minTextLength?: number;
  /** Callback for progress updates */
  onProgress?: (status: string, progress: number, method: 'tesseract') => void;
}

interface ExtractResult {
  text: string;
  method: 'tesseract';
  confidence?: number;
  /** True when the engine was unsure (confidence below `minConfidence`). The text may contain mistakes. */
  lowConfidence: boolean;
}

const DEFAULT_MIN_CONFIDENCE = 60;
const DEFAULT_MIN_TEXT_LENGTH = 3;

/** Extract text from an image. */
export const extractTextFromImage = async (file: File, options: ExtractOptions = {}): Promise<string> => {
  const result = await extractTextWithDetails(file, options);
  return result.text;
};

/** Extract text with the confidence and a flag for results the engine was unsure about. */
export const extractTextWithDetails = async (
  file: File,
  options: ExtractOptions = {}
): Promise<ExtractResult> => {
  const {
    minConfidence = DEFAULT_MIN_CONFIDENCE,
    minTextLength = DEFAULT_MIN_TEXT_LENGTH,
    onProgress,
  } = options;

  try {
    validateFile(file);
  } catch (error) {
    if (error instanceof OCRError) throw error;
    throw ErrorFactory.fromError(error, 'file validation');
  }

  try {
    onProgress?.('Starting Tesseract OCR...', 0, 'tesseract');

    const TesseractService = await import('./tesseractService');
    const result = await ErrorRecovery.withTimeout(
      TesseractService.extractTextWithConfidence(file, (progress) =>
        onProgress?.('Processing with Tesseract...', progress, 'tesseract')
      ),
      60000, // 60 second timeout
      'Tesseract text extraction'
    );

    if (result.text.trim().length < minTextLength) {
      throw ErrorFactory.noTextFound();
    }

    onProgress?.('Text extracted successfully', 100, 'tesseract');
    return {
      text: result.text,
      method: 'tesseract',
      confidence: result.confidence,
      lowConfidence: result.confidence < minConfidence,
    };
  } catch (error) {
    if (error instanceof OCRError) throw error;
    throw ErrorFactory.processingFailed('Tesseract', error);
  }
};
