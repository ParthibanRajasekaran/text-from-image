import { useEffect } from 'react';

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Core Web Vitals monitoring hook
 * 
 * Metrics tracked:
 * - LCP (Largest Contentful Paint): Target < 1.8s
 * - FID (First Input Delay): Target < 100ms
 * - CLS (Cumulative Layout Shift): Target < 0.1
 * - INP (Interaction to Next Paint): Target < 200ms
 * - FCP (First Contentful Paint): Target < 1.2s
 * - TTFB (Time to First Byte): Target < 600ms
 * 
 * Usage:
 * useWebVitals((metric) => {
 *   console.log(metric.name, metric.value);
 *   // Send to analytics service
 * });
 */
export function useWebVitals(onMetric?: (metric: WebVitalsMetric) => void) {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Dynamically import web-vitals to avoid SSR issues
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      const handleMetric = (metric: any) => {
        const webVitalsMetric: WebVitalsMetric = {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
        };

        // Log to console in development
        if (import.meta.env.DEV) {
          const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
          console.log(`${emoji} [Web Vitals] ${metric.name}:`, {
            value: Math.round(metric.value),
            rating: metric.rating,
          });
        }

        // Call custom handler
        onMetric?.(webVitalsMetric);

        // Send to analytics in production
        if (import.meta.env.PROD) {
          // Example: Send to Google Analytics
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', metric.name, {
              value: Math.round(metric.value),
              metric_rating: metric.rating,
              metric_id: metric.id,
              metric_delta: Math.round(metric.delta),
            });
          }
        }
      };

      // Register all Core Web Vitals
      onCLS(handleMetric);
      onFCP(handleMetric);
      onLCP(handleMetric);
      onTTFB(handleMetric);
      onINP(handleMetric);
    }).catch((err) => {
      console.error('Failed to load web-vitals:', err);
    });
  }, [onMetric]);
}

/**
 * Get performance thresholds for each metric
 */
export function getPerformanceThresholds() {
  return {
    LCP: { good: 1800, needsImprovement: 2500 }, // ms
    FID: { good: 100, needsImprovement: 300 },   // ms
    CLS: { good: 0.1, needsImprovement: 0.25 },  // score
    INP: { good: 200, needsImprovement: 500 },   // ms
    FCP: { good: 1200, needsImprovement: 1800 }, // ms
    TTFB: { good: 600, needsImprovement: 800 },  // ms
  };
}
