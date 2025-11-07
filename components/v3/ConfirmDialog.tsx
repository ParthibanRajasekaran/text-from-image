import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

/**
 * Accessible confirmation dialog with proper keyboard navigation and ARIA attributes
 * 
 * Features:
 * - Keyboard navigation (Tab, Shift+Tab, Enter, Escape)
 * - Focus trapping within dialog
 * - ARIA attributes for screen readers
 * - Auto-focus on cancel button (safe default)
 * - Glass-morphism design matching the app theme
 * - Reduces motion for accessibility
 */
export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  const shouldReduceMotion = useReducedMotion();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus management: focus cancel button when dialog opens
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard handling and focus trap - combined for better performance
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      // Handle Enter key on any button
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target === cancelButtonRef.current) {
          e.preventDefault();
          onCancel();
          return;
        } else if (target === confirmButtonRef.current) {
          e.preventDefault();
          onConfirm();
          return;
        }
      }

      // Handle Tab for focus trapping
      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

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

  const isDestructive = variant === 'destructive';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.2 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            onClick={onCancel}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
              transition={{ 
                duration: shouldReduceMotion ? 0.1 : 0.2,
                ease: 'easeOut',
              }}
              className="relative w-full max-w-md bg-surface/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-glow overflow-hidden"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby="dialog-description"
            >
              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Title */}
                <h2
                  id="dialog-title"
                  className="text-lg font-semibold text-foreground"
                >
                  {title}
                </h2>

                {/* Message */}
                <p
                  id="dialog-description"
                  className="text-sm text-muted-foreground"
                >
                  {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    ref={cancelButtonRef}
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 rounded-lg bg-surface/60 hover:bg-surface/80 border border-border/50 hover:border-border text-foreground text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  >
                    {cancelText}
                  </button>
                  <button
                    ref={confirmButtonRef}
                    onClick={onConfirm}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
                      isDestructive
                        ? 'bg-destructive/90 hover:bg-destructive text-destructive-foreground focus:ring-destructive'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary'
                    }`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
