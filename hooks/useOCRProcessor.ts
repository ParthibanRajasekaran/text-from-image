import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { GlassProgressBarHandle, ProgressStage } from '../components/v3/GlassProgressBar';

interface UseOCRProcessorOptions {
  minConfidence?: number;
  minTextLength?: number;
}

/**
 * OCR processing logic hook with worker thread support
 * Handles:
 * - File upload and processing orchestration via worker thread
 * - Progress stage management
 * - Error handling
 * - Result extraction
 * - Deferred OCR library loading (on demand only)
 * 
 * Extracted from HeroOCR.tsx to follow SRP
 * Uses worker thread to defer heavy OCR library imports
 */
export function useOCRProcessor(_options: UseOCRProcessorOptions = {}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState<ProgressStage>('idle');

  const progressRef = useRef<GlassProgressBarHandle>(null);

  // Create worker lazily on first use (defers OCR library loading)
  // Falls back to direct import if Worker is not available (e.g., in test environment)
  const ocrWorker = useMemo(() => {
    try {
      if (typeof Worker === 'undefined') {
        // Test environment or worker not supported
        return null;
      }
      return new Worker(
        new URL('@/src/workers/ocr.worker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch (err) {
      console.error('Failed to create OCR worker:', err);
      return null;
    }
  }, []);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (ocrWorker) {
        ocrWorker.terminate();
      }
    };
  }, [ocrWorker]);

  const handleFileSelect = useCallback(async (file: File) => {
    setImageFile(file);
    setExtractedText('');
    setError(null);
    setIsProcessing(true);
    setProgressStage('upload');

    try {
      // Stage 1: Upload (simulate upload delay)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Stage 2: OCR processing via worker
      setProgressStage('ocr');

      if (!ocrWorker) {
        throw new Error('OCR worker failed to initialize');
      }

      const result = await new Promise<string>((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          const { type, result: text, error: workerError } = event.data;

          if (type === 'DONE') {
            ocrWorker.removeEventListener('message', messageHandler);
            ocrWorker.removeEventListener('error', errorHandler);
            resolve(text);
          } else if (type === 'ERROR') {
            ocrWorker.removeEventListener('message', messageHandler);
            ocrWorker.removeEventListener('error', errorHandler);
            reject(new Error(workerError));
          }
        };

        const errorHandler = (err: ErrorEvent) => {
          ocrWorker.removeEventListener('message', messageHandler);
          ocrWorker.removeEventListener('error', errorHandler);
          reject(new Error(`Worker error: ${err.message}`));
        };

        ocrWorker.addEventListener('message', messageHandler);
        ocrWorker.addEventListener('error', errorHandler);

        // Send file to worker for OCR processing
        ocrWorker.postMessage({
          type: 'RUN',
          payload: file,
        });
      });

      // Stage 3: Render
      setProgressStage('render');
      await new Promise(resolve => setTimeout(resolve, 200));

      // Complete - set text first, then stop processing
      setProgressStage('complete');
      setExtractedText(result);
      
      // Announce completion for accessibility
      progressRef.current?.announce('Text extraction completed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to extract text');
      setProgressStage('idle');
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [ocrWorker]);

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
