/**
 * Custom Error Types for OCR Operations
 * Provides detailed, user-friendly error messages and recovery strategies
 */

export enum ErrorCode {
  // File-related errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE = 'FILE_INVALID_TYPE',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  
  // OCR-related errors
  OCR_NO_TEXT_FOUND = 'OCR_NO_TEXT_FOUND',
  OCR_LOW_QUALITY = 'OCR_LOW_QUALITY',
  OCR_PROCESSING_FAILED = 'OCR_PROCESSING_FAILED',
  OCR_TIMEOUT = 'OCR_TIMEOUT',
  
  // Preprocessing errors
  PREPROCESSING_FAILED = 'PREPROCESSING_FAILED',
  IMAGE_LOAD_FAILED = 'IMAGE_LOAD_FAILED',
  CANVAS_ERROR = 'CANVAS_ERROR',
  
  // Model/API errors
  MODEL_LOAD_FAILED = 'MODEL_LOAD_FAILED',
  MODEL_INITIALIZATION_FAILED = 'MODEL_INITIALIZATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // System errors
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface OCRErrorDetails {
  code: ErrorCode;
  message: string;
  userMessage: string;
  suggestions: string[];
  technicalDetails?: any;
  recoverable: boolean;
}

export class OCRError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly suggestions: string[];
  public readonly technicalDetails?: any;
  public readonly recoverable: boolean;

  constructor(details: OCRErrorDetails) {
    super(details.message);
    this.name = 'OCRError';
    this.code = details.code;
    this.userMessage = details.userMessage;
    this.suggestions = details.suggestions;
    this.technicalDetails = details.technicalDetails;
    this.recoverable = details.recoverable;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OCRError);
    }
  }

  public toString(): string {
    return `${this.name} [${this.code}]: ${this.userMessage}`;
  }

  public toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      suggestions: this.suggestions,
      recoverable: this.recoverable,
      technicalDetails: this.technicalDetails,
    };
  }
}

/**
 * Error Factory - Creates appropriate OCR errors
 */
export class ErrorFactory {
  static fileTooLarge(fileSize: number, maxSize: number): OCRError {
    return new OCRError({
      code: ErrorCode.FILE_TOO_LARGE,
      message: `File size ${fileSize} exceeds maximum ${maxSize}`,
      userMessage: `Image is too large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB.`,
      suggestions: [
        'Compress the image using an online tool',
        'Resize the image to a smaller resolution',
        'Convert to a more efficient format (e.g., JPEG)',
        'Try cropping the image to show only the text area',
      ],
      recoverable: true,
    });
  }

  static invalidFileType(fileType: string): OCRError {
    return new OCRError({
      code: ErrorCode.FILE_INVALID_TYPE,
      message: `Invalid file type: ${fileType}`,
      userMessage: `This file type (${fileType}) is not supported.`,
      suggestions: [
        'Please use PNG, JPEG, or WEBP images',
        'Convert your file to a supported image format',
        'Take a screenshot of the document if it\'s a PDF',
      ],
      recoverable: true,
    });
  }

  static fileCorrupted(error?: any): OCRError {
    return new OCRError({
      code: ErrorCode.FILE_CORRUPTED,
      message: 'File appears to be corrupted or unreadable',
      userMessage: 'The image file appears to be corrupted and cannot be read.',
      suggestions: [
        'Try uploading a different copy of the image',
        'Check if the file opens correctly in other applications',
        'Re-save or re-export the image',
      ],
      technicalDetails: error,
      recoverable: false,
    });
  }

  static noTextFound(): OCRError {
    return new OCRError({
      code: ErrorCode.OCR_NO_TEXT_FOUND,
      message: 'No readable text found in image',
      userMessage: 'No text could be detected in the image.',
      suggestions: [
        'Ensure the image actually contains text',
        'Try a clearer or higher resolution image',
        'Make sure the text is not too small',
        'Check that the image is not blank or corrupted',
      ],
      recoverable: false,
    });
  }

  static lowQuality(confidence: number): OCRError {
    return new OCRError({
      code: ErrorCode.OCR_LOW_QUALITY,
      message: `Low OCR confidence: ${confidence}%`,
      userMessage: `Text extraction had low confidence (${confidence}%). Results may be inaccurate.`,
      suggestions: [
        'Try a higher resolution image',
        'Ensure better lighting in the photo',
        'Use a clearer image with better contrast',
        'Try straightening or rotating the image',
      ],
      technicalDetails: { confidence },
      recoverable: true,
    });
  }

  static processingFailed(method: string, error: any): OCRError {
    return new OCRError({
      code: ErrorCode.OCR_PROCESSING_FAILED,
      message: `${method} processing failed`,
      userMessage: `Text extraction failed. Please try again or use a different image.`,
      suggestions: [
        'Try uploading the image again',
        'Check your internet connection (for first-time model loading)',
        'Try a different image format',
        'Refresh the page and try again',
      ],
      technicalDetails: { method, error: error?.message || error },
      recoverable: true,
    });
  }

  static preprocessingFailed(error: any): OCRError {
    return new OCRError({
      code: ErrorCode.PREPROCESSING_FAILED,
      message: 'Image preprocessing failed',
      userMessage: 'Failed to prepare the image for text extraction.',
      suggestions: [
        'The image might be in an unsupported format',
        'Try a simpler image without animations or layers',
        'Ensure the image is not corrupted',
      ],
      technicalDetails: error,
      recoverable: true,
    });
  }

