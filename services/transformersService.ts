import { pipeline, Pipeline } from '@xenova/transformers';
import { OCRError, ErrorFactory, validateFile } from '../utils/errorHandling';

/**
 * Transformers.js + TrOCR Service (Enhanced with Error Handling)
 * 
 * Pros:
 * - AI-powered text extraction (transformer model)
 * - Runs entirely in the browser using WebAssembly
 * - No API costs or external servers
 * - Better with complex layouts than traditional OCR
 * - Handles handwritten text better than Tesseract
 * - Privacy-friendly (data stays local)
 * 
 * Cons:
 * - Large initial download (~100-200MB for models)
 * - First load is slow (model download + initialization)
 * - Requires modern browser with good performance
 * - Uses more memory than Tesseract
 * - May be slower on low-end devices
 * 
 * Best for: Complex documents, handwritten notes, mixed layouts, when AI quality is needed
 */

let ocrPipeline: Pipeline | null = null;

const PROCESSING_MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Initialize the OCR pipeline
 * This downloads the model on first use (cached afterwards)
 */
const initPipeline = async (
  onProgress?: (status: string, progress: number) => void
): Promise<Pipeline> => {
  if (ocrPipeline) {
    return ocrPipeline;
  }

  try {
    // Use TrOCR model for text recognition
    // Alternative models: 'Xenova/trocr-base-handwritten', 'Xenova/trocr-large-printed'
    ocrPipeline = await pipeline('image-to-text', 'Xenova/trocr-base-printed', {
      progress_callback: (progress: any) => {
        if (onProgress) {
          const status = progress.status || 'Loading model';
          const percent = progress.progress || 0;
          onProgress(status, Math.round(percent));
        }
      },
    });

    return ocrPipeline;
  } catch (error: any) {
    console.error('Failed to initialize Transformers.js pipeline:', error);
    ocrPipeline = null; // Reset on failure
    
    // Handle specific errors
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      throw ErrorFactory.networkError(error);
    }
    
    if (error?.message?.includes('load') || error?.message?.includes('download')) {
      throw ErrorFactory.modelLoadFailed('TrOCR', error);
    }
    
    throw ErrorFactory.processingFailed('Transformers initialization', error);
  }
};

/**
 * Convert File to base64 data URL for the model
 */
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        if (!result) {
          reject(ErrorFactory.fileCorrupted());
        } else {
          resolve(result);
        }
      };
      
      reader.onerror = () => {
        reject(ErrorFactory.fileCorrupted(reader.error));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      reject(ErrorFactory.fileCorrupted(error));
    }
  });
};

/**
 * Extract text from an image using TrOCR transformer model
 * Enhanced with comprehensive error handling
 */
export const extractTextFromImage = async (
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<string> => {
  // Validate file
  try {
    validateFile(file);
  } catch (error) {
    throw error instanceof OCRError ? error : ErrorFactory.fromError(error, 'file validation');
  }

  try {
    // Initialize the pipeline (downloads model on first use)
    if (onProgress) onProgress('Loading AI model...', 0);
    const pipe = await initPipeline(onProgress);

    // Convert file to data URL
    if (onProgress) onProgress('Processing image...', 50);
    let imageUrl: string;
    
    try {
      imageUrl = await fileToDataURL(file);
    } catch (error) {
      if (error instanceof OCRError) {
        throw error;
      }
      throw ErrorFactory.fileCorrupted(error);
    }

    // Run the model
    if (onProgress) onProgress('Extracting text...', 75);
    let result: any;
    
    try {
      result = await pipe(imageUrl);
    } catch (modelError: any) {
      console.error('Model execution error:', modelError);
      
      if (modelError?.message?.includes('memory') || modelError?.name === 'QuotaExceededError') {
        throw ErrorFactory.outOfMemory(modelError);
      }
      
      throw ErrorFactory.processingFailed('Transformers model', modelError);
    }

    if (onProgress) onProgress('Complete', 100);

    // Extract text from result
    // TrOCR returns array of objects with 'generated_text'
    const extractedText = Array.isArray(result)
      ? result.map((r: any) => r.generated_text).join('\n')
      : (result as any).generated_text || '';

    const trimmedText = extractedText.trim();
    
    if (!trimmedText) {
      throw ErrorFactory.noTextFound();
    }

    return trimmedText;
  } catch (error: any) {
    console.error('Transformers.js OCR Error:', error);
    
    // If it's already an OCRError, rethrow it
    if (error instanceof OCRError) {
      throw error;
    }
    
    // Handle network errors
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      throw ErrorFactory.networkError(error);
    }
    
    // Handle memory errors
    if (error?.message?.includes('memory') || error?.name === 'QuotaExceededError') {
      throw ErrorFactory.outOfMemory(error);
    }
    
    // Generic processing error
    throw ErrorFactory.processingFailed('Transformers', error);
  }
};

