import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from '../AuroraBackground';
import { GlassDropzone } from './GlassDropzone';
import { GlassProgressBar } from './GlassProgressBar';
import { GlassResultCard } from './GlassResultCard';
import { HistoryDrawer } from './HistoryDrawer';
import { useOCRProcessor } from '../../hooks/useOCRProcessor';
import { useLocalHistory, type HistoryItem } from '../../hooks/useLocalHistory';
import { useShortcuts, getCommonShortcuts } from '../../hooks/useShortcuts';
import { useLiveRegion } from '../../hooks/useLiveRegion';
import { SEO, baseJsonLd } from '../SEO';
import { ROUTES } from '../../router';

interface HeroOCRProps {
  customHeading?: string;
  customSubheading?: string;
}

/**
 * Futuristic Hero + Tool UI (UX V3)
 * 
 * SOLID Refactored:
 * ✅ Single Responsibility: Composition only, delegates logic to hooks
 * ✅ Open/Closed: Accepts customHeading/customSubheading
 * ✅ Uses useTheme hook for theme management (SRP)
 * ✅ Uses useOCRProcessor hook for OCR logic (SRP)
 * ✅ Uses useLocalHistory hook for history management (SRP)
 * 
 * Premium features:
 * - Aurora background with animated gradients
 * - Glass-morphism cards with glow effects
 * - Trust chips (No signup, HTTPS, Fast)
 * - Centered hero layout
 * - Zero CLS: reserved heights
 * - < 200ms interactions
 */
