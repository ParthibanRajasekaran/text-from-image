import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'key'> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Skeleton loader component for async content
 * 
 * Features:
 * - Glass-morphism styling
 * - Shimmer animation
 * - Respects prefers-reduced-motion
 * - Multiple variants (text, circular, rectangular)
 * - Zero CLS: reserve space before content loads
 */
export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const baseClasses = 'bg-surface/40 backdrop-blur-sm border border-border/30';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  if (animate) {
    return (
      <motion.div
        className={`${baseClasses} ${variantClasses[variant]} ${className} overflow-hidden relative`}
        style={style}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

/**
 * Text skeleton with multiple lines
 */
export function TextSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton for loading glass cards
 */
export function CardSkeleton({ className = '', ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl bg-surface/40 backdrop-blur-xl border border-border/50 p-6 ${className}`} {...props}>
      <Skeleton variant="rectangular" height={24} width="60%" className="mb-4" />
      <TextSkeleton lines={3} />
    </div>
  );
}

/**
 * Result skeleton for OCR result loading
 */
export function ResultSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-surface/40 backdrop-blur-xl border border-border/50 p-6 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton variant="text" width={120} height={20} />
          <Skeleton variant="text" width={180} height={16} />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width={80} height={36} />
          <Skeleton variant="rectangular" width={80} height={36} />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="bg-background/50 p-4 rounded-lg border border-border/50">
        <TextSkeleton lines={8} />
      </div>
    </div>
  );
}

/**
 * Progress bar skeleton
 */
export function ProgressSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-surface/60 backdrop-blur-xl border border-border/50 p-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={32} height={32} />
        <div className="flex-1">
          <Skeleton variant="rectangular" height={8} className="mb-2" />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
    </div>
  );
}