/**
 * Alternative: Use a different model optimized for handwritten text
 * Enhanced with comprehensive error handling
 */
export const extractHandwrittenText = async (
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<string> => {
  // Validate file upfront
  try {
    validateFile(file);
  } catch (error) {
    throw error instanceof OCRError ? error : ErrorFactory.fromError(error, 'file validation');
  }

  let pipe: any = null;

  try {
    // Use handwritten text model
    if (onProgress) onProgress('Loading handwriting model...', 0);
    
    try {
      pipe = await pipeline(
        'image-to-text',
        'Xenova/trocr-base-handwritten',
        {
          progress_callback: (progress: any) => {
            if (onProgress) {
              onProgress(progress.status || 'Loading', progress.progress || 0);
            }
          },
        }
      );
    } catch (pipeError: any) {
      console.error('Failed to initialize handwriting model:', pipeError);
      
      if (pipeError?.message?.includes('network') || pipeError?.message?.includes('fetch')) {
        throw ErrorFactory.networkError(pipeError);
      }
      
      throw ErrorFactory.modelLoadFailed('Handwritten text model', pipeError);
    }

    if (onProgress) onProgress('Processing image...', 50);
    let imageUrl: string;
    
    try {
      imageUrl = await fileToDataURL(file);
    } catch (error) {
      if (error instanceof OCRError) {
        throw error;
      }
      throw ErrorFactory.fileCorrupted(error);
    }

    if (onProgress) onProgress('Extracting handwritten text...', 75);
    let result: any;
    
    try {
      result = await pipe(imageUrl);
    } catch (modelError: any) {
      console.error('Handwriting model execution error:', modelError);
      
      if (modelError?.message?.includes('memory') || modelError?.name === 'QuotaExceededError') {
        throw ErrorFactory.outOfMemory(modelError);
      }
      
      throw ErrorFactory.processingFailed('Handwritten text model', modelError);
    }

    if (onProgress) onProgress('Complete', 100);

    const extractedText = Array.isArray(result)
      ? result.map((r: any) => r.generated_text).join('\n')
      : (result as any).generated_text || '';

    const trimmedText = extractedText.trim();
    
    if (!trimmedText) {
      throw ErrorFactory.noTextFound();
    }

    return trimmedText;
  } catch (error: any) {
    console.error('Handwritten text extraction error:', error);
    
    // If it's already an OCRError, rethrow it
    if (error instanceof OCRError) {
      throw error;
    }
    
    // Handle network errors
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      throw ErrorFactory.networkError(error);
    }
    
    // Handle memory errors
    if (error?.message?.includes('memory') || error?.name === 'QuotaExceededError') {
      throw ErrorFactory.outOfMemory(error);
    }
    
    // Generic processing error
    throw ErrorFactory.processingFailed('handwritten text extraction', error);
  }
};

/**
 * Clear the cached pipeline to free up memory
 */
export const clearPipeline = () => {
  ocrPipeline = null;
};
