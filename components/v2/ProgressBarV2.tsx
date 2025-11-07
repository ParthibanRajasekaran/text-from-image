import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ProgressBarV2Props {
  progress?: number; // 0-100, undefined for indeterminate
  status?: string;
  className?: string;
}

/**
 * Accessible progress bar with reduced motion support
 * - Uses transform/opacity only (GPU accelerated)
 * - ARIA progress semantics
 * - Respects prefers-reduced-motion
 */
export function ProgressBarV2({ progress, status, className = '' }: ProgressBarV2Props) {
  const shouldReduceMotion = useReducedMotion();
  const isIndeterminate = progress === undefined;

  return (
    <div className={`w-full space-y-2 ${className}`} role="group" aria-label="OCR Progress">
      {status && (
        <p className="text-sm text-foreground font-medium text-center" aria-live="polite">
          {status}
        </p>
      )}
      
      <div
        className="relative h-2 bg-secondary rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={isIndeterminate ? 'Processing' : `${progress}% complete`}
      >
        {isIndeterminate ? (
          // Indeterminate animation
          <motion.div
            className="absolute inset-y-0 w-1/3 bg-primary rounded-full"
            animate={
              shouldReduceMotion
                ? { opacity: [0.5, 1, 0.5] }
                : {
                    x: ['-100%', '300%'],
                    opacity: [0.5, 1, 0.5],
                  }
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ willChange: shouldReduceMotion ? 'opacity' : 'transform, opacity' }}
          />
        ) : (
          // Determinate progress
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.3,
              ease: 'easeOut',
            }}
            style={{ willChange: 'transform' }}
          />
        )}
      </div>

      {!isIndeterminate && (
        <p className="text-xs text-muted-foreground text-center" aria-live="polite">
          {progress}% complete
        </p>
      )}
    </div>
  );
}
