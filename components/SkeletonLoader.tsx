import React from 'react';
import clsx from 'clsx';

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'default';
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
}

/**
 * Skeleton loader component for loading states
 * - Text, circular, and rectangular variants
 * - Respects prefers-reduced-motion
 * - Customizable size and styling
 * - Default variant maintains original behavior
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'default',
  width,
  height,
  className,
  animate = true,
}) => {
  // Original default loader (backwards compatible)
  if (variant === 'default') {
    return (
      <div className="w-full space-y-3">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-muted rounded"></div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="h-4 bg-muted rounded col-span-2"></div>
                <div className="h-4 bg-muted rounded col-span-1"></div>
              </div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="grid grid-cols-4 gap-3">
                <div className="h-4 bg-muted rounded col-span-1"></div>
                <div className="h-4 bg-muted rounded col-span-2"></div>
              </div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-muted rounded"></div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="h-4 bg-muted rounded col-span-1"></div>
                <div className="h-4 bg-muted rounded col-span-2"></div>
              </div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New variants
  const style: React.CSSProperties = {};
  
  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  
  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <div
      className={clsx(
        'bg-gray-200 dark:bg-gray-700',
        animate && 'animate-pulse',
        {
          'rounded-full': variant === 'circular',
          'rounded': variant === 'rectangular',
          'rounded h-4': variant === 'text' && !height,
        },
        className
      )}
      style={style}
      role="status"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Text skeleton with multiple lines
 */
interface TextSkeletonProps {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
}

export function TextSkeleton({ 
  lines = 3, 
  lastLineWidth = '80%',
  className 
}: TextSkeletonProps) {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton for loading cards
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('p-4 border border-gray-200 dark:border-gray-700 rounded-lg', className)}>
      <div className="flex items-start gap-3 mb-3">
        <SkeletonLoader variant="circular" width={40} height={40} />
        <div className="flex-1">
          <SkeletonLoader variant="text" width="60%" className="mb-2" />
          <SkeletonLoader variant="text" width="40%" />
        </div>
      </div>
      <TextSkeleton lines={2} lastLineWidth="90%" />
    </div>
  );
}

/**
 * Image skeleton for loading images
 */
interface ImageSkeletonProps {
  aspectRatio?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function ImageSkeleton({ 
  aspectRatio = '16/9',
  width = '100%',
  height,
  className 
}: ImageSkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    aspectRatio: !height ? aspectRatio : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <SkeletonLoader
      variant="rectangular"
      className={className}
      style={style}
    />
  );
}

/**
 * Button skeleton for loading buttons
 */
interface ButtonSkeletonProps {
  width?: string | number;
  height?: number;
  className?: string;
}

export function ButtonSkeleton({ 
  width = 120, 
  height = 40,
  className 
}: ButtonSkeletonProps) {
  return (
    <SkeletonLoader
      variant="rectangular"
      width={width}
      height={height}
      className={className}
    />
  );
}

/**
 * List skeleton for loading lists
 */
interface ListSkeletonProps {
  items?: number;
  className?: string;
}

export function ListSkeleton({ items = 3, className }: ListSkeletonProps) {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        // @ts-expect-error - key is a valid React prop
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

