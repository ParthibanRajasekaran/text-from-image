import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { XCircleIcon } from '../icons/XCircleIcon';
import type { HistoryItem } from '../../hooks/useLocalHistory';
import { ConfirmDialog } from './ConfirmDialog';
import { formatTimestamp } from '../../utils/dateUtils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

/**
 * Glass-morphism history drawer
 * 
 * Features:
 * - Slide-in from right
 * - Glass backdrop blur
 * - Last 5 OCR results
 * - Restore previous extractions
 * - Individual item removal
 * - Clear all history
 * - Keyboard navigation (Escape to close)
 * - Zero CLS: fixed positioning
 */
export function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onRestore,
  onClearHistory,
  onRemoveItem,
}: HistoryDrawerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: shouldReduceMotion ? 'tween' : 'spring',
              damping: 25,
              stiffness: 200,
              duration: shouldReduceMotion ? 0.2 : undefined,
            }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 bg-surface/95 backdrop-blur-xl border-l border-border/50 shadow-glow flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-drawer-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 id="history-drawer-title" className="text-lg font-semibold text-foreground">
                History
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Close history drawer"
              >
                <XCircleIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No history yet</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Your OCR results will appear here
                  </p>
                </div>
              ) : (
                <>
                  {history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative rounded-lg bg-background/50 border border-border/50 hover:border-border hover:shadow-glow-sm transition-all duration-150 overflow-hidden"
                    >
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-2/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      <div className="relative p-3 space-y-2">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {item.filename && (
                              <p className="text-xs font-medium text-foreground truncate">
                                {item.filename}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(item.timestamp)} · {item.text.trim().split(/\s+/).filter(Boolean).length} words
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveItem(item.id);
                            }}
                            className="flex-shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background"
                            aria-label={`Remove ${item.filename || 'item'} from history`}
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Preview */}
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.text}
                        </p>

                        {/* Restore button */}
                        <button
                          onClick={() => {
                            onRestore(item);
                            onClose();
                          }}
                          className="w-full px-3 py-1.5 rounded-md bg-accent/10 hover:bg-accent/20 border border-accent/20 hover:border-accent/40 text-accent text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                        >
                          Restore
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="p-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(true)}
                  className="w-full px-4 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 hover:border-destructive/40 text-destructive text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background"
                >
                  Clear All History
                </button>
              </div>
            )}
          </motion.aside>

          {/* Confirm Dialog */}
          <ConfirmDialog
            isOpen={showConfirmDialog}
            onConfirm={() => {
              onClearHistory();
              setShowConfirmDialog(false);
            }}
            onCancel={() => setShowConfirmDialog(false)}
            title="Clear All History?"
            message="This action cannot be undone. All your OCR history will be permanently deleted."
            confirmText="Clear All"
            cancelText="Cancel"
            variant="destructive"
          />
        </>
      )}
    </AnimatePresence>
  );
}
