import React, { useCallback, useRef, useState, useEffect } from 'react';
  import { useClipboard } from '../../hooks/useClipboard';
import { useDragDrop } from '../../hooks/useDragDrop';
import { motion, useReducedMotion } from 'framer-motion';
import { UploadIcon } from '../icons/UploadIcon';
import { validateImageFile } from '../../utils/fileValidation';

interface GlassDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  disabled?: boolean;
  onError?: (message: string) => void;
}



/**
 * Premium glass-morphism Dropzone with:
 * - Drag & drop with scale pulse animation
 * - Clipboard paste (Cmd/Ctrl+V)
 * - Dashed border glow on hover/drag
 * - Full keyboard accessibility
 * - < 200ms interaction time
 */
export function GlassDropzone({ onFileSelect, isLoading = false, disabled = false, onError }: GlassDropzoneProps) {
  const {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useDragDrop({
    disabled,
    isLoading,
    onFiles: (files) => {
      if (files.length > 0) handleFile(files[0]);
    },
    onError,
  });
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleFile = useCallback(
    (file: File) => {
      if (disabled || isLoading) return;
      
      // Validate file using extracted validation utility (SRP)
      const validation = validateImageFile(file);
      if (!validation.valid) {
        onError?.(validation.error!);
        return;
      }
      
      onFileSelect(file);
    },
    [disabled, isLoading, onFileSelect, onError]
  );

  // Drag & drop logic now handled by useDragDrop hook

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

  // Clipboard paste logic now handled by useClipboard hook
  useClipboard({
    disabled: disabled || isLoading,
    onFiles: (files) => {
      if (files.length > 0) handleFile(files[0]);
    },
  });

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
              PNG, JPG, WEBP up to 20MB
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
