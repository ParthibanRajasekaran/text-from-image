import React, { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CopyIcon } from '../icons/CopyIcon';
import { DownloadIcon } from '../icons/DownloadIcon';

interface ResultToolbarProps {
  text: string;
  filename?: string;
  onCopy?: () => void;
  onDownload?: () => void;
}

/**
 * Accessible toolbar for result actions
 * - Keyboard accessible
 * - Visual feedback with minimal animations
 * - ARIA labels and live regions
 */
export function ResultToolbar({
  text,
  filename = 'extracted-text.txt',
  onCopy,
  onDownload,
}: ResultToolbarProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      onCopy?.();
      
      setTimeout(() => setCopySuccess(false), 2000);
      
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = 'Text copied to clipboard';
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, [text, onCopy]);

  const handleDownload = useCallback(() => {
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onDownload?.();
      
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = `Downloading ${filename}`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    } catch (error) {
      console.error('Failed to download text:', error);
    }
  }, [text, filename, onDownload]);

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: shouldReduceMotion ? 1 : 1.05 },
    tap: { scale: shouldReduceMotion ? 1 : 0.95 },
  };

  return (
    <div className="flex items-center gap-2 flex-wrap" role="toolbar" aria-label="Text actions">
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={handleCopy}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${
            copySuccess
              ? 'bg-green-500 text-white'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }
        `}
        aria-label="Copy text to clipboard (keyboard shortcut: C)"
        style={{ willChange: 'transform' }}
      >
        <CopyIcon className="w-4 h-4" aria-hidden="true" />
        <span className="font-medium">{copySuccess ? 'Copied!' : 'Copy'}</span>
      </motion.button>

      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={handleDownload}
        className="
          flex items-center gap-2 px-4 py-2 rounded-md
          bg-secondary text-secondary-foreground hover:bg-secondary/80
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        "
        aria-label="Download text as file (keyboard shortcut: D)"
        style={{ willChange: 'transform' }}
      >
        <DownloadIcon className="w-4 h-4" aria-hidden="true" />
        <span className="font-medium">Download</span>
      </motion.button>

      <div className="text-xs text-muted-foreground ml-auto" aria-live="polite">
        {text.length.toLocaleString()} characters
      </div>
    </div>
  );
}
