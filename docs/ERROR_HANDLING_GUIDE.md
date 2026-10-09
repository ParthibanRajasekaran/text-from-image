# Error Handling Guide

## Overview

The application now includes a comprehensive error handling system that provides user-friendly error messages and actionable recovery suggestions. This guide explains the error types, how they're handled, and how to test them.

## Error Handling Architecture

### 1. OCRError Class

Custom error class that extends the standard Error with additional properties:

```typescript
class OCRError extends Error {
  code: ErrorCode;              // Specific error type
  userMessage: string;          // User-friendly message
  suggestions: string[];        // Recovery suggestions
  technicalDetails?: string;    // Technical error details
  recoverable: boolean;         // Can be retried
}
```

### 2. Error Types (ErrorCode Enum)

| Error Code | Description | Recoverable |
|-----------|-------------|-------------|
| `FILE_TOO_LARGE` | File exceeds 20MB limit | No - need smaller file |
| `FILE_INVALID_TYPE` | Unsupported file format | No - need PNG/JPEG/WEBP |
| `FILE_CORRUPTED` | File cannot be read/loaded | No - need valid file |
| `OCR_NO_TEXT_FOUND` | No text detected in image | Maybe - try better quality |
| `OCR_LOW_QUALITY` | Low confidence result | Yes - try preprocessing |
| `OCR_PROCESSING_FAILED` | OCR processing error | Yes - retry or try other method |
| `OCR_TIMEOUT` | Processing took too long | Yes - retry or try smaller image |
| `PREPROCESSING_FAILED` | Image enhancement error | Yes - try without preprocessing |
| `IMAGE_LOAD_FAILED` | Cannot load image | No - need valid image file |
| `MODEL_LOAD_FAILED` | AI model failed to load | Yes - check internet, retry |
| `NETWORK_ERROR` | Network connectivity issue | Yes - check connection, retry |
| `BROWSER_NOT_SUPPORTED` | Missing browser APIs | No - need modern browser |
| `OUT_OF_MEMORY` | Insufficient memory | Yes - try smaller image, close tabs |
| `UNKNOWN_ERROR` | Unexpected error | Maybe - retry |

### 3. ErrorFactory

Provides static methods to create specific error types with appropriate messages and suggestions:

```typescript
ErrorFactory.fileTooLarge(file, maxSize);
ErrorFactory.invalidFileType(file);
ErrorFactory.fileCorrupted(error);
ErrorFactory.noTextFound();
ErrorFactory.lowQuality(method, confidence);
ErrorFactory.processingFailed(method, error);
ErrorFactory.timeout(operation, timeoutSeconds);
ErrorFactory.preprocessingFailed(stage, error);
ErrorFactory.imageLoadFailed(error);
ErrorFactory.modelLoadFailed(modelName, error);
ErrorFactory.networkError(error);
ErrorFactory.browserNotSupported(feature);
ErrorFactory.outOfMemory(error);
ErrorFactory.fromError(error, context);
```

### 4. ErrorRecovery Utilities

Helper functions for error recovery:

```typescript
// Retry with exponential backoff
await ErrorRecovery.retryWithBackoff(
  operation,
  maxAttempts,
  initialDelayMs
);

// Timeout wrapper
await ErrorRecovery.withTimeout(
  operation,
  timeoutMs,
  operationName
);
```

## Error Handling in Services

### Tesseract Service

**File Validation:**
```typescript
try {
  validateFile(file);
} catch (error) {
  throw error instanceof OCRError ? error : ErrorFactory.fromError(error, 'file validation');
}
```

**Preprocessing Errors:**
```typescript
try {
  processedFile = await autoPreprocess(file);
} catch (prepError) {
  console.warn('Preprocessing failed, using original:', prepError);
  processedFile = file; // Graceful degradation
}
```

**OCR Execution Errors:**
```typescript
try {
  const result = await recognize(file);
  if (!result.text.trim()) {
    throw ErrorFactory.noTextFound();
  }
} catch (ocrError) {
  if (ocrError.message?.includes('Invalid image')) {
    throw ErrorFactory.fileCorrupted(ocrError);
  }
  if (ocrError.message?.includes('load')) {
    throw ErrorFactory.imageLoadFailed(ocrError);
  }
  if (ocrError.message?.includes('memory')) {
    throw ErrorFactory.outOfMemory(ocrError);
  }
  throw ErrorFactory.processingFailed('Tesseract', ocrError);
}
```

**Cleanup:**
```typescript
finally {
  if (worker) {
    await worker.terminate();
  }
}
```

### Low-confidence results

There is no second OCR method. When Tesseract is unsure, the result is returned with its confidence and a
`lowConfidence` flag, and the UI shows it as such. Tesseract runs under a timeout:

