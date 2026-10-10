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
      {/* A page that supplies its own heading (IntentPage) also supplies its own SEO; this default must not override it. */}
      {!customHeading && (
        <SEO
          title="Free Online Image to Text Converter - OCR Tool"
          description="Extract text from images instantly with our free OCR tool. Supports PNG, JPG, and WEBP. No signup required. Fast, secure, and accurate text extraction."
          canonical="https://freetextfromimage.com/"
          keywords="image to text, OCR, extract text from image, online OCR, free text extraction"
          jsonLd={baseJsonLd}
        />
      )}

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
      <section id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-20 pb-12 sm:pb-16 lg:pb-24" aria-label="Main content">
        <div className="max-w-5xl mx-auto">
          {/* Hero text - Large and bold */}
          <motion.div
            className="text-center mb-16 space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              {customHeading || (
                <>
                  Verify what{' '}
                  <span className="bg-gradient-to-r from-accent via-accent-2 to-primary bg-clip-text text-transparent relative inline-block">
                    AI-generated UI
                  </span>
                  {' '}actually shows
                </>
              )}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              {customSubheading ||
                'RenderCheck uses privacy-first OCR to test screenshots and rendered interfaces, catching visible text failures that DOM checks miss.'}
            </p>
          </motion.div>

          {/* 4-Step Visual Flow - Enhanced */}
          <motion.div
            className="mb-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent-2/5 border border-primary/10 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
              {[
                { num: '1', label: 'Screenshot', icon: '📸' },
                { num: '2', label: 'toShowText()', icon: '✓' },
                { num: '3', label: 'Results', icon: '📊' },
                { num: '4', label: 'Assert', icon: '🎯' },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  className="flex flex-col items-center flex-1"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3 shadow-elevation-2">
                    <span className="text-2xl sm:text-3xl font-bold text-white">{step.num}</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">{step.label}</p>
                </motion.div>
              ))}
              {/* Arrows */}
              {[0, 1, 2].map((idx) => (
                <div key={`arrow-${idx}`} className="hidden sm:block absolute left-0 w-full pointer-events-none" style={{ top: '50%' }}>
                  <div className="absolute inset-0 flex items-center justify-center" style={{ left: `${20 + idx * 25}%` }}>
                    <div className="text-2xl text-primary/30">→</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Glass card with Dropzone - Premium */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="mb-12"
            data-dropzone-scroll
          >
            <div className="relative rounded-3xl bg-gradient-to-br from-surface via-surface to-surface/80 backdrop-blur-2xl border border-primary/10 shadow-glow-lg p-8 sm:p-12 lg:p-16">
              {/* Animated glow background */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent-2/5 pointer-events-none" />
              <div className="absolute -inset-1 rounded-3xl blur-2xl bg-gradient-to-r from-primary/10 via-transparent to-accent-2/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

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
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
          >
            {[
              { icon: '🔒', text: 'Browser OCR runs locally' },
              { icon: '🔐', text: 'No persistence' },
              { icon: '🛡️', text: 'HTTPS only' },
              { icon: '⌨️', text: 'Keyboard accessible' },
            ].map((chip, index) => (
              <motion.div
                key={chip.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface border border-border/60 backdrop-blur-sm text-sm text-muted-foreground hover:border-primary/30 transition-all shadow-card"
              >
                <span className="text-base">{chip.icon}</span>
                <span className="font-medium whitespace-nowrap">{chip.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs - Premium Styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12 items-center"
          >
            <button
              onClick={() => {
                const dropzone = document.querySelector('[data-dropzone-scroll]');
                dropzone?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-semibold hover:shadow-elevation-3 hover:scale-105 transition-all duration-200 shadow-elevation-2"
            >
              Try RenderCheck
            </button>
            <a
              href={ROUTES.VERIFY_DEBT_SCORE}
              className="px-8 py-4 border-2 border-primary text-primary rounded-2xl font-semibold hover:bg-primary/5 hover:scale-105 transition-all duration-200 shadow-card"
            >
              Take Verification Debt Score
            </a>
            <a
              href={ROUTES.LABS}
              className="px-8 py-4 text-foreground hover:bg-muted/60 rounded-2xl font-semibold transition-all duration-200 hover:scale-105"
            >
              Explore Labs →
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
