/**
 * Image file validation utilities
 * 
 * Extracted from GlassDropzone.tsx to follow SRP
 * Provides pure validation logic separated from UI/event handling
 */

const MAX_FILE_SIZE_MB = 20;
const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file type
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 * 
 * @example
 * const result = validateImageType(file);
 * if (!result.valid) console.error(result.error);
 */
export function validateImageType(file: File): FileValidationResult {
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type || 'unknown'}. Please select an image file (PNG, JPG, WEBP).`,
    };
  }

  if (!SUPPORTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. Supported formats: JPG, PNG, WEBP.`,
    };
  }

  return { valid: true };
}

/**
 * Validate image file size
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 * 
 * @example
 * const result = validateFileSize(file);
 * if (!result.valid) console.error(result.error);
 */
export function validateFileSize(file: File): FileValidationResult {
  const fileSizeMB = file.size / (1024 * 1024);

  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      valid: false,
      error: `File too large (${fileSizeMB.toFixed(2)} MB). Maximum size is ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validate both type and size
 * @param file - File to validate
 * @returns Validation result, returns first error found if any
 * 
 * @example
 * const result = validateImageFile(file);
 * if (!result.valid) {
 *   setError(result.error);
 *   return;
 * }
 */
export function validateImageFile(file: File): FileValidationResult {
  // Check type first
  const typeValidation = validateImageType(file);
  if (!typeValidation.valid) return typeValidation;

  // Check size second
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) return sizeValidation;

  return { valid: true };
}

/**
 * Get supported file extensions for accept attribute
 * @returns Comma-separated list of supported types
 * 
 * @example
 * <input accept={getSupportedFileTypes()} />
 */
export function getSupportedFileTypes(): string {
  return SUPPORTED_TYPES.join(',');
}

/**
 * Get user-friendly list of supported formats
 * @returns Formatted string for display
 * 
 * @example
 * <p>Supported formats: {getFormatsLabel()}</p>
 */
export function getFormatsLabel(): string {
  return SUPPORTED_EXTENSIONS.map(ext => ext.toUpperCase().substring(1)).join(', ');
}
