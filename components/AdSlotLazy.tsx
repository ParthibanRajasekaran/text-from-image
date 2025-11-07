import { useEffect, useRef, useState } from 'react';

interface AdSlotLazyProps {
  /** Ad placement position (for tracking/analytics) */
  slot: 'top' | 'mid' | 'bottom' | 'sidebar';
  /** Test mode flag (disables real ads) */
  dataAdTest?: boolean;
  /** Optional custom className */
  className?: string;
}

/**
 * AdSlotLazy - Lazy-loading ad container with zero CLS
 * 
 * AdSense-compliant features:
 * - Reserved min-height (300px) prevents layout shift
 * - IntersectionObserver lazy-loads ads only when visible
 * - ARIA accessibility label
 * - Test mode support
 * 
 * Performance:
 * - Zero CLS: fixed height reserved before ad loads
 * - Lazy: ads only load when scrolled into viewport
 * - LCP: minimal impact on initial page load
 * 
 * @example
 * <AdSlotLazy slot="top" />
 * <AdSlotLazy slot="mid" dataAdTest={true} />
 */
export function AdSlotLazy({ slot, dataAdTest = false, className = '' }: AdSlotLazyProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentRef = adRef.current;
    if (!currentRef) return;

    // IntersectionObserver: lazy-load ads only when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Load once, then stop observing
          }
        });
      },
      {
        rootMargin: '200px', // Load 200px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (observer && currentRef) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div
      ref={adRef}
      className={`ad-slot ad-slot--${slot} ${className}`}
      aria-label="advertisement"
      data-ad-slot={slot}
      data-ad-test={dataAdTest ? 'true' : undefined}
      style={{
        minHeight: '300px', // Reserve height for zero CLS
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: dataAdTest ? '#f3f4f6' : 'transparent',
        border: dataAdTest ? '2px dashed #d1d5db' : 'none',
      }}
    >
      {isVisible ? (
        <div className="ad-content">
          {dataAdTest ? (
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>
              Ad Slot: {slot.toUpperCase()}
            </span>
          ) : (
            // Real ad code would go here (AdSense script, etc.)
            <div data-ad-loaded="true" />
          )}
        </div>
      ) : (
        // Placeholder while lazy-loading
        <div className="ad-placeholder" aria-hidden="true" />
      )}
    </div>
  );
}
