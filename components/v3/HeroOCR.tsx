import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from '../AuroraBackground';
import { GlassDropzone } from './GlassDropzone';
import { GlassProgressBar } from './GlassProgressBar';
import { GlassResultCard } from './GlassResultCard';
import { HistoryDrawer } from './HistoryDrawer';
import { ThemeToggle } from '../ThemeToggle';
import { useTheme } from '../../hooks/useTheme';
import { useOCRProcessor } from '../../hooks/useOCRProcessor';
import { useLocalHistory, type HistoryItem } from '../../hooks/useLocalHistory';
import { useShortcuts, getCommonShortcuts } from '../../hooks/useShortcuts';

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
  const { theme, toggleTheme } = useTheme();
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
  
  // Local UI state only
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  // Add theme toggle shortcut (T key)
  const allShortcuts = [
    ...shortcuts,
    {
      key: 't',
      action: toggleTheme,
      description: 'Toggle theme',
      disabled: false,
    },
  ];

  useShortcuts(allShortcuts, true);

  return (
    <AuroraBackground>
      {/* Skip to main content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-white focus:shadow-glow focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-accent via-primary to-accent-2 bg-clip-text text-transparent">
                TextFromImage
              </h1>
            </motion.div>
            <div className="flex items-center gap-2">
              {/* History button */}
              {history.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setIsHistoryOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-surface/60 hover:bg-surface/80 border border-border/50 hover:border-border text-sm font-medium text-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  aria-label="View history"
                >
                  <span className="hidden sm:inline">History</span>
                  <span className="sm:hidden">📚</span>
                  {history.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                      {history.length}
                    </span>
                  )}
                </motion.button>
              )}
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
          </div>
        </div>
      </header>

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
      <main id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
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
                  Image → <span className="bg-gradient-to-r from-accent via-accent-2 to-primary bg-clip-text text-transparent">Text</span>, instantly.
                </>
              )}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {customSubheading || 'AI-powered OCR that respects your privacy. Extract text from images in seconds, no signup required.'}
            </p>
          </motion.div>

          {/* Glass card with Dropzone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
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
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {[
              { icon: '🔒', text: 'No signup required' },
              { icon: '⚡', text: 'Lightning fast' },
              { icon: '🛡️', text: 'HTTPS secure' },
              { icon: '🎯', text: 'AI-powered' },
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
      </main>
    </AuroraBackground>
  );
}
