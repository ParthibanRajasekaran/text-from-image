import { useEffect } from 'react';

export interface UseClipboardOptions {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}

export function useClipboard({ disabled = false, onFiles }: UseClipboardOptions) {
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
        onFiles(files);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, onFiles]);
}
