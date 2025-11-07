import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AuroraBackground } from '../AuroraBackground';
import { GlassDropzone } from './GlassDropzone';
import { GlassProgressBar, ProgressStage, GlassProgressBarHandle } from './GlassProgressBar';
import { GlassResultCard } from './GlassResultCard';
import { HistoryDrawer } from './HistoryDrawer';
import { ThemeToggle } from '../ThemeToggle';
import { extractTextWithDetails } from '../../services/hybridService';
import { useLocalHistory } from '../../hooks/useLocalHistory';
import { useShortcuts, getCommonShortcuts } from '../../hooks/useShortcuts';

type Theme = 'light' | 'dark';

interface HeroOCRProps {
  customHeading?: string;
  customSubheading?: string;
}

/**
 * Futuristic Hero + Tool UI (UX V3)
 * Feature-gated with VITE_UX_V2 === '1'
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
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme | null;
      if (storedTheme) return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState<ProgressStage>('idle');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const progressRef = useRef<GlassProgressBarHandle>(null);
  const shouldReduceMotion = useReducedMotion();

  // Local history hook
  const { history, addToHistory, removeFromHistory, clearHistory } = useLocalHistory();

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Handle restoring from history
  const handleRestore = useCallback((item: typeof history[0]) => {
    setExtractedText(item.text);
    setImageFile(null); // Clear current file since we're restoring
    setError(null);
    setProgressStage('complete');
  }, []);

  // Clear result
  const handleClear = useCallback(() => {
    setExtractedText('');
    setImageFile(null);
    setError(null);
    setProgressStage('idle');
  }, []);

  // Copy text to clipboard
  const handleCopyShortcut = useCallback(async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [extractedText]);

  // Download text file
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

  // Keyboard shortcuts
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

  // Handle file upload with staged progress
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
        minConfidence: 60,
        minTextLength: 3,
      });

      // Stage 3: Render
      setProgressStage('render');
      await new Promise(resolve => setTimeout(resolve, 200));

      // Complete
      setProgressStage('complete');
      setExtractedText(result.text);
      
      // Add to history
      addToHistory({
        filename: file.name,
        text: result.text,
      });
      
      // Announce completion
      progressRef.current?.announce('Text extraction completed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to extract text');
      setProgressStage('idle');
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [addToHistory]);

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
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 rounded-xl bg-destructive/10 border border-destructive/50 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}
        </div>
      </main>
    </AuroraBackground>
  );
}
