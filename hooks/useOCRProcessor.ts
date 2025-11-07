import { useState, useCallback, useRef } from 'react';
import { extractTextWithDetails } from '../services/hybridService';
import type { GlassProgressBarHandle, ProgressStage } from '../components/v3/GlassProgressBar';

interface UseOCRProcessorOptions {
  minConfidence?: number;
  minTextLength?: number;
}

/**
 * OCR processing logic hook
 * Handles:
 * - File upload and processing orchestration
 * - Progress stage management
 * - Error handling
 * - Result extraction
 * 
 * Extracted from HeroOCR.tsx to follow SRP
 * Separated from UI rendering concerns
 */
export function useOCRProcessor(options: UseOCRProcessorOptions = {}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState<ProgressStage>('idle');

  const progressRef = useRef<GlassProgressBarHandle>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setImageFile(file);
    setExtractedText('');
    setError(null);
    setIsProcessing(true);
    setProgressStage('upload');

    try {
      // Stage 1: Upload (simulate upload delay)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Stage 2: OCR processing
      setProgressStage('ocr');
      const result = await extractTextWithDetails(file, {
        minConfidence: options.minConfidence ?? 60,
        minTextLength: options.minTextLength ?? 3,
      });

      // Stage 3: Render
      setProgressStage('render');
      await new Promise(resolve => setTimeout(resolve, 200));

      // Complete - set text first, then stop processing
      setProgressStage('complete');
      setExtractedText(result.text);
      
      // Announce completion for accessibility
      progressRef.current?.announce('Text extraction completed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to extract text');
      setProgressStage('idle');
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [options.minConfidence, options.minTextLength]);

  const clear = useCallback(() => {
    setImageFile(null);
    setExtractedText('');
    setError(null);
    setProgressStage('idle');
  }, []);

  return {
    // State
    imageFile,
    extractedText,
    isProcessing,
    error,
    progressStage,
    progressRef,
    
    // Actions
    handleFileSelect,
    setExtractedText,
    setImageFile,
    setError,
    setProgressStage,
    clear,
  };
}
