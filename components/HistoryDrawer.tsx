import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useSafeMotion, motionTransition } from '../lib/motion';
import { HistoryItem } from '../hooks/useLocalHistory';
import { CopyIcon } from './icons/CopyIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectEntry: (entry: HistoryItem) => void;
  onRemoveEntry: (id: string) => void;
  onClearAll: () => void;
}

/**
 * History drawer (side panel)
 * - Last 10 results with image hash, timestamp, text preview
 * - Quick-copy extracted text
 * - Re-run with same settings (select entry)
 * - Clear individual or all entries
 * - Keyboard accessible (Escape to close, Tab navigation)
 */
export function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectEntry,
  onRemoveEntry,
  onClearAll,
}: HistoryDrawerProps) {
  const shouldReduceMotion = useSafeMotion();

  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleCopyText = useCallback(async (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const handleRemove = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveEntry(id);
  }, [onRemoveEntry]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 0 : 1 }}
            transition={motionTransition}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="OCR History"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold">History</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close history"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col h-[calc(100%-4rem)]">
              {history.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500">
                  <div>
                    <p className="text-lg font-medium mb-2">No history yet</p>
                    <p className="text-sm">Your OCR results will appear here</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* History list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {history.map((entry) => (
                      <HistoryCard
                        key={entry.id}
                        entry={entry}
                        onSelect={() => onSelectEntry(entry)}
                        onCopy={(e) => handleCopyText(entry.text, e)}
                        onRemove={(e) => handleRemove(entry.id, e)}
                      />
                    ))}
                  </div>

                  {/* Footer actions */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={onClearAll}
                      className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Clear All History
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// History card component
interface HistoryCardProps {
  entry: HistoryItem;
  onSelect: () => void;
  onCopy: (e: React.MouseEvent) => void;
  onRemove: (e: React.MouseEvent) => void;
}

function HistoryCard({ entry, onSelect, onCopy, onRemove }: HistoryCardProps) {
  const shouldReduceMotion = useSafeMotion();

  const formattedDate = new Date(entry.timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const textPreview = entry.text.length > 100
    ? entry.text.substring(0, 100) + '...'
    : entry.text;

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
      transition={{ duration: 0.15 }}
      onClick={onSelect}
      className={clsx(
        'p-3 rounded-lg border border-gray-200 dark:border-gray-700',
        'bg-gray-50 dark:bg-gray-800 cursor-pointer',
        'hover:border-primary hover:bg-primary/5 transition-colors',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          {entry.filename && (
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
              {entry.filename}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formattedDate} · {entry.text.length.toLocaleString()} chars
            {entry.method && <span className="ml-1">· {entry.method}</span>}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {/* Copy button */}
          <button
            onClick={onCopy}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Copy text"
            title="Copy text"
          >
            <CopyIcon className="w-4 h-4" />
          </button>
          {/* Remove button */}
          <button
            onClick={onRemove}
            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Remove entry"
            title="Remove entry"
          >
            <XCircleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Text preview */}
      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
        {textPreview}
      </p>
    </motion.div>
  );
}
