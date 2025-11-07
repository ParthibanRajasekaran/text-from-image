import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useSafeMotion, motionTransition } from '../lib/motion';
import { UploadIcon } from './icons/UploadIcon';

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  accept?: string;
  maxFiles?: number;
}

// Sample images that can be loaded for demo purposes
const SAMPLE_IMAGES = [
  {
    id: 'receipt',
    name: 'Receipt',
    url: '/samples/receipt.jpg',
    thumbnail: '/samples/receipt-thumb.jpg',
  },
  {
    id: 'document',
    name: 'Document',
    url: '/samples/document.jpg',
    thumbnail: '/samples/document-thumb.jpg',
  },
  {
    id: 'handwriting',
    name: 'Handwriting',
    url: '/samples/handwriting.jpg',
    thumbnail: '/samples/handwriting-thumb.jpg',
  },
];

/**
 * Production-grade Dropzone with:
 * - Drag & drop support
 * - Clipboard paste (Ctrl/Cmd+V)
 * - Sample image loading
 * - Keyboard accessibility (Enter/Space)
 * - Reduced motion support
 * - < 200ms interaction time
 */
export function Dropzone({
  onFiles,
  disabled = false,
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
  maxFiles = 1,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useSafeMotion();

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (disabled) return;
      
      const fileArray = Array.from(files).slice(0, maxFiles);
      if (fileArray.length > 0) {
        onFiles(fileArray);
      }
    },
    [disabled, maxFiles, onFiles]
  );

  // Drag & drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const { files } = e.dataTransfer;
      handleFiles(files);
    },
    [disabled, handleFiles]
  );

  // File input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  // Click handler
  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        handleClick();
      }
    },
    [disabled, handleClick]
  );

  // Paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
            e.preventDefault();
          }
        }
      }

      if (files.length > 0) {
        handleFiles(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, handleFiles]);

  // Load sample image
  const handleLoadSample = useCallback(
    async (sampleUrl: string, sampleName: string) => {
      if (disabled || isLoadingSample) return;

      setIsLoadingSample(true);
      try {
        const response = await fetch(sampleUrl);
        const blob = await response.blob();
        const file = new File([blob], sampleName, { type: blob.type });
        onFiles([file]);
      } catch (error) {
        console.error('Failed to load sample:', error);
      } finally {
        setIsLoadingSample(false);
      }
    },
    [disabled, isLoadingSample, onFiles]
  );

  return (
    <div className="space-y-4">
      {/* Main dropzone */}
      <motion.div
        animate={
          isDragging
            ? {
                scale: shouldReduceMotion ? 1 : 1.02,
                borderColor: 'hsl(var(--primary))',
              }
            : {
                scale: 1,
                borderColor: 'hsl(var(--border))',
              }
        }
        transition={{ ...motionTransition, duration: 0.15 }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload image file. You can also paste from clipboard using Ctrl+V or Cmd+V"
        aria-disabled={disabled}
        className={clsx(
          'relative min-h-[280px] border-2 border-dashed rounded-lg',
          'flex flex-col items-center justify-center gap-4 p-8',
          'cursor-pointer transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          {
            'opacity-50 pointer-events-none': disabled,
            'bg-primary/5': isDragging,
            'hover:bg-accent/50 hover:border-primary/50': !disabled && !isDragging,
          }
        )}
        style={{ willChange: 'transform' }}
      >
        <motion.div
          animate={isDragging ? { scale: shouldReduceMotion ? 1 : 1.1 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <UploadIcon className="w-16 h-16 text-muted-foreground" />
        </motion.div>

        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">
            {isDragging ? 'Drop image here' : 'Drop image or click to upload'}
          </p>
          <p className="text-sm text-muted-foreground">
            PNG, JPG, WEBP up to 10MB
          </p>
          <p className="text-xs text-muted-foreground">
            💡 Tip: You can also paste (Ctrl+V / Cmd+V)
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          aria-hidden="true"
        />
      </motion.div>

      {/* Try a sample section */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground text-center">
          Or try a sample image:
        </p>
        <div className="grid grid-cols-3 gap-3">
          {SAMPLE_IMAGES.map((sample) => (
            <motion.button
              key={sample.id}
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              transition={motionTransition}
              onClick={() => handleLoadSample(sample.url, sample.name)}
              disabled={disabled || isLoadingSample}
              className={clsx(
                'relative rounded-lg overflow-hidden border-2 border-border',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'hover:border-primary/50',
                {
                  'opacity-50 pointer-events-none': disabled || isLoadingSample,
                }
              )}
              style={{ willChange: 'transform' }}
              aria-label={`Load ${sample.name} sample image`}
            >
              <div className="aspect-video bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">{sample.name}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
