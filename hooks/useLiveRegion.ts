import { useEffect, useRef } from 'react';

/**
 * Accessibility hook for screen reader announcements
 * 
 * Creates a visually hidden live region that announces status changes
 * to screen reader users without interrupting their workflow.
 * 
 * @param message - Message to announce (empty string = no announcement)
 * @param politeness - 'polite' (wait for pause) or 'assertive' (interrupt)
 * 
 * @example
 * const announceStatus = useLiveRegion();
 * announceStatus('Processing image...'); // Announces to screen readers
 * announceStatus('Complete!'); // Announces when done
 */
export function useLiveRegion(
  politeness: 'polite' | 'assertive' = 'polite'
): (message: string) => void {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region on mount
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', politeness);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    liveRegionRef.current = liveRegion;

    return () => {
      // Cleanup on unmount
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, [politeness]);

  const announce = (message: string) => {
    if (liveRegionRef.current) {
      // Clear first to ensure repeat messages are announced
      liveRegionRef.current.textContent = '';
      // Use setTimeout to ensure screen readers detect the change
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message;
        }
      }, 100);
    }
  };

  return announce;
}
