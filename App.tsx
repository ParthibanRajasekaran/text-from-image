/**
 * @deprecated App is deprecated. Use HeroOCR from components/v3/HeroOCR.tsx instead.
 * This component is only used when VITE_UX_V2 is disabled (legacy UI).
 * Will be removed in v2.x. See docs/DEPRECATED.md for migration guide.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FileInput } from './components/FileInput';
import { Dropzone } from './components/Dropzone';
import { ResultToolbar } from './components/ResultToolbar';
import { ThemeToggle } from './components/ThemeToggle';
import { HistoryDrawer } from './components/HistoryDrawer';
import { extractTextWithDetails } from './services/hybridService';
import { ProgressBar, ProgressStage } from './components/ProgressBar';
import { OCRError } from './utils/errorHandling';
import { useLocalHistory } from './hooks/useLocalHistory';
import { useShortcuts, getCommonShortcuts } from './hooks/useShortcuts';
import { useLiveRegion } from './hooks/useLiveRegion';
import { isUXV2Enabled } from './utils/env';
import { COMMIT } from './lib/version';
import { AutoAds } from './src/ads/AutoAds';

function App() {
  // Accessibility: Add skip link and enhanced error handling
  const handleError = useCallback((e: any) => {
    if (e instanceof OCRError) {
      setError(e.userMessage);
      console.error('OCR Error Details:', {
        code: e.code,
        message: e.userMessage,
        technical: e.technicalDetails,
        recoverable: e.recoverable,
        bothMethodsAttempted: e.technicalDetails?.bothMethodsAttempted || false,
      });
      if (e.technicalDetails?.bothMethodsAttempted) {
        console.warn('⚠️ Both OCR methods were attempted but failed:');
        console.warn('  1. Fast OCR (Tesseract):', e.technicalDetails.tesseractError);
        console.warn('  2. AI Model (Transformers):', e.technicalDetails.transformersError);
      }
    } else {
      setError('An unexpected error occurred during text extraction. Please try again or reload the page.');
      console.error('Unexpected error:', e);
    }
  }, []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [methodUsed, setMethodUsed] = useState<string>('');
  const [progressStage, setProgressStage] = useState<ProgressStage>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const useEnhancedUI = isUXV2Enabled();
  const { history, addToHistory, removeFromHistory, clearHistory } = useLocalHistory();
  const announceStatus = useLiveRegion('polite');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme) return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const shortcuts = getCommonShortcuts({
    onCopy: extractedText ? async () => {
      await navigator.clipboard.writeText(extractedText);
    } : undefined,
    onDownload: extractedText ? () => {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = imageFile?.name?.replace(/\.[^/.]+$/, '.txt') || 'extracted-text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } : undefined,
    onViewHistory: () => setIsHistoryOpen(true),
    onClear: extractedText ? () => {
      setImageFile(null);
      setExtractedText('');
      setError(null);
      setHasProcessed(false);
    } : undefined,
  });

  useShortcuts(shortcuts, useEnhancedUI);

  useEffect(() => {
    if (isLoading) {
      announceStatus('Processing image, please wait...');
    } else if (hasProcessed && extractedText) {
      const wordCount = extractedText.trim().split(/\s+/).filter(Boolean).length;
      announceStatus(`Text extraction complete. ${wordCount} words extracted.`);
    } else if (error) {
      announceStatus(`Error: ${error}`);
    }
  }, [isLoading, hasProcessed, extractedText, error, announceStatus]);

  const handleFileChange = useCallback(async (file: File | null) => {
    setImageFile(file);
    setExtractedText('');
    setError(null);
    setHasProcessed(false);
    setProcessingStatus('');
    setMethodUsed('');

    if (file) {
      setIsLoading(true);
      setProgressStage('upload');
      setProgressPercent(0);
      try {
        const result = await extractTextWithDetails(file, {
          minConfidence: 60,
          minTextLength: 3,
          onProgress: (status, progress) => {
            const progressPercent = Math.round(progress);
            if (status.includes('Processing')) {
              setProgressStage('ocr');
            } else if (status.includes('Rendering')) {
              setProgressStage('render');
            }
            setProgressPercent(progressPercent);
            if (status.includes('fallback') || status.includes('trying AI')) {
              setProcessingStatus(`⚡ Trying advanced AI method... (${progressPercent}%)`);
            } else if (status.includes('failed')) {
              setProcessingStatus(`🔄 ${status}`);
            } else {
              setProcessingStatus(`${status} (${progressPercent}%)`);
            }
          },
        });
        setExtractedText(result.text);
        setProgressStage('complete');
        setProgressPercent(100);
        const methodLabel = result.method === 'tesseract' ? '⚡ Fast OCR (Tesseract)' : '🤖 AI Model (Transformers)';
        const fallbackNote = result.fallbackUsed ? ' - Used advanced AI after initial attempt' : '';
        setMethodUsed(`Extracted using ${methodLabel}${fallbackNote}`);
        if (result.confidence) {
          setMethodUsed(prev => `${prev} • Confidence: ${Math.round(result.confidence!)}%`);
        }
        if (useEnhancedUI && result.text) {
          addToHistory({
            filename: file.name,
            text: result.text,
            method: result.method,
            confidence: result.confidence,
          });
        }
      } catch (e: any) {
        setProgressStage('error');
        handleError(e);
      } finally {
        setIsLoading(false);
        setHasProcessed(true);
        setProcessingStatus('');
        setTimeout(() => {
          setProgressStage('idle');
          setProgressPercent(0);
        }, 1000);
      }
    }
  }, [useEnhancedUI, addToHistory, handleError]);

  return (
    <div className={useEnhancedUI ? 'uxv2' : ''}>
      {/* Accessibility skip link for main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <AutoAds />
      <header className="py-4 px-6 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="container mx-auto grid grid-cols-3 items-center">
          <div aria-hidden="true" /> {/* Empty cell for spacing */}
          <h1 className="text-2xl font-bold text-primary text-center">Extract Text from Image for Free</h1>
          <div className="flex justify-end">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
        {/* Guides nav section - compact, collapses to dropdown on small screens */}
        <nav aria-label="Guides" className="mt-2 flex justify-center gap-4 text-sm">
          <div className="hidden sm:flex gap-3">
            <a href="/image-to-text" className="hover:underline">Image to Text</a>
            <a href="/extract-text-from-image" className="hover:underline">Extract Text from Image</a>
            <a href="/copy-text-from-image" className="hover:underline">Copy Text from Image</a>
            <a href="/jpg-to-word" className="hover:underline">JPG to Word</a>
            <a href="/jpg-to-excel" className="hover:underline">JPG to Excel</a>
          </div>
          <div className="sm:hidden relative">
            <details className="inline-block">
              <summary className="cursor-pointer px-3 py-1 rounded bg-muted text-foreground hover:bg-muted/80 focus:outline-none">Guides</summary>
              <div className="absolute left-0 mt-2 w-40 rounded shadow-lg bg-popover z-20 border border-border">
                <a href="/image-to-text" className="block px-4 py-2 hover:bg-muted">Image to Text</a>
                <a href="/extract-text-from-image" className="block px-4 py-2 hover:bg-muted">Extract Text from Image</a>
                <a href="/copy-text-from-image" className="block px-4 py-2 hover:bg-muted">Copy Text from Image</a>
                <a href="/jpg-to-word" className="block px-4 py-2 hover:bg-muted">JPG to Word</a>
                <a href="/jpg-to-excel" className="block px-4 py-2 hover:bg-muted">JPG to Excel</a>
              </div>
            </details>
          </div>
        </nav>
      </header>
      <main id="main-content" className="container mx-auto p-4 md:p-8" tabIndex={-1} aria-label="Main content">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-xl font-semibold">1. Upload Image</h2>
              {useEnhancedUI && history.length > 0 && (
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
                  aria-label="View history"
                >
                  History ({history.length})
                </button>
              )}
            </div>
            <p className="text-muted-foreground">
              Select an image file (PNG, JPG, WEBP) to extract text. We'll automatically use the best method for your image.
            </p>
            {useEnhancedUI ? (
              <Dropzone 
                onFiles={(files) => files[0] && handleFileChange(files[0])}
                disabled={isLoading}
                accept="image/*"
                maxFiles={1}
              />
            ) : (
              <FileInput 
                onFileChange={handleFileChange} 
                imageFile={imageFile}
                isLoading={isLoading}
              />
            )}
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-center">2. Extracted Text</h2>
            <div className="min-h-[400px] bg-card p-4 rounded-lg border border-border flex justify-center items-center">
              {isLoading ? (
                <div className="w-full max-w-md flex flex-col items-center gap-4">
                  <p className="text-foreground font-medium text-center">
                    {processingStatus || 'Analyzing your image...'}
                  </p>
                  {useEnhancedUI ? (
                    <ProgressBar 
                      stage={progressStage}
                      percent={progressPercent}
                      message={processingStatus}
                    />
                  ) : (
                    <ProgressBar />
                  )}
                  {processingStatus.includes('AI') && (
                    <p className="text-xs text-muted-foreground text-center italic mt-2">
                      ℹ️ Using advanced AI for better accuracy (this may take a moment)
                    </p>
                  )}
                </div>
              ) : !hasProcessed ? (
                <p className="text-muted-foreground text-center">Extracted text will appear here once an image is processed.</p>
              ) : extractedText ? (
                <div className="w-full flex flex-col gap-4">
                  {useEnhancedUI && (
                    <ResultToolbar 
                      text={extractedText}
                      onCopy={() => {}}
                      onDownload={() => {}}
                    />
                  )}
                  {/* <ResultDisplay text={extractedText} originalFilename={imageFile?.name || 'extracted-text.txt'} /> */}
                  {methodUsed && (
                    <p className="text-xs text-muted-foreground text-center italic">
                      {methodUsed}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">No text could be extracted from the image.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* History drawer (UX v2 only) */}
      {useEnhancedUI && (
        <HistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelectEntry={(entry) => {
            setExtractedText(entry.text);
            setMethodUsed(entry.method ? `Extracted using ${entry.method}` : '');
            setHasProcessed(true);
            setIsHistoryOpen(false);
          }}
          onRemoveEntry={removeFromHistory}
          onClearAll={() => {
            clearHistory();
            setIsHistoryOpen(false);
          }}
        />
      )}
      {/* Footer with version info for deployment verification */}
      <footer className="py-4 px-6 border-t border-border mt-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-muted-foreground">
          {/* Resources column */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-foreground">Resources</h3>
            <nav aria-label="Resources" className="flex flex-col gap-1">
              <a href="/image-to-text" className="hover:underline">Image to Text</a>
              <a href="/extract-text-from-image" className="hover:underline">Extract Text from Image</a>
              <a href="/copy-text-from-image" className="hover:underline">Copy Text from Image</a>
              <a href="/jpg-to-word" className="hover:underline">JPG to Word</a>
              <a href="/jpg-to-excel" className="hover:underline">JPG to Excel</a>
            </nav>
          </div>
          {/* Legal column */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-foreground">Legal</h3>
            <nav aria-label="Legal" className="flex flex-col gap-1">
              <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
              <a href="/terms" className="hover:underline">Terms</a>
              <a href="/about" className="hover:underline">About</a>
              <a href="/contact" className="hover:underline" rel="nofollow">Contact</a>
            </nav>
          </div>
          <div className="md:col-span-2 text-center mt-4">
            <p>
              &copy; {new Date().getFullYear()} Extract Text From Image &mdash; Made with &hearts; for privacy
              {COMMIT !== 'dev' && (
                <span className="ml-2 opacity-50" title="Deployment version">
                  v{COMMIT}
                </span>
              )}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;