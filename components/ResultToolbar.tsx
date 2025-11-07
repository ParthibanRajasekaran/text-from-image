import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useSafeMotion, motionTransition } from '../lib/motion';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ResultToolbarProps {
  text: string;
  onCopy?: () => void;
  onDownload?: () => void;
  onFixSpacing?: () => void;
  onTranslate?: () => void;
}

/**
 * Result toolbar with micro-interactions
 * - Copy with confetti toast
 * - Download, fix spacing, translate actions
 * - Keyboard hints in tooltips
 * - Reduced motion support
 * - < 200ms interaction feedback
 */
export function ResultToolbar({
  text,
  onCopy,
  onDownload,
  onFixSpacing,
  onTranslate,
}: ResultToolbarProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const shouldReduceMotion = useSafeMotion();

  const showSuccessToast = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast('Copied!');
      onCopy?.();
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [text, onCopy, showSuccessToast]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccessToast('Downloaded!');
    onDownload?.();
  }, [text, onDownload, showSuccessToast]);

  const handleFixSpacing = useCallback(() => {
    showSuccessToast('Spacing fixed!');
    onFixSpacing?.();
  }, [onFixSpacing, showSuccessToast]);

  const handleTranslate = useCallback(() => {
    showSuccessToast('Opening translator...');
    onTranslate?.();
  }, [onTranslate, showSuccessToast]);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap" role="toolbar" aria-label="Text actions">
        {/* Copy button */}
        <ToolbarButton
          onClick={handleCopy}
          icon={<CopyIcon className="w-4 h-4" />}
          label="Copy"
          shortcut="C"
          tooltip="Copy to clipboard"
        />

        {/* Download button */}
        <ToolbarButton
          onClick={handleDownload}
          icon={<DownloadIcon className="w-4 h-4" />}
          label="Download"
          shortcut="D"
          tooltip="Download as TXT"
        />

        {/* Fix spacing button */}
        {onFixSpacing && (
          <ToolbarButton
            onClick={handleFixSpacing}
            icon={<span className="text-base">🔤</span>}
            label="Fix Spacing"
            tooltip="Auto-fix spacing issues"
          />
        )}

        {/* Translate button */}
        {onTranslate && (
          <ToolbarButton
            onClick={handleTranslate}
            icon={<span className="text-base">🌐</span>}
            label="Translate"
            tooltip="Translate text"
          />
        )}

        {/* Character count */}
        <div className="ml-auto text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {text.length.toLocaleString()} characters
        </div>
      </div>

      {/* Success toast with confetti */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-4 right-4 z-50"
            role="status"
            aria-live="polite"
          >
            <div className="relative bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
              {toastMessage}
              {/* Pure CSS confetti burst - 8 dots, 300ms, reduced motion support */}
              {!shouldReduceMotion && (
                <div className="confetti-container">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="confetti-dot" />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .confetti-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          pointer-events: none;
        }

        .confetti-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--confetti-color, rgba(255, 255, 255, 0.8));
          opacity: 1;
          animation: confettiBurst 300ms ease-out forwards;
          /* Position dots in a circle around the center */
          left: 50%;
          top: 50%;
          margin-left: -3px;
          margin-top: -3px;
        }

        .confetti-dot:nth-child(1) { --angle: 0deg; --confetti-color: rgba(255, 200, 200, 0.9); animation-delay: 0ms; }
        .confetti-dot:nth-child(2) { --angle: 45deg; --confetti-color: rgba(255, 220, 150, 0.9); animation-delay: 20ms; }
        .confetti-dot:nth-child(3) { --angle: 90deg; --confetti-color: rgba(200, 255, 200, 0.9); animation-delay: 40ms; }
        .confetti-dot:nth-child(4) { --angle: 135deg; --confetti-color: rgba(150, 220, 255, 0.9); animation-delay: 60ms; }
        .confetti-dot:nth-child(5) { --angle: 180deg; --confetti-color: rgba(200, 200, 255, 0.9); animation-delay: 80ms; }
        .confetti-dot:nth-child(6) { --angle: 225deg; --confetti-color: rgba(255, 200, 255, 0.9); animation-delay: 100ms; }
        .confetti-dot:nth-child(7) { --angle: 270deg; --confetti-color: rgba(255, 255, 150, 0.9); animation-delay: 120ms; }
        .confetti-dot:nth-child(8) { --angle: 315deg; --confetti-color: rgba(200, 255, 255, 0.9); animation-delay: 140ms; }

        @keyframes confettiBurst {
          0% {
            opacity: 1;
            transform: translateY(-8px) rotate(var(--angle)) translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateY(0) rotate(var(--angle)) translateX(30px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .confetti-dot {
            animation: confettiFade 300ms ease-out forwards;
          }
          
          @keyframes confettiFade {
            0% { opacity: 1; }
            100% { opacity: 0; }
          }
        }
      `}</style>
    </>
  );
}

// Toolbar button component with tooltip
interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  tooltip?: string;
  variant?: 'primary' | 'secondary';
}

function ToolbarButton({
  onClick,
  icon,
  label,
  shortcut,
  tooltip,
  variant = 'primary',
}: ToolbarButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const shouldReduceMotion = useSafeMotion();

  return (
    <div className="relative">
      <motion.button
        whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        transition={motionTransition}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90':
              variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80':
              variant === 'secondary',
          }
        )}
        aria-label={tooltip || label}
        style={{ willChange: 'transform' }}
      >
        {icon}
        <span>{label}</span>
        {shortcut && (
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-xs bg-black/10 rounded">
            {shortcut}
          </kbd>
        )}
      </motion.button>

      {/* Tooltip */}
      {showTooltip && tooltip && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap pointer-events-none z-10"
        >
          {tooltip}
          {shortcut && <span className="ml-2 opacity-70">({shortcut})</span>}
        </motion.div>
      )}
    </div>
  );
}