  static imageLoadFailed(error: any): OCRError {
    return new OCRError({
      code: ErrorCode.IMAGE_LOAD_FAILED,
      message: 'Failed to load image',
      userMessage: 'The image could not be loaded or decoded.',
      suggestions: [
        'Check if the image file is valid',
        'Try converting to PNG or JPEG format',
        'Ensure the image is not password-protected',
      ],
      technicalDetails: error,
      recoverable: true,
    });
  }

  static modelLoadFailed(modelName: string, error: any): OCRError {
    return new OCRError({
      code: ErrorCode.MODEL_LOAD_FAILED,
      message: `Failed to load ${modelName} model`,
      userMessage: 'Failed to load the AI model. This may be due to a network issue.',
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Clear your browser cache and try again',
        'Use a different browser',
      ],
      technicalDetails: { modelName, error: error?.message || error },
      recoverable: true,
    });
  }

  static networkError(error: any): OCRError {
    return new OCRError({
      code: ErrorCode.NETWORK_ERROR,
      message: 'Network error occurred',
      userMessage: 'A network error occurred. Please check your internet connection.',
      suggestions: [
        'Check your internet connection',
        'Try again in a few moments',
        'Disable any VPN or proxy that might interfere',
      ],
      technicalDetails: error,
      recoverable: true,
    });
  }

  static browserNotSupported(feature: string): OCRError {
    return new OCRError({
      code: ErrorCode.BROWSER_NOT_SUPPORTED,
      message: `Browser does not support ${feature}`,
      userMessage: 'Your browser does not support this feature.',
      suggestions: [
        'Update your browser to the latest version',
        'Try using Chrome, Firefox, or Edge',
        'Enable JavaScript if it\'s disabled',
      ],
      technicalDetails: { feature },
      recoverable: false,
    });
  }

  static outOfMemory(error: any): OCRError {
    return new OCRError({
      code: ErrorCode.OUT_OF_MEMORY,
      message: 'Ran out of memory during processing',
      userMessage: 'The image is too large for your device to process.',
      suggestions: [
        'Try a smaller image file',
        'Close other browser tabs to free up memory',
        'Use a higher-spec device if possible',
        'Compress or downscale the image first',
      ],
      technicalDetails: error,
      recoverable: true,
    });
  }

  static timeout(operation: string, timeoutMs: number): OCRError {
    return new OCRError({
      code: ErrorCode.OCR_TIMEOUT,
      message: `Operation timed out after ${timeoutMs}ms`,
      userMessage: 'Text extraction took too long and was cancelled.',
      suggestions: [
        'Try a smaller or simpler image',
        'Check your internet connection',
        'Refresh the page and try again',
      ],
      technicalDetails: { operation, timeoutMs },
      recoverable: true,
    });
  }

  static unknown(error: any): OCRError {
    return new OCRError({
      code: ErrorCode.UNKNOWN_ERROR,
      message: error?.message || 'An unknown error occurred',
      userMessage: 'An unexpected error occurred. Please try again.',
      suggestions: [
        'Refresh the page and try again',
        'Try a different image',
        'Check the browser console for details',
        'Contact support if the problem persists',
      ],
      technicalDetails: error,
      recoverable: true,
    });
  }

  /**
   * Convert any error to OCRError
   */
  static fromError(error: any, context?: string): OCRError {
    if (error instanceof OCRError) {
      return error;
    }

    // Check for specific error patterns
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return this.networkError(error);
    }

    if (error?.message?.includes('memory') || error?.name === 'QuotaExceededError') {
      return this.outOfMemory(error);
    }

    if (error?.message?.includes('not supported')) {
      return this.browserNotSupported(context || 'feature');
    }

    return this.unknown(error);
  }
}

/**
 * Error Recovery Helper
 */
export class ErrorRecovery {
  /**
   * Retry operation with exponential backoff
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry non-recoverable errors
        if (error instanceof OCRError && !error.recoverable) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries - 1) {
          break;
        }

        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Timeout wrapper
   */
  static async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number,
    operationName: string = 'operation'
  ): Promise<T> {
    return Promise.race([
      operation,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(ErrorFactory.timeout(operationName, timeoutMs)),
          timeoutMs
        )
      ),
    ]);
  }
}

/**
 * Validate file before processing
 */
export function validateFile(file: File): void {
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  if (file.size > MAX_SIZE) {
    throw ErrorFactory.fileTooLarge(file.size, MAX_SIZE);
  }

  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    throw ErrorFactory.invalidFileType(file.type);
  }
}

/**
 * Check browser compatibility
 */
export function checkBrowserCompatibility(): void {
  if (typeof window === 'undefined') {
    throw ErrorFactory.browserNotSupported('browser environment');
  }

  if (!window.FileReader) {
    throw ErrorFactory.browserNotSupported('FileReader API');
  }

  if (!HTMLCanvasElement.prototype.toBlob) {
    throw ErrorFactory.browserNotSupported('Canvas toBlob');
  }

  if (!window.URL || !window.URL.createObjectURL) {
    throw ErrorFactory.browserNotSupported('URL.createObjectURL');
  }
}
