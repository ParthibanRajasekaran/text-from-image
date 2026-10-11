import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CopyIcon } from '../icons/CopyIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { trackCopyClicked, trackDownloadClicked } from '../../lib/analytics';

interface GlassResultCardProps {
  text: string;
  onCopy?: () => void;
  onDownload?: () => void;
  filename?: string;
}

/**
 * Premium glass result card with:
 * - Glass morphism styling
 * - Copy button, download button, Text/JSON view
 * - One horizontal scan sweep when the result appears (skipped for reduced motion)
 * - Download button
 * - Non-blocking toast notification
 * - < 200ms interactions
 * - Zero CLS: reserved height
 */
export function GlassResultCard({ text, onCopy, onDownload, filename = 'extracted-text.txt' }: GlassResultCardProps) {
  const [view, setView] = useState<'text' | 'json'>('text');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Track copy event
      trackCopyClicked({
        contentType: 'text',
      });
      
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
  }, [text, onCopy]);

  const handleDownload = useCallback(() => {
    // Track download event
    trackDownloadClicked({
      format: 'txt',
      contentType: 'text',
    });

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

  const jsonOutput = JSON.stringify(
    { file: filename, words: text.trim().split(/\s+/).filter(Boolean).length, characters: text.length, text },
    null,
    2
  );
  const characterCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-2xl bg-surface border border-border overflow-hidden"
        style={{ minHeight: '400px' }} // Reserve height to prevent CLS
      >

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
          <div role="tablist" aria-label="Output format" className="mb-3 inline-flex rounded-full border border-border p-0.5 text-xs font-medium">
            {(['text', 'json'] as const).map((v) => (
              <button
                key={v}
                role="tab"
                type="button"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded-full px-3.5 py-1 transition-colors ${
                  view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v === 'text' ? 'Text' : 'JSON'}
              </button>
            ))}
          </div>
          <div className="relative">
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll long output */}
            <pre tabIndex={0} aria-label={view === 'text' ? 'Extracted text' : 'Extracted text as JSON'} className="whitespace-pre-wrap break-words text-sm text-foreground font-mono bg-background p-4 rounded-lg border border-border max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {view === 'text' ? text : jsonOutput}
            </pre>
            {!shouldReduceMotion && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-foreground"
                initial={{ top: '0%', opacity: 1 }}
                animate={{ top: '100%', opacity: [1, 1, 0] }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
              />
            )}
          </div>
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-surface border border-border text-sm font-medium text-foreground"
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
