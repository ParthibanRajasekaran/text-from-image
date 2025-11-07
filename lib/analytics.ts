/**
 * Analytics Tracking Utilities
 * 
 * Centralized analytics event tracking for user interactions.
 * These events help measure engagement and improve the OCR tool.
 * 
 * Events tracked:
 * - File operations (file_added)
 * - OCR lifecycle (extraction_started, extraction_completed, extraction_failed)
 * - User actions (copy_clicked, download_clicked)
 * - Ad visibility (adslot_visible, adslot_filled)
 * - Content engagement (faq_opened)
 */

export interface FileAddedParams {
  fileType: string;      // e.g., 'image/jpeg', 'image/png', 'application/pdf'
  fileSize: number;      // Size in bytes
  pagePath?: string;     // e.g., '/handwriting-to-text'
}

export interface ExtractionCompletedParams {
  duration: number;      // Time in milliseconds
  wordCount: number;     // Number of words extracted
  confidence?: number;   // Average OCR confidence (0-100)
  pagePath?: string;
}

export interface ExtractionFailedParams {
  error: string;         // Error message or type
  pagePath?: string;
}

export interface ContentInteractionParams {
  contentType?: string;  // e.g., 'text', 'latex', 'csv'
  format?: string;       // e.g., 'txt', 'json', 'csv'
  question?: string;     // FAQ question text
  pagePath?: string;
}

export interface AdEventParams {
  slotId: string;        // Ad slot identifier (e.g., 'afterExplainer1', 'bottom')
  pagePath?: string;
}

/**
 * Track when a file is added to the dropzone
 */
export function trackFileAdded(params: FileAddedParams): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'file_added', {
      event_category: 'File Operations',
      file_type: params.fileType,
      file_size: params.fileSize,
      page_path: params.pagePath || window.location.pathname,
    });
  }
  
  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] file_added:', params);
  }
}

/**
 * Track when OCR extraction starts
 */
export function trackExtractionStarted(pagePath?: string): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'extraction_started', {
      event_category: 'OCR Lifecycle',
      page_path: pagePath || window.location.pathname,
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] extraction_started:', { pagePath });
  }
}

/**
 * Track when OCR extraction completes successfully
 */
export function trackExtractionCompleted(params: ExtractionCompletedParams): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'extraction_completed', {
      event_category: 'OCR Lifecycle',
      duration_ms: params.duration,
      word_count: params.wordCount,
      confidence: params.confidence,
      page_path: params.pagePath || window.location.pathname,
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] extraction_completed:', params);
  }
}

/**
 * Track when OCR extraction fails
 */
export function trackExtractionFailed(params: ExtractionFailedParams): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'extraction_failed', {
      event_category: 'OCR Lifecycle',
      error: params.error,
      page_path: params.pagePath || window.location.pathname,
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[Analytics] extraction_failed:', params);
  }
}

/**
 * Track when user copies extracted text
 */
export function trackCopyClicked(params: ContentInteractionParams = {}): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'copy_clicked', {
      event_category: 'User Actions',
      content_type: params.contentType || 'text',
      page_path: params.pagePath || window.location.pathname,
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] copy_clicked:', params);
  }
}

/**
 * Track when user downloads extracted text
 */
export function trackDownloadClicked(params: ContentInteractionParams = {}): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'download_clicked', {
      event_category: 'User Actions',
      format: params.format || 'txt',
      content_type: params.contentType || 'text',
      page_path: params.pagePath || window.location.pathname,
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] download_clicked:', params);
  }
}

/**
 * Track when an ad slot becomes visible
 */
export function trackAdSlotVisible(params: AdEventParams): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'adslot_visible', {
      event_category: 'Ad Performance',
      slot_id: params.slotId,
      page_path: params.pagePath || window.location.pathname,
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] adslot_visible:', params);
  }
}

/**
 * Track when an ad slot is filled with an ad
 */
export function trackAdSlotFilled(params: AdEventParams): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'adslot_filled', {
      event_category: 'Ad Performance',
      slot_id: params.slotId,
      page_path: params.pagePath || window.location.pathname,
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] adslot_filled:', params);
  }
}

/**
 * Track when a user opens/expands an FAQ item
 */
export function trackFAQOpened(params: ContentInteractionParams): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'faq_opened', {
      event_category: 'Content Engagement',
      question: params.question,
      page_path: params.pagePath || window.location.pathname,
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] faq_opened:', params);
  }
}

/**
 * Batch track multiple events at once (useful for initial page setup)
 */
export function trackEvents(events: Array<{ name: string; params: any }>): void {
  events.forEach(({ name, params }) => {
    switch (name) {
      case 'file_added':
        trackFileAdded(params);
        break;
      case 'extraction_started':
        trackExtractionStarted(params.pagePath);
        break;
      case 'extraction_completed':
        trackExtractionCompleted(params);
        break;
      case 'extraction_failed':
        trackExtractionFailed(params);
        break;
      case 'copy_clicked':
        trackCopyClicked(params);
        break;
      case 'download_clicked':
        trackDownloadClicked(params);
        break;
      case 'adslot_visible':
        trackAdSlotVisible(params);
        break;
      case 'adslot_filled':
        trackAdSlotFilled(params);
        break;
      case 'faq_opened':
        trackFAQOpened(params);
        break;
      default:
        console.warn('[Analytics] Unknown event:', name);
    }
  });
}