export function HeroOCR({ customHeading, customSubheading }: HeroOCRProps = {}) {
  // Separate concerns into individual hooks (SRP)
  const {
    imageFile,
    extractedText,
    isProcessing,
    error,
    progressStage,
    progressRef,
    handleFileSelect,
    setExtractedText,
    setError,
    clear: handleClear,
  } = useOCRProcessor();
  const { history, removeFromHistory, clearHistory } = useLocalHistory();

  // Accessibility: Screen reader announcements for OCR status
  const announceStatus = useLiveRegion('polite');

  // Local UI state only
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Announce OCR status changes to screen readers
  useEffect(() => {
    if (isProcessing) {
      announceStatus('Processing image, please wait...');
    } else if (extractedText && !error) {
      const wordCount = extractedText.trim().split(/\s+/).filter(Boolean).length;
      announceStatus(`Text extraction complete. ${wordCount} words extracted.`);
    } else if (error) {
      announceStatus(`Error: ${error}`);
    } else {
      announceStatus('Ready for image upload');
    }
  }, [isProcessing, extractedText, error, announceStatus]);

  // Handle restoring from history
  const handleRestore = useCallback((item: HistoryItem) => {
    // Directly set the extracted text instead of creating a fake file
    if (extractedText !== item.text) {
      setExtractedText(item.text);
    }
  }, [extractedText, setExtractedText]);

  // Copy text to clipboard (shortcut)
  const handleCopyShortcut = useCallback(async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [extractedText]);

  // Download text file (shortcut)
  const handleDownloadShortcut = useCallback(() => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = imageFile?.name.replace(/\.[^/.]+$/, '') + '-extracted.txt' || 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [extractedText, imageFile]);

  // Setup keyboard shortcuts
  const shortcuts = getCommonShortcuts({
    onCopy: extractedText ? handleCopyShortcut : undefined,
    onDownload: extractedText ? handleDownloadShortcut : undefined,
    onViewHistory: () => setIsHistoryOpen(true),
    onClear: extractedText ? handleClear : undefined,
  });

  useShortcuts(shortcuts, true);

  return (
    <AuroraBackground>
      <SEO
        title="Free Online Image to Text Converter - OCR Tool"
        description="Extract text from images instantly with our free OCR tool. Supports PNG, JPG, and WEBP. No signup required. Fast, secure, and accurate text extraction."
        canonical="https://freetextfromimage.com/"
        keywords="image to text, OCR, extract text from image, online OCR, free text extraction"
        jsonLd={baseJsonLd}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={handleRestore}
        onClearHistory={clearHistory}
        onRemoveItem={removeFromHistory}
      />

      {/* Hero Section */}
      <section id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20" aria-label="Main content">
        <div className="max-w-4xl mx-auto">
          {/* Hero text */}
          <motion.div
            className="text-center mb-12 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              {customHeading || (
                <>
                  Verify what <span className="bg-gradient-to-r from-accent via-accent-2 to-primary bg-clip-text text-transparent">AI-generated UI</span> actually shows
                </>
              )}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {customSubheading ||
                'RenderCheck uses privacy-first OCR to test screenshots, documents, and rendered interfaces — helping teams catch visible text failures that DOM checks and code reviews miss.'}
            </p>
          </motion.div>

          {/* 4-Step Visual Flow */}
          <motion.div
            className="mb-12 p-6 sm:p-8 rounded-2xl bg-surface/40 backdrop-blur-xl border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-accent mb-2">1</div>
                <p className="text-sm text-muted-foreground">Take screenshot</p>
              </div>
              <div className="hidden sm:block text-2xl text-muted-foreground/40">→</div>
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-accent mb-2">2</div>
                <p className="text-sm text-muted-foreground">Pass to verify()</p>
              </div>
              <div className="hidden sm:block text-2xl text-muted-foreground/40">→</div>
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-accent mb-2">3</div>
                <p className="text-sm text-muted-foreground">Get results</p>
              </div>
              <div className="hidden sm:block text-2xl text-muted-foreground/40">→</div>
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-accent mb-2">4</div>
                <p className="text-sm text-muted-foreground">Assert in test</p>
              </div>
            </div>
          </motion.div>

          {/* Glass card with Dropzone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
            data-dropzone-scroll
          >
            <div className="relative rounded-2xl bg-surface/40 backdrop-blur-xl border border-white/10 shadow-glow p-6 sm:p-8">
              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/10 via-transparent to-accent-2/10 pointer-events-none" />

              <div className="relative">
                <GlassDropzone
                  onFileSelect={handleFileSelect}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                  onError={(message) => setError(message)}
                />
              </div>
            </div>
          </motion.div>

          {/* Trust chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-8"
          >
            {[
              { icon: '🔒', text: 'Browser OCR runs locally' },
              { icon: '🔐', text: 'No image or text persistence' },
              { icon: '🛡️', text: 'HTTPS only' },
              { icon: '⌨️', text: 'Keyboard accessible' },
            ].map((chip, index) => (
              <motion.div
                key={chip.text}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface/60 backdrop-blur border border-border/50 text-sm text-muted-foreground"
              >
                <span className="text-base">{chip.icon}</span>
                <span className="font-medium">{chip.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8 items-center"
          >
            <button
              onClick={() => {
                const dropzone = document.querySelector('[data-dropzone-scroll]');
                dropzone?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-[hsl(220_89%_35%)] transition-colors"
            >
              Try RenderCheck
            </button>
            <a
              href={ROUTES.VERIFY_DEBT_SCORE}
              className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
            >
              Take Verification Debt Score
            </a>
            <a
              href={ROUTES.LABS}
              className="px-6 py-3 text-foreground hover:bg-muted/50 rounded-lg font-medium transition-colors"
            >
              Explore Labs
            </a>
          </motion.div>

          {/* Progress Bar */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <GlassProgressBar ref={progressRef} stage={progressStage} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Card - Reserve min-height to prevent CLS */}
          <div className="mt-8" style={{ minHeight: extractedText ? '400px' : '0px' }}>
            {extractedText && !isProcessing && (
              <GlassResultCard
                text={extractedText}
                filename={imageFile?.name.replace(/\.[^/.]+$/, '') + '-extracted.txt' || 'extracted-text.txt'}
              />
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 p-4 rounded-xl bg-destructive/10 border border-destructive/50 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </AuroraBackground>
  );
}