```typescript
const result = await ErrorRecovery.withTimeout(
  () => extractTextWithConfidence(file, options),
  60000, // 60 seconds
  'Tesseract OCR'
);
// result.lowConfidence is true when confidence is below the threshold
```

A failure (timeout, out of memory, unreadable image) is thrown as an `OCRError` built by `ErrorFactory`.
The site's Content-Security-Policy (`connect-src 'self'`) means nothing is downloaded at recognition time.

## User Interface Integration

### App.tsx Error Display

**Error State:**
```typescript
const [error, setError] = useState<string | null>(null);
const [errorSuggestions, setErrorSuggestions] = useState<string[]>([]);
```

**Error Handling:**
```typescript
catch (e: any) {
  if (e instanceof OCRError) {
    // Display user-friendly message and suggestions
    setError(e.userMessage);
    setErrorSuggestions(e.suggestions);
    
    console.error('OCR Error:', {
      code: e.code,
      message: e.userMessage,
      technical: e.technicalDetails,
      recoverable: e.recoverable
    });
  } else {
    // Fallback for unexpected errors
    setError(e.message || 'An unknown error occurred');
    console.error('Unexpected error:', e);
  }
}
```

**Visual Display:**
```tsx
{/* Error toast */}
{error && (
  <Toast 
    message={error} 
    onClose={() => {
      setError(null);
      setErrorSuggestions([]);
    }} 
  />
)}

{/* Suggestions panel */}
{errorSuggestions.length > 0 && error && (
  <div className="fixed top-20 right-4 bg-card border rounded-lg shadow-lg p-4 max-w-sm">
    <h3 className="font-semibold text-sm mb-2">💡 Suggestions:</h3>
    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
      {errorSuggestions.map((suggestion, index) => (
        <li key={index}>{suggestion}</li>
      ))}
    </ul>
  </div>
)}
```

## Testing Error Scenarios

### 1. File Too Large Error

**Test:**
```bash
# Create a file larger than 20MB
dd if=/dev/zero of=large_image.png bs=1M count=25
```

**Expected:**
- ❌ Error: "This file is too large. Maximum file size is 20.0 MB."
- 💡 Suggestions: "Compress the image" / "Use a smaller resolution" / "Try a different image file"

### 2. Invalid File Type Error

**Test:**
Upload a .txt, .pdf, or other non-image file

**Expected:**
- ❌ Error: "This file type is not supported."
- 💡 Suggestions: "Use PNG, JPEG, or WEBP images" / "Convert your file to a supported image format"

### 3. Corrupted File Error

**Test:**
```bash
# Create a corrupted image file
echo "not a real image" > corrupted.png
```

**Expected:**
- ❌ Error: "The image file appears to be corrupted or invalid."
- 💡 Suggestions: "Try opening the image in an image viewer" / "Try a different image file" / "Check if the file was downloaded completely"

### 4. No Text Found Error

**Test:**
Upload an image with no text (e.g., solid color, abstract art)

**Expected:**
- ❌ Error: "No text could be detected in this image."
- 💡 Suggestions: "Ensure the image contains readable text" / "Try a clearer image with higher contrast" / "Make sure text is not too small or blurry"

### 5. Low Quality Error

**Test:**
Upload a very blurry or low-resolution image with text

**Expected:**
- ❌ Error: "The text quality is too low for reliable extraction."
- 💡 Suggestions: "Try a higher resolution image" / "Ensure the image is in focus" / "Improve lighting and contrast" / "The image preprocessing may help"

### 6. Network Error

**Test:**
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Upload an image (the OCR engine is self-hosted, so this still works once the page has loaded)

**Expected:**
- ❌ Error: "Network connection error."
- 💡 Suggestions: "Check your internet connection" / "Try again in a moment" / "If the problem persists, check firewall settings"

### 7. Timeout Error

**Test:**
Upload a very large or complex image that takes too long to process

**Expected:**
- ❌ Error: "[Method] processing timed out after X seconds."
- 💡 Suggestions: "Try a smaller image" / "Try compressing the image" / "Close other browser tabs"

### 8. Out of Memory Error

**Test:**
1. Open many browser tabs
2. Upload a large high-resolution image

**Expected:**
- ❌ Error: "The browser ran out of memory while processing the image."
- 💡 Suggestions: "Try a smaller image" / "Close other browser tabs" / "Refresh the page and try again" / "Use a device with more available memory"

### 9. Engine files fail to load

**Test:**
1. Open DevTools → Network tab
2. Block requests to `/ocr/*` (the self-hosted Tesseract files)
3. Upload an image

**Expected:**
- ❌ A clear error that the OCR engine could not start, with a suggestion to reload the page

### 10. Processing Failed Error

**Test:**
This catches unexpected errors during OCR processing

**Expected:**
- ❌ Error: "Text extraction failed for [method]."
- 💡 Suggestions: "Try again" / "Try a different image format" / "Ensure the image is valid"

