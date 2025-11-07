import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type ProgressStage = 'idle' | 'upload' | 'ocr' | 'render' | 'complete' | 'error';

interface GlassProgressBarProps {
  stage: ProgressStage;
  percent?: number;
  message?: string;
  /**
   * Custom progress percentages for each stage.
   * Defaults to: upload: 25%, ocr: 60%, render: 90%
   * These defaults represent typical OCR workflow timing:
   * - Upload (25%): Quick file transfer
   * - OCR (60%): Most time-intensive processing
   * - Render (90%): Fast finalization
   */
  stageProgress?: Partial<Record<ProgressStage, number>>;
}

export interface GlassProgressBarHandle {
  announce: (message: string) => void;
}

const STAGE_LABELS: Record<ProgressStage, string> = {
  idle: 'Ready',
  upload: 'Uploading...',
  ocr: 'Extracting text...',
  render: 'Processing...',
  complete: 'Complete',
  error: 'Error',
};

/**
 * Default progress percentages for each stage.
 * These values represent typical OCR workflow timing:
 * - Upload (25%): Quick file transfer
 * - OCR (60%): Most time-intensive text extraction
 * - Render (90%): Fast result finalization
 */
const DEFAULT_STAGE_PROGRESS: Record<ProgressStage, number> = {
  idle: 0,
  upload: 25,
  ocr: 60,
  render: 90,
  complete: 100,
  error: 0,
};

/**
 * Glass-styled Progress Bar with:
 * - Determinate stages: Upload → OCR → Render
 * - ARIA role="progressbar" with aria-valuenow
 * - Live region announcements (aria-live="polite")
 * - Width transitions only (no transform for perf)
 * - Glass morphism styling
 * - < 200ms transitions
 */
export const GlassProgressBar = forwardRef<GlassProgressBarHandle, GlassProgressBarProps>(
  ({ stage, percent, message, stageProgress }, ref) => {
    const liveRegionRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>();
    const shouldReduceMotion = useReducedMotion();

    // Merge custom stage progress with defaults
    const effectiveStageProgress = { ...DEFAULT_STAGE_PROGRESS, ...stageProgress };

    const currentProgress = percent ?? effectiveStageProgress[stage];
    const currentLabel = message || STAGE_LABELS[stage];

    // Expose announce method for parent components
    useImperativeHandle(ref, () => ({
      announce: (msg: string) => {
        if (liveRegionRef.current) {
          // Use RAF to batch DOM updates
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
          }
          rafRef.current = requestAnimationFrame(() => {
            if (liveRegionRef.current) {
              liveRegionRef.current.textContent = msg;
            }
          });
        }
      },
    }));

    // Auto-announce stage changes
    useEffect(() => {
      if (stage !== 'idle' && liveRegionRef.current) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
          if (liveRegionRef.current) {
            liveRegionRef.current.textContent = currentLabel;
          }
        });
      }

      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, [stage, currentLabel]);

    if (stage === 'idle') return null;

    return (
      <div className="space-y-2">
        {/* Label */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">{currentLabel}</span>
          <span className="text-muted-foreground tabular-nums">{Math.round(currentProgress)}%</span>
        </div>

        {/* Progress bar container - glass style */}
        <div
          className="relative h-2 rounded-full overflow-hidden bg-surface/60 backdrop-blur border border-border/50"
          role="progressbar"
          aria-valuenow={currentProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={currentLabel}
        >
          {/* Glass shimmer background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          {/* Progress fill */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent via-primary to-accent-2"
            initial={{ width: 0 }}
            animate={{ width: `${currentProgress}%` }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.2,
              ease: 'easeOut',
            }}
            style={{ willChange: 'width' }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/50 via-primary/50 to-accent-2/50 blur-sm" />
          </motion.div>

          {/* Animated shimmer overlay - only when processing */}
          {stage !== 'complete' && stage !== 'error' && !shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ willChange: 'transform' }}
            />
          )}
        </div>

        {/* Stage indicators */}
        <div className="flex items-center justify-between px-1">
          {(['upload', 'ocr', 'render'] as const).map((stageName, index) => {
            const stageNum = index + 1;
            const isActive = effectiveStageProgress[stage] >= effectiveStageProgress[stageName];
            const isCurrent = stage === stageName;

            return (
              <motion.div
                key={stageName}
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-accent to-primary text-white shadow-glow-sm'
                      : 'bg-surface/60 text-muted-foreground border border-border/50'
                  } ${isCurrent ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}`}
                >
                  {stageNum}
                </div>
                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {STAGE_LABELS[stageName].replace('...', '')}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* ARIA live region for screen readers */}
        <div
          ref={liveRegionRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </div>
    );
  }
);

GlassProgressBar.displayName = 'GlassProgressBar';
