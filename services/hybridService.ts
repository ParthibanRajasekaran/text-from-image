// Dynamic imports for code splitting (lazy load OCR libraries)
import { 
  OCRError, 
  ErrorFactory, 
  ErrorRecovery, 
  validateFile,
  checkBrowserCompatibility 
} from '../utils/errorHandling';

/**
 * Hybrid OCR Service - Best of Both Worlds (Enhanced with Error Handling)
 * 
 * Strategy:
 * 1. Try Tesseract first (fast, lightweight, free) - loaded on demand
 * 2. If it fails or confidence is low, fallback to Transformers.js (AI-powered) - loaded on demand
 * 3. If both fail, throw detailed error with recovery suggestions
 * 
 * Benefits:
 * - Fast for 80% of cases (Tesseract succeeds)
 * - High accuracy for remaining 20% (Transformers fallback)
 * - Code splitting: OCR libraries only loaded when needed (~1MB smaller initial bundle)
 * - Best user experience (fast when possible, accurate when needed)
 * - Comprehensive error handling with user-friendly messages
 * - Still 100% free with no API costs
 * - Privacy-friendly (all local processing)
 */

// Check browser compatibility on module load
try {
  checkBrowserCompatibility();
} catch (error) {
  console.error('Browser compatibility check failed:', error);
}

interface ExtractOptions {
  // Minimum confidence threshold (0-100) to accept Tesseract result
  minConfidence?: number;
  // Minimum text length to consider Tesseract result valid
  minTextLength?: number;
  // Callback for progress updates
  onProgress?: (status: string, progress: number, method: 'tesseract' | 'transformers') => void;
  // Force specific method (skip auto-fallback)
  forceMethod?: 'tesseract' | 'transformers';
}

interface ExtractResult {
  text: string;
  method: 'tesseract' | 'transformers';
  confidence?: number;
  fallbackUsed: boolean;
}

const DEFAULT_MIN_CONFIDENCE = 60; // Accept Tesseract if confidence > 60%
const DEFAULT_MIN_TEXT_LENGTH = 3; // Need at least 3 characters

/**
 * Extract text with automatic fallback mechanism
 */
export const extractTextFromImage = async (
  file: File,
  options: ExtractOptions = {}
): Promise<string> => {
  const result = await extractTextWithDetails(file, options);
  return result.text;
};

/**
 * Extract text with detailed information about which method was used
 * Enhanced with comprehensive error handling and validation
 */
