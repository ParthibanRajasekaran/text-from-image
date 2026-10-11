import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useClipboard } from '../../hooks/useClipboard';
import { useDragDrop } from '../../hooks/useDragDrop';
import { motion, useReducedMotion } from 'framer-motion';
import { UploadIcon } from '../icons/UploadIcon';
import { validateImageFile } from '../../utils/fileValidation';
import { useObjectUrl } from '../../hooks/useObjectUrl';

interface GlassDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  disabled?: boolean;
  onError?: (message: string) => void;
  /** Show the small preview under the dropzone. Turn off when the caller shows the image itself. */
  showPreview?: boolean;
}



/**
 * Premium glass-morphism Dropzone with:
 * - Drag & drop with scale pulse animation
 * - Clipboard paste (Cmd/Ctrl+V)
 * - Dashed border glow on hover/drag
 * - Full keyboard accessibility
 * - Image preview with fixed max-height (zero CLS)
 * - < 200ms interaction time
 */
export function GlassDropzone({ onFileSelect, isLoading = false, disabled = false, onError, showPreview = true }: GlassDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const previewUrl = useObjectUrl(selectedFile);
  
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
      
      setSelectedFile(file);
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

  // Note: Click and keyboard handlers removed - native label behavior handles this
  // The <label htmlFor="file-input"> automatically triggers the file picker

  // Clipboard paste logic now handled by useClipboard hook
  useClipboard({
    disabled: disabled || isLoading,
    onFiles: (files) => {
      if (files.length > 0) handleFile(files[0]);
    },
  });

  return (
    <>
      <motion.label
        htmlFor="glass-dropzone-file-input"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={0}
        className={`
          group relative min-h-[320px] rounded-2xl cursor-pointer
          bg-surface/40 backdrop-blur-xl
          border border-border/70 transition-all duration-200 block
          ${
            isDragging
              ? 'border-accent  scale-[1.02]'
              : isFocused
              ? 'border-primary '
              : 'border-border hover:border-accent/50 hover:'
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
        {/* Viewfinder corners: they close in when the dropzone is hovered, focused or dragged over */}
        {(['top-3 left-3 border-t-2 border-l-2 rounded-tl-lg', 'top-3 right-3 border-t-2 border-r-2 rounded-tr-lg', 'bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg', 'bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg'] as const).map((c) => (
          <span
            key={c}
            aria-hidden="true"
            data-testid="viewfinder-corner"
            className={`pointer-events-none absolute h-6 w-6 transition-all duration-200 ${c} ${
              isDragging || isFocused
                ? 'border-accent scale-110 motion-reduce:scale-100'
                : 'border-muted-foreground/60 group-hover:border-accent group-hover:scale-110 motion-reduce:group-hover:scale-100'
            }`}
          />
        ))}

        {/* Glass effect inner glow */}

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
            <UploadIcon className="w-16 h-16 text-muted-foreground group-hover:text-accent transition-colors duration-200" aria-hidden="true" focusable="false" />
          </motion.div>

          {/* Text content - This is now the accessible name via label association */}
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-foreground" id="glass-dropzone-label">
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

        {/* Hidden file input - connected via htmlFor on label */}
        <input
          ref={inputRef}
          id="glass-dropzone-file-input"
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled || isLoading}
          className="sr-only"
          aria-labelledby="glass-dropzone-label"
        />
      </motion.label>

      {/* Image preview - Fixed max-height prevents CLS */}
      {showPreview && previewUrl && (
        <motion.figure
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 rounded-lg border-2 border-border bg-muted/50 p-4 backdrop-blur-sm"
        >
          <img
            src={previewUrl}
            alt="Selected image preview"
            className="w-full object-contain max-h-64 rounded"
          />
          <figcaption className="sr-only">
            Preview of selected image for OCR processing
          </figcaption>
        </motion.figure>
      )}
    </>
  );
}
