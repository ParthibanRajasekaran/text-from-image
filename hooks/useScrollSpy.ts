import { useEffect, useState, useCallback, useRef } from 'react';

interface UseScrollSpyOptions {
  rootMargin?: string;
  throttle?: boolean;
}

/**
 * useScrollSpy: IntersectionObserver-based scroll spy hook
 * 
 * Tracks which section heading is currently in view as user scrolls.
 * Uses IntersectionObserver with aggressive rootMargin to catch sections
 * in the viewport center, accounting for fixed header.
 * 
 * @param sectionIds - Array of element IDs to observe
 * @param options - IntersectionObserver options
 * @returns currentId - ID of the currently visible section
 */
export function useScrollSpy(
  sectionIds: string[],
  options: UseScrollSpyOptions = {}
): string | null {
  const { rootMargin = '-40% 0% -55%', throttle = true } = options;
  const [currentId, setCurrentId] = useState<string | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingIdRef = useRef<string | null>(null);

  const handleCurrentIdChange = useCallback((id: string | null) => {
    if (throttle) {
      // Cancel previous scheduled update
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      // Schedule update on next animation frame
      pendingIdRef.current = id;
      rafIdRef.current = requestAnimationFrame(() => {
        setCurrentId(pendingIdRef.current);
        rafIdRef.current = null;
      });
    } else {
      setCurrentId(id);
    }
  }, [throttle]);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is most visible (highest intersection ratio)
        let mostVisibleEntry = entries.find((e) => e.isIntersecting);
        
        if (!mostVisibleEntry && entries.length > 0) {
          // If nothing is intersecting, use the first one (page top)
          mostVisibleEntry = entries[0];
        }

        if (mostVisibleEntry) {
          handleCurrentIdChange(mostVisibleEntry.target.id);
        }
      },
      {
        rootMargin,
      }
    );

    // Observe all section IDs
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [sectionIds, rootMargin, handleCurrentIdChange]);

  return currentId;
}