export const extractTextWithDetails = async (
  file: File,
  options: ExtractOptions = {}
): Promise<ExtractResult> => {
  const {
    minConfidence = DEFAULT_MIN_CONFIDENCE,
    minTextLength = DEFAULT_MIN_TEXT_LENGTH,
    onProgress,
    forceMethod,
  } = options;

  // Validate file before processing
  try {
    validateFile(file);
  } catch (error) {
    if (error instanceof OCRError) {
      throw error;
    }
    throw ErrorFactory.fromError(error, 'file validation');
  }

  // If specific method is forced, use only that
  if (forceMethod === 'transformers') {
    if (onProgress) onProgress('Using AI model (Transformers)...', 0, 'transformers');
    
    try {
      // Dynamic import for code splitting
      const TransformersService = await import('./transformersService');
      
      const text = await ErrorRecovery.withTimeout(
        TransformersService.extractTextFromImage(
          file,
          (status, progress) => onProgress?.(status, progress, 'transformers')
        ),
        120000, // 2 minute timeout for transformers (model download + processing)
        'Transformers text extraction'
      );
      
      if (!text || text.length === 0) {
        throw ErrorFactory.noTextFound();
      }
      
      return {
        text,
        method: 'transformers',
        fallbackUsed: false,
      };
    } catch (error) {
      if (error instanceof OCRError) {
        throw error;
      }
      throw ErrorFactory.processingFailed('Transformers', error);
    }
  }

  // Strategy 1: Try Tesseract first (fast path)
  let tesseractError: any = null;
  let tesseractResult: { text: string; confidence: number } | null = null;

  try {
    if (onProgress) onProgress('Trying Tesseract OCR...', 0, 'tesseract');

    // Dynamic import for code splitting
    const TesseractService = await import('./tesseractService');
    
    tesseractResult = await ErrorRecovery.withTimeout(
      TesseractService.extractTextWithConfidence(
        file,
        (progress) => onProgress?.(`Processing with Tesseract...`, progress, 'tesseract')
      ),
      60000, // 60 second timeout for tesseract
      'Tesseract text extraction'
    );

    const isGoodResult =
      tesseractResult.text.length >= minTextLength &&
      tesseractResult.confidence >= minConfidence;

    if (isGoodResult) {
      // Success with Tesseract!
      if (onProgress) onProgress('Text extracted successfully', 100, 'tesseract');
      return {
        text: tesseractResult.text,
        method: 'tesseract',
        confidence: tesseractResult.confidence,
        fallbackUsed: false,
      };
    }

    // Tesseract result exists but is poor quality
    console.log(`Tesseract low confidence (${tesseractResult.confidence}%), trying fallback...`);
    
  } catch (error) {
    // Tesseract completely failed
    tesseractError = error;
    console.warn('Tesseract failed, falling back to Transformers:', error);
  }

  // Strategy 2: Fallback to Transformers
  if (onProgress) {
    const reason = tesseractError 
      ? 'Tesseract failed, trying AI model...'
      : `Low confidence (${Math.round(tesseractResult?.confidence || 0)}%), trying AI model...`;
    onProgress(reason, 0, 'transformers');
  }

  try {
    // Dynamic import for code splitting
    const TransformersService = await import('./transformersService');
    
    const transformersText = await ErrorRecovery.withTimeout(
      TransformersService.extractTextFromImage(
        file,
        (status, progress) => onProgress?.(status, progress, 'transformers')
      ),
      120000, // 2 minute timeout
      'Transformers text extraction (fallback)'
    );

    if (!transformersText || transformersText.length === 0) {
      throw ErrorFactory.noTextFound();
    }

    return {
      text: transformersText,
      method: 'transformers',
      confidence: tesseractResult?.confidence,
      fallbackUsed: true,
    };
  } catch (transformersError) {
    // Both methods failed - provide comprehensive error
    console.error('Both OCR methods failed:', {
      tesseract: tesseractError,
      transformers: transformersError,
    });

    // If it's already an OCRError, throw it
    if (transformersError instanceof OCRError) {
      throw transformersError;
    }

    // Create a comprehensive error with both failures
    const isBothFailed = tesseractError && transformersError;
    const userFriendlyMessage = isBothFailed
      ? 'We tried both our fast OCR and advanced AI methods, but couldn\'t extract text from this image.'
      : 'Failed to extract text from the image using both methods.';
    
    throw new OCRError({
      code: 'OCR_PROCESSING_FAILED' as any,
      message: 'Both Tesseract and Transformers failed',
      userMessage: userFriendlyMessage,
      suggestions: [
        '📷 Ensure the image contains visible, readable text',
        '🔍 Try a higher resolution or clearer image',
        '🔄 Check if the image is properly oriented (not upside down)',
        '✨ Increase brightness if the image is too dark',
        '📐 Make sure text isn\'t too small or blurry',
        '📄 Try converting the image to PNG or JPEG format',
        '🔌 Check your internet connection (needed for first-time AI model download)',
      ],
      technicalDetails: {
        tesseractError: tesseractError?.message || tesseractError,
        transformersError: transformersError?.message || transformersError,
        tesseractConfidence: tesseractResult?.confidence,
        bothMethodsAttempted: true,
      },
      recoverable: true,
    });
  }
};

/**
 * Try multiple methods in parallel and return the best result
 * (More expensive but faster than sequential fallback)
 */
export const extractTextParallel = async (
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<ExtractResult> => {
  if (onProgress) onProgress('Processing with both methods...', 0);

  try {
    // Dynamic imports for code splitting
    const [TesseractService, TransformersService] = await Promise.all([
      import('./tesseractService'),
      import('./transformersService'),
    ]);
    
    // Run both methods simultaneously
    const [tesseractResult, transformersResult] = await Promise.allSettled([
      TesseractService.extractTextWithConfidence(file),
      TransformersService.extractTextFromImage(file),
    ]);

    // Check Tesseract result
    if (
      tesseractResult.status === 'fulfilled' &&
      tesseractResult.value.text.length >= DEFAULT_MIN_TEXT_LENGTH &&
      tesseractResult.value.confidence >= DEFAULT_MIN_CONFIDENCE
    ) {
      if (onProgress) onProgress('Complete', 100);
      return {
        text: tesseractResult.value.text,
        method: 'tesseract',
        confidence: tesseractResult.value.confidence,
        fallbackUsed: false,
      };
    }

    // Use Transformers result
    if (transformersResult.status === 'fulfilled') {
      if (onProgress) onProgress('Complete', 100);
      return {
        text: transformersResult.value,
        method: 'transformers',
        fallbackUsed: true,
      };
    }

    // Both failed
    throw new Error('Both OCR methods failed to extract text from the image.');
  } catch (error) {
    console.error('Parallel extraction failed:', error);
    throw error;
  }
};

/**
 * Get statistics about which method would be used without processing
 */
export const estimateBestMethod = (
  fileSize: number,
  fileType: string
): 'tesseract' | 'transformers' => {
  // Simple heuristics (you can make this smarter)
  
  // For very large images, prefer Tesseract (lighter)
  if (fileSize > 10 * 1024 * 1024) {
    return 'tesseract';
  }

  // For common document types, Tesseract is usually fine
  if (fileType === 'image/png' || fileType === 'image/jpeg') {
    return 'tesseract';
  }

  // Default to Tesseract (will fallback if needed)
  return 'tesseract';
};
