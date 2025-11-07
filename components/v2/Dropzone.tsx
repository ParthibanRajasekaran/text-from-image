import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { UploadIcon } from '../icons/UploadIcon';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

/**
 * Accessible drag-and-drop zone with paste support
 * - Zero CLS: Reserved height, no layout shifts
 * - Keyboard accessible: Space/Enter to trigger
 * - Reduced motion support
 * - ARIA labels and live regions
 */
export function Dropzone({
  onFileSelect,
  isLoading = false,
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
  maxSizeMB = 10,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      const acceptedTypes = accept.split(',').map(t => t.trim());
      if (!acceptedTypes.some(type => file.type.match(type.replace('*', '.*')))) {
        return `Please select a valid image file (${acceptedTypes.join(', ')})`;
      }

      // Check file size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return `File size must be less than ${maxSizeMB}MB`;
      }

      return null;
    },
    [accept, maxSizeMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

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

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  // Handle paste events
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFile]);

  const containerVariants = {
    idle: { scale: 1, opacity: 1 },
    dragging: { scale: shouldReduceMotion ? 1 : 1.02, opacity: 0.9 },
    disabled: { opacity: 0.5 },
  };

  return (
    <div className="relative">
      <motion.div
        variants={containerVariants}
        animate={isLoading ? 'disabled' : isDragging ? 'dragging' : 'idle'}
        transition={{ duration: 0.15 }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={isLoading ? -1 : 0}
        aria-label="Upload image file. You can also paste from clipboard using Ctrl+V or Cmd+V"
        aria-disabled={isLoading}
        className={`
          min-h-[280px] border-2 border-dashed rounded-lg
          flex flex-col items-center justify-center gap-4 p-8
          cursor-pointer transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-accent/50'
          }
          ${isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
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
            PNG, JPG, WEBP up to {maxSizeMB}MB
          </p>
          <p className="text-xs text-muted-foreground">
            💡 Tip: You can also paste (Ctrl+V / Cmd+V)
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={isLoading}
          className="sr-only"
          tabIndex={-1}
          aria-label="File upload input (use button to select files)"
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="polite"
            className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
