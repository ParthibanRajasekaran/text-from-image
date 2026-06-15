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

export interface ToolEventParams {
  toolName: string;      // e.g., 'verification-debt-score'
  pagePath?: string;
}

export interface ToolCompletedParams extends ToolEventParams {
  riskLevel?: string;    // e.g., 'low', 'medium', 'high'
  duration?: number;     // Time in milliseconds
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
 * Track when a user starts using a tool
 */
export function trackToolStarted(params: ToolEventParams): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'tool_started', {
      event_category: 'Tool Usage',
      tool_name: params.toolName,
      page_path: params.pagePath || window.location.pathname,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] tool_started:', params);
  }
}

/**
 * Track when a user completes using a tool
 */
export function trackToolCompleted(params: ToolCompletedParams): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'tool_completed', {
      event_category: 'Tool Usage',
      tool_name: params.toolName,
      risk_level: params.riskLevel,
      duration_ms: params.duration,
      page_path: params.pagePath || window.location.pathname,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] tool_completed:', params);
  }
}

/**
 * Track form submission
 */
export function trackFormSubmit(params: { formId: string; pagePath?: string }): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'form_submit', {
      event_category: 'Form Interactions',
      form_id: params.formId,
      page_path: params.pagePath || window.location.pathname,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] form_submit:', params);
  }
}

/**
 * Track form error
 */
export function trackFormError(params: {
  formId: string;
  error: string;
  pagePath?: string;
}): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'form_error', {
      event_category: 'Form Interactions',
      form_id: params.formId,
      error: params.error,
      page_path: params.pagePath || window.location.pathname,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] form_error:', params);
  }
}

/**
 * Track CTA click
 */
export function trackCTAClicked(params: {
  ctaId: string;
  label: string;
  pagePath?: string;
}): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'cta_clicked', {
      event_category: 'CTA Interactions',
      cta_id: params.ctaId,
      label: params.label,
      page_path: params.pagePath || window.location.pathname,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] cta_clicked:', params);
  }
}

/**
 * Track code block copy
 */
export function trackCodeBlockCopied(params: { filename?: string; pagePath?: string }): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'code_block_copied', {
      event_category: 'Developer Content',
      filename: params.filename,
      page_path: params.pagePath || window.location.pathname,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] code_block_copied:', params);
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
      case 'tool_started':
        trackToolStarted(params);
        break;
      case 'tool_completed':
        trackToolCompleted(params);
        break;
      default:
        console.warn('[Analytics] Unknown event:', name);
    }
  });
}
