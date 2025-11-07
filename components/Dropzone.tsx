import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useSafeMotion, motionTransition } from '../lib/motion';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  accept?: string;
  maxFiles?: number;
}

interface FileBadge {
  file: File;
  id: string;
  preview?: string;
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
 * - Multiple file support with badge row
 * - Drag & drop support
 * - Clipboard paste (Ctrl/Cmd+V)
 * - Sample image loading
 * - Keyboard accessibility (Enter/Space)
 * - Reduced motion support
 * - < 200ms interaction time
 * - Compact file badges with remove capability
 */
export function Dropzone({
  onFiles,
  disabled = false,
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
  maxFiles = 1,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileBadge[]>([]);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useSafeMotion();

  // Process files and create badges
  const processFiles = useCallback((files: File[]) => {
    const validFiles = Array.from(files).slice(0, maxFiles);
    const badges: FileBadge[] = validFiles.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      preview: URL.createObjectURL(file),
    }));
    
    setSelectedFiles(badges);
    onFiles(validFiles);
  }, [maxFiles, onFiles]);

  // Remove file badge
  const removeFile = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFiles((prev) => {
      const updated = prev.filter((badge) => badge.id !== id);
      // Clean up preview URL
      const removed = prev.find((badge) => badge.id === id);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      // Notify parent with remaining files
      onFiles(updated.map((badge) => badge.file));
      return updated;
    });
  }, [onFiles]);

  // Clear all files
  const clearAllFiles = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Clean up all preview URLs
    selectedFiles.forEach((badge) => {
      if (badge.preview) {
        URL.revokeObjectURL(badge.preview);
      }
    });
    setSelectedFiles([]);
    onFiles([]);
  }, [selectedFiles, onFiles]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((badge) => {
        if (badge.preview) {
          URL.revokeObjectURL(badge.preview);
        }
      });
    };
  }, [selectedFiles]);

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
      processFiles(Array.from(files));
    },
    [disabled, processFiles]
  );

  // File input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(Array.from(e.target.files));
      }
    },
    [processFiles]
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
        processFiles(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, processFiles]);

  // Load sample image
  const handleLoadSample = useCallback(
    async (sampleUrl: string, sampleName: string) => {
      if (disabled || isLoadingSample) return;

      setIsLoadingSample(true);
      try {
        const response = await fetch(sampleUrl);
        const blob = await response.blob();
        const file = new File([blob], sampleName, { type: blob.type });
        processFiles([file]);
      } catch (error) {
        console.error('Failed to load sample:', error);
      } finally {
        setIsLoadingSample(false);
      }
    },
    [disabled, isLoadingSample, processFiles]
  );

  return (
    <div className="space-y-4">
      {/* File badges row with clear all button */}
      <AnimatePresence mode="popLayout">
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={clearAllFiles}
                className="text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-1"
                aria-label="Clear all selected files"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
            {selectedFiles.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md text-sm"
                role="group"
                aria-label={`Selected file: ${badge.file.name}, ${(badge.file.size / 1024).toFixed(1)}KB`}
              >
                {badge.preview && (
                  <img 
                    src={badge.preview} 
                    alt=""
                    className="w-6 h-6 object-cover rounded"
                    aria-hidden="true"
                  />
                )}
                <span className="font-medium text-foreground truncate max-w-[150px]">
                  {badge.file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({(badge.file.size / 1024).toFixed(1)}KB)
                </span>
                <button
                  onClick={(e) => removeFile(badge.id, e)}
                  className="ml-1 p-0.5 hover:bg-destructive/20 rounded transition-colors"
                  aria-label={`Remove ${badge.file.name}`}
                >
                  <XCircleIcon className="w-4 h-4 text-destructive" />
                </button>
              </motion.div>
            ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        className={clsx(
          'relative min-h-[280px] border-2 border-dashed rounded-lg',
          'flex flex-col items-center justify-center gap-4 p-8',
          'transition-colors',
          {
            'opacity-50 pointer-events-none': disabled,
            'bg-primary/5': isDragging,
          }
        )}
        style={{ willChange: 'transform' }}
        role="region"
        aria-label="File upload drop zone"
      >
        <motion.div
          animate={isDragging ? { scale: shouldReduceMotion ? 1 : 1.1 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <UploadIcon className="w-16 h-16 text-muted-foreground" />
        </motion.div>

        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">
            {isDragging ? 'Drop image here' : 'Drop image or click button to upload'}
          </p>
          <p className="text-sm text-muted-foreground">
            PNG, JPG, WEBP up to 10MB
          </p>
          <p className="text-xs text-muted-foreground">
            💡 Tip: You can also paste (Ctrl+V / Cmd+V)
          </p>
          <button
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={clsx(
              'mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'hover:bg-primary/90 transition-colors',
              {
                'opacity-50 cursor-not-allowed': disabled,
              }
            )}
          >
            Upload Image
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-label="File upload input (use button to select files)"
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
