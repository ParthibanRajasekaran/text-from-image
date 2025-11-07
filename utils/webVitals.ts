import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

/**
 * Web Vitals monitoring utility
 * - Tracks Core Web Vitals (LCP, INP, CLS)
 * - Tracks additional metrics (FCP, TTFB)
 * - Logs to console in development
 * - Can be extended to send to analytics in production
 */

interface VitalsReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

const vitalsReports: VitalsReport[] = [];

/**
 * Log vital to console and store for reporting
 */
function reportVital(metric: Metric) {
  const report: VitalsReport = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  };

  vitalsReports.push(report);

  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: `${Math.round(metric.value)}ms`,
      rating: metric.rating,
      delta: `${Math.round(metric.delta)}ms`,
    });
  }

  // To send to production analytics, see web-vitals documentation:
  // https://github.com/GoogleChrome/web-vitals#send-the-results-to-an-analytics-endpoint
}

/**
 * Initialize Web Vitals monitoring
 * Call this once in your app entry point
 */
export function initWebVitals() {
  // Core Web Vitals
  onLCP(reportVital); // Largest Contentful Paint
  onINP(reportVital); // Interaction to Next Paint (replaces FID)
  onCLS(reportVital); // Cumulative Layout Shift

  // Additional metrics
  onFCP(reportVital); // First Contentful Paint
  onTTFB(reportVital); // Time to First Byte

  if (import.meta.env.DEV) {
    console.log('[Web Vitals] Monitoring initialized');
  }
}

/**
 * Get all collected vitals reports
 */
export function getVitalsReports(): VitalsReport[] {
  return [...vitalsReports];
}

/**
 * Get vitals summary with ratings
 */
export function getVitalsSummary() {
  const summary = {
    good: 0,
    needsImprovement: 0,
    poor: 0,
    total: vitalsReports.length,
  };

  vitalsReports.forEach((report) => {
    if (report.rating === 'good') summary.good++;
    else if (report.rating === 'needs-improvement') summary.needsImprovement++;
    else summary.poor++;
  });

  return summary;
}
