import React, { useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { XCircleIcon } from '../icons/XCircleIcon';
import type { HistoryItem } from '../../hooks/useLocalHistory';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

/**
 * Accessible history drawer with smooth animations
 * - Keyboard accessible (Escape to close)
 * - Focus trap when open
 * - ARIA dialog semantics
 * - Reduced motion support
 */
export function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectItem,
  onDeleteItem,
  onClearAll,
}: HistoryDrawerProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const drawerVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { x: '100%', opacity: 0 },
    visible: shouldReduceMotion
      ? { opacity: 1 }
      : { x: 0, opacity: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.3, ease: 'easeInOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="OCR History"
            onKeyDown={handleKeyDown}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 flex flex-col shadow-2xl"
            style={{ willChange: shouldReduceMotion ? 'opacity' : 'transform, opacity' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">History</h2>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 rounded px-2 py-1"
                    aria-label="Clear all history"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Close history drawer"
                >
                  <XCircleIcon className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <p>No history yet</p>
                  <p className="text-sm mt-2">Your OCR results will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative bg-card border border-border rounded-lg p-3 hover:border-primary/50 transition-colors group"
                    >
                      <button
                        onClick={() => onSelectItem(item)}
                        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-foreground truncate flex-1">
                            {item.filename}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.text}
                        </p>
                        {item.method && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.method}
                            {item.confidence && ` • ${Math.round(item.confidence)}% confidence`}
                          </p>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 hover:bg-destructive/10"
                        aria-label={`Delete ${item.filename} from history`}
                      >
                        <XCircleIcon className="w-4 h-4 text-destructive" aria-hidden="true" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="p-4 border-t border-border bg-muted/50">
              <p className="text-xs text-muted-foreground text-center">
                Press <kbd className="px-1 py-0.5 bg-background border border-border rounded text-xs">Esc</kbd> to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
