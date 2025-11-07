import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CopyIcon } from '../icons/CopyIcon';
import { DownloadIcon } from '../icons/DownloadIcon';

interface GlassResultCardProps {
  text: string;
  onCopy?: () => void;
  onDownload?: () => void;
  filename?: string;
}

/**
 * Premium glass result card with:
 * - Glass morphism styling
 * - Copy button with confetti micro-interaction (6-8 CSS dots)
 * - Download button
 * - Non-blocking toast notification
 * - < 200ms interactions
 * - Zero CLS: reserved height
 */
export function GlassResultCard({ text, onCopy, onDownload, filename = 'extracted-text.txt' }: GlassResultCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Trigger confetti
      if (!shouldReduceMotion) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 600);
      }

      // Show toast
      setToastMessage('Copied to clipboard');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

      onCopy?.();
    } catch (err) {
      setToastMessage('Failed to copy');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      console.error('Copy failed:', err);
    }
  }, [text, onCopy, shouldReduceMotion]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMessage('Downloaded');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    onDownload?.();
  }, [text, filename, onDownload]);

  const characterCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-2xl bg-surface/40 backdrop-blur-xl border border-white/10 shadow-glow-sm overflow-hidden"
        style={{ minHeight: '400px' }} // Reserve height to prevent CLS
      >
        {/* Inner glow gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-2/5 pointer-events-none" />

        {/* Header */}
        <div className="relative border-b border-border/50 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Extracted Text</h3>
              <p className="text-xs text-muted-foreground">
                {wordCount} words · {characterCount} characters
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleCopy}
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/20 hover:border-accent/40 text-accent transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Copy text to clipboard"
              >
                <CopyIcon className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium hidden sm:inline">Copy</span>

                {/* CSS Confetti dots */}
                {showConfetti && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                          background: [
                            'hsl(var(--accent))',
                            'hsl(var(--accent-2))',
                            'hsl(var(--primary))',
                            '#10b981',
                            '#f59e0b',
                            '#ef4444',
                            '#8b5cf6',
                            '#ec4899',
                          ][i],
                        }}
                        initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: 0,
                          scale: 1,
                          x: Math.cos((i / 8) * Math.PI * 2) * 40,
                          y: Math.sin((i / 8) * Math.PI * 2) * 40,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: 'easeOut',
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.button>

              <motion.button
                onClick={handleDownload}
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface/60 hover:bg-surface/80 border border-border/50 hover:border-border text-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Download text file"
              >
                <DownloadIcon className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium hidden sm:inline">Download</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-6">
          <pre className="whitespace-pre-wrap text-sm text-foreground font-mono bg-background/50 p-4 rounded-lg border border-border/50 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {text}
          </pre>
        </div>
      </motion.div>

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-surface/90 backdrop-blur-xl border border-border/50 shadow-glow-sm text-sm font-medium text-foreground"
            role="status"
            aria-live="polite"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
