import { useEffect, useMemo } from 'react';

/**
 * Hook to manage object URLs for File/Blob with automatic cleanup
 * Prevents memory leaks by revoking URLs on change or unmount
 * 
 * @param file - File or Blob to create URL for
 * @returns object URL string or null
 * 
 * @example
 * const imageUrl = useObjectUrl(selectedFile);
 * return <img src={imageUrl || ''} alt="Preview" />;
 */
export function useObjectUrl(file: File | Blob | null): string | null {
  // Create URL synchronously with useMemo
  const url = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  // Cleanup on unmount or file change
  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  return url;
}