## Error Recovery Strategies

### Automatic Recovery

1. **Graceful Preprocessing Degradation:**
   - If preprocessing fails, use original image
   - Logs warning but continues processing

2. **Honest low confidence:**
   - Low confidence → the result is returned and flagged, never replaced by a different method

3. **Worker Cleanup:**
   - Always terminates Tesseract worker in finally block
   - Prevents memory leaks

### Manual Recovery (User Actions)

1. **Retry Operation:**
   - User can upload the same file again
   - May succeed on second attempt (network issues, etc.)

2. **File Modification:**
   - Compress large files
   - Convert to supported format
   - Enhance image quality

3. **Environment Changes:**
   - Check internet connection
   - Close other tabs (memory)
   - Try different browser
   - Wait for better network conditions

### Programmatic Recovery

```typescript
// Retry with exponential backoff
const result = await ErrorRecovery.retryWithBackoff(
  async () => {
    return await extractTextFromImage(file);
  },
  3,        // 3 attempts
  1000      // Start with 1s delay
);

// Timeout protection
const result = await ErrorRecovery.withTimeout(
  async () => {
    return await extractTextFromImage(file);
  },
  60000,    // 60 second timeout
  'OCR Processing'
);
```

## Validation Functions

### File Validation

```typescript
validateFile(file: File): void
```

**Checks:**
- ✅ File size ≤ 20MB
- ✅ File type is image/png, image/jpeg, or image/webp

**Throws:**
- `FILE_TOO_LARGE` if file exceeds limit
- `FILE_INVALID_TYPE` if unsupported format

### Browser Compatibility Check

```typescript
checkBrowserCompatibility(): void
```

**Checks:**
- ✅ FileReader API available
- ✅ Canvas API available
- ✅ URL.createObjectURL available

**Throws:**
- `BROWSER_NOT_SUPPORTED` if any required API is missing

## Best Practices

### 1. Always Validate Early

```typescript
// Validate file before any processing
try {
  validateFile(file);
} catch (error) {
  throw error instanceof OCRError ? error : ErrorFactory.fromError(error, 'validation');
}
```

### 2. Use Specific Error Types

```typescript
// Don't do this
throw new Error('Failed to process image');

// Do this
throw ErrorFactory.processingFailed('Tesseract', error);
```

### 3. Provide Context

```typescript
// Include operation context in errors
catch (error) {
  throw ErrorFactory.fromError(error, 'image preprocessing');
}
```

### 4. Clean Up Resources

```typescript
let worker = null;
try {
  worker = await createWorker();
  // ... processing
} finally {
  if (worker) {
    await worker.terminate();
  }
}
```

### 5. Log Technical Details

```typescript
if (error instanceof OCRError) {
  console.error('OCR Error:', {
    code: error.code,
    message: error.userMessage,
    technical: error.technicalDetails,
    recoverable: error.recoverable
  });
}
```

### 6. Handle Both OCRError and Generic Errors

```typescript
catch (e: any) {
  if (e instanceof OCRError) {
    // Handle structured error
    setError(e.userMessage);
    setErrorSuggestions(e.suggestions);
  } else {
    // Handle unexpected error
    setError(e.message || 'An unknown error occurred');
  }
}
```

## Error Message Examples

### User-Friendly Messages

| Error Code | User Message |
|-----------|--------------|
| FILE_TOO_LARGE | "This file is too large. Maximum file size is 20.0 MB." |
| FILE_INVALID_TYPE | "This file type is not supported. Please use PNG, JPEG, or WEBP images." |
| FILE_CORRUPTED | "The image file appears to be corrupted or invalid." |
| OCR_NO_TEXT_FOUND | "No text could be detected in this image." |
| OCR_LOW_QUALITY | "The text quality is too low for reliable extraction." |
| OCR_TIMEOUT | "Text extraction timed out after 60 seconds." |
| MODEL_LOAD_FAILED | "Failed to load the AI model. Please check your internet connection." |
| NETWORK_ERROR | "Network connection error. Please check your internet connection." |
| OUT_OF_MEMORY | "The browser ran out of memory while processing the image." |

### Technical Details (Logged)

Technical details are included in OCRError.technicalDetails and logged to console:
- Original error message
- Stack trace
- Operation context
- File details (name, size, type)

## Summary

The error handling system provides:

✅ **13 specific error types** with appropriate codes
✅ **User-friendly messages** that explain what went wrong
✅ **Actionable suggestions** for recovery
✅ **Automatic fallbacks** when possible
✅ **Retry mechanisms** with exponential backoff
✅ **Timeout protection** for long operations
✅ **Resource cleanup** to prevent memory leaks
✅ **Comprehensive logging** for debugging
✅ **UI integration** with error messages and suggestion panel

This creates a consistent error handling system that helps users understand and recover from issues.
