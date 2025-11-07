import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useSafeMotion, motionTransition } from '../lib/motion';

export type ProgressStage = 'idle' | 'upload' | 'ocr' | 'render' | 'complete' | 'error';

interface ProgressBarProps {
  stage?: ProgressStage;
  percent?: number; // 0-100
  message?: string;
  className?: string;
}

export interface ProgressBarHandle {
  announce: (message: string) => void;
}

const STAGE_LABELS: Record<ProgressStage, string> = {
  idle: 'Ready',
  upload: 'Uploading...',
  ocr: 'Extracting text...',
  render: 'Rendering results...',
  complete: 'Complete!',
  error: 'Error occurred',
};

const STAGE_COLORS: Record<ProgressStage, string> = {
  idle: 'bg-muted',
  upload: 'bg-blue-500',
  ocr: 'bg-primary',
  render: 'bg-purple-500',
  complete: 'bg-green-500',
  error: 'bg-destructive',
};

/**
 * Accessible progress bar with determinate stages
 * - ARIA progressbar semantics with live region announcements
 * - announce() method for screen reader updates
 * - Width-only transforms (no layout shift)
 * - Reduced motion support
 * - Stage-based visual feedback
 * - Backwards compatible with simple usage
 * - Uses RAF for optimal performance (INP < 200ms)
 */
export const ProgressBar = forwardRef<ProgressBarHandle, ProgressBarProps>(
  ({ stage = 'ocr', percent, message, className = '' }, ref) => {
    const shouldReduceMotion = useSafeMotion();
    const announceRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>();

    // Expose announce method to parent
    useImperativeHandle(ref, () => ({
      announce: (msg: string) => {
        // Use RAF to batch DOM updates
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        
        rafRef.current = requestAnimationFrame(() => {
          if (announceRef.current) {
            announceRef.current.textContent = msg;
          }
        });
      },
    }));

    // Clean up RAF on unmount
    React.useEffect(() => {
      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, []);
  
  // If no percent provided, show indeterminate animation (backwards compatibility)
  const isIndeterminate = percent === undefined;
  const displayPercent = isIndeterminate ? 100 : Math.min(100, Math.max(0, percent));
  const stageLabel = message || STAGE_LABELS[stage];

  // Simple mode (backwards compatible)
  if (!stage || stage === 'idle') {
    return (
      <div 
        className="w-full h-2 bg-secondary rounded-full overflow-hidden"
        role="progressbar"
        aria-label="Loading"
        aria-busy="true"
      >
        <div className="h-full w-full bg-primary animate-progress origin-left-right" />
      </div>
    );
  }

  return (
    <div
      className={clsx('w-full space-y-2', className)}
      role="group"
      aria-label="OCR Progress"
    >
      {/* Stage label */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground" aria-live="polite">
          {stageLabel}
        </span>
        {!isIndeterminate && stage !== 'idle' && stage !== 'error' && (
          <span className="text-muted-foreground tabular-nums" aria-live="polite">
            {displayPercent}%
          </span>
        )}
      </div>

      {/* Progress track */}
      <div
        className="relative h-2 bg-secondary rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={displayPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${stageLabel} - ${displayPercent}% complete`}
      >
        {/* Progress fill */}
        <motion.div
          className={clsx(
            'absolute inset-y-0 left-0 rounded-full',
            STAGE_COLORS[stage]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${displayPercent}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { ...motionTransition, duration: 0.3 }
          }
          style={{ willChange: 'width' }}
        />

        {/* Shimmer effect for active stages */}
        {stage !== 'idle' && stage !== 'complete' && stage !== 'error' && (
          <motion.div
            className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={
              shouldReduceMotion
                ? { opacity: [0.3, 0.6, 0.3] }
                : {
                    x: ['-100%', '400%'],
                    opacity: [0.3, 0.6, 0.3],
                  }
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              willChange: shouldReduceMotion ? 'opacity' : 'transform, opacity',
            }}
          />
        )}
      </div>

      {/* Stage indicators */}
      {(stage !== 'ocr' || message) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className={clsx({ 'text-primary font-medium': stage === 'upload' })}>
            Upload
          </span>
          <span className={clsx({ 'text-primary font-medium': stage === 'ocr' })}>
            OCR
          </span>
          <span className={clsx({ 'text-primary font-medium': stage === 'render' })}>
            Render
          </span>
          <span
            className={clsx({
              'text-green-500 font-medium': stage === 'complete',
              'text-destructive font-medium': stage === 'error',
            })}
          >
            {stage === 'error' ? 'Error' : 'Done'}
          </span>
        </div>
      )}

      {/* ARIA live region for announcements (visually hidden) */}
      <div
        ref={announceRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

