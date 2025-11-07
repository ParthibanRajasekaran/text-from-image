import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { UploadIcon } from '../icons/UploadIcon';

interface GlassDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  disabled?: boolean;
}



/**
 * Premium glass-morphism Dropzone with:
 * - Drag & drop with scale pulse animation
 * - Clipboard paste (Cmd/Ctrl+V)
 * - Dashed border glow on hover/drag
 * - Full keyboard accessibility
 * - < 200ms interaction time
 */
export function GlassDropzone({ onFileSelect, isLoading = false, disabled = false }: GlassDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleFile = useCallback(
    (file: File) => {
      if (disabled || isLoading) return;
      if (!file.type.startsWith('image/')) return;
      onFileSelect(file);
    },
    [disabled, isLoading, onFileSelect]
  );

  // Drag handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) setIsDragging(true);
  }, [disabled, isLoading]);

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
      if (files.length > 0) handleFile(files[0]);
    },
    [handleFile]
  );

  // File input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFile(files[0]);
    },
    [handleFile]
  );

  // Click to open file dialog
  const handleClick = useCallback(() => {
    if (!disabled && !isLoading) inputRef.current?.click();
  }, [disabled, isLoading]);

  // Keyboard: Enter/Space
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  // Paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled || isLoading) return;
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
  }, [disabled, isLoading, handleFile]);

  return (
    <motion.div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        role="button"
        tabIndex={disabled || isLoading ? -1 : 0}
        aria-label="Upload image file. Drag and drop, click, or paste with Cmd+V or Ctrl+V"
        aria-disabled={disabled || isLoading}
        className={`
          group relative min-h-[320px] rounded-2xl cursor-pointer
          bg-surface/40 backdrop-blur-xl
          border-2 border-dashed transition-all duration-200
          ${
            isDragging
              ? 'border-accent shadow-glow-sm scale-[1.02]'
              : isFocused
              ? 'border-primary shadow-glow-sm'
              : 'border-border hover:border-accent/50 hover:shadow-glow-sm'
          }
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
        `}
        animate={
          shouldReduceMotion
            ? {}
            : isDragging
            ? { scale: 1.02 }
            : { scale: 1 }
        }
        transition={{ duration: 0.15 }}
        style={{ willChange: shouldReduceMotion ? 'auto' : 'transform' }}
      >
        {/* Glass effect inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 via-transparent to-accent-2/5 pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center h-full p-8 space-y-6">
          {/* Upload icon */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : isDragging
                ? { scale: 1.1, rotate: 5 }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.15 }}
          >
            <UploadIcon className="w-16 h-16 text-muted-foreground group-hover:text-accent transition-colors duration-200" />
          </motion.div>

          {/* Text content */}
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-foreground">
              {isDragging ? 'Drop image here' : 'Drop image or click to upload'}
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WEBP up to 10MB
            </p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <kbd className="px-2 py-1 text-xs rounded bg-muted border border-border">⌘V</kbd>
              <span>or</span>
              <kbd className="px-2 py-1 text-xs rounded bg-muted border border-border">Ctrl+V</kbd>
              <span>to paste</span>
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled || isLoading}
          className="sr-only"
          tabIndex={-1}
          aria-label="File upload input"
        />
      </motion.div>
  );
}
