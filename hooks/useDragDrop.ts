import React, { useCallback, useState } from 'react';

export interface UseDragDropOptions {
  disabled?: boolean;
  isLoading?: boolean;
  onFiles: (files: File[]) => void;
  onError?: (message: string) => void;
}

export function useDragDrop({ disabled = false, isLoading = false, onFiles, onError }: UseDragDropOptions) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) setIsDragging(true);
  }, [disabled, isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isLoading) return;
  const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length === 0) {
      onError?.('No files dropped');
      return;
    }
    onFiles(files);
  }, [disabled, isLoading, onFiles, onError]);

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
