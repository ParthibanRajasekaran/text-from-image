/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FEATURE FLAGS & CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * --------
 * Centralized configuration for feature flags and environment variables.
 * Replaces ad-hoc process.env/import.meta.env reads throughout the codebase.
 * 
 * BENEFITS:
 * ---------
 * ✅ Single source of truth for all configuration
 * ✅ Type-safe access to environment variables
 * ✅ Default values prevent runtime errors
 * ✅ Easy to test (mock this module instead of process.env)
 * ✅ Clear documentation of all available flags
 * 
 * ENVIRONMENT VARIABLES:
 * ----------------------
 * Vite requires VITE_ prefix for client-side environment variables.
 * Variables are replaced at BUILD TIME, not runtime.
 * 
 * Local Development (.env.local):
 * ```
 * VITE_UX_V2=true
 * VITE_ANALYTICS_ENABLED=false
 * ```
 * 
 * Vercel Production (Project Settings → Environment Variables):
 * ```
 * VITE_UX_V2=true (Production)
 * VITE_ANALYTICS_ENABLED=true (Production)
 * ```
 * 
 * USAGE:
 * ------
 * import { FLAGS } from '@/lib/config/flags';
 * 
 * if (FLAGS.UX_V2_ENABLED) {
 *   // Use enhanced UI
 * }
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get environment variable value with fallback
 */
function getEnv(key: string, defaultValue: string = ''): string {
  return (import.meta.env[key] as string) || defaultValue;
}

/**
 * Parse boolean environment variable
 */
function getBoolEnv(key: string, defaultValue: boolean = false): boolean {
  const value = getEnv(key);
  if (!value) return defaultValue;
  return value === '1' || value.toLowerCase() === 'true';
}

/**
 * Feature Flags & Configuration
 * 
 * ADD NEW FLAGS HERE when introducing new features or environment-dependent behavior
 */
export const FLAGS = {
  // ─────────────────────────────────────────────────────────────────────────
  // Feature Flags
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * UX V2: Enhanced UI with history drawer, progress bar, shortcuts
   * Default: false (off)
   * Env var: VITE_UX_V2
   */
  UX_V2_ENABLED: getBoolEnv('VITE_UX_V2', false),

  /**
   * UX V3: Premium futuristic UI with aurora background + glass cards
   * Default: false (off)
   * Env var: VITE_UX_V3
   * Note: If not set, falls back to UX_V2 flag for backward compatibility
   */
  UX_V3_ENABLED: getBoolEnv('VITE_UX_V3', getBoolEnv('VITE_UX_V2', false)),

  /**
   * Analytics: Enable Web Vitals tracking and analytics
   * Default: true in production, false in development
   * Env var: VITE_ANALYTICS_ENABLED
   */
  ANALYTICS_ENABLED: getBoolEnv('VITE_ANALYTICS_ENABLED', import.meta.env.PROD),

  /**
   * Debug Mode: Enable verbose logging and debug UI elements
   * Default: false (off)
   * Env var: VITE_DEBUG
   */
  DEBUG_ENABLED: getBoolEnv('VITE_DEBUG', false),

  /**
   * OCR Confidence Threshold: Minimum confidence for Tesseract before fallback
   * Default: 60 (60%)
   * Env var: VITE_OCR_MIN_CONFIDENCE
   */
  OCR_MIN_CONFIDENCE: parseInt(getEnv('VITE_OCR_MIN_CONFIDENCE', '60'), 10),

  /**
   * OCR Minimum Text Length: Minimum characters required in OCR result
   * Default: 3
   * Env var: VITE_OCR_MIN_TEXT_LENGTH
   */
  OCR_MIN_TEXT_LENGTH: parseInt(getEnv('VITE_OCR_MIN_TEXT_LENGTH', '3'), 10),

  // ─────────────────────────────────────────────────────────────────────────
  // Build Information (Auto-injected by Vite)
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Git Commit SHA (short)
   * Injected by vite.config.ts during build
   */
  COMMIT: getEnv('VITE_COMMIT', 'dev'),

  /**
   * Vercel Git Commit SHA (set by Vercel)
   * Only available in Vercel deployments
   */
  VERCEL_COMMIT: getEnv('VITE_VERCEL_GIT_COMMIT_SHA', ''),

  /**
   * Build timestamp
   * Injected by vite.config.ts during build
   */
  BUILD_TIME: getEnv('VITE_BUILD_TIME', new Date().toISOString()),

  // ─────────────────────────────────────────────────────────────────────────
  // Environment Detection
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Is Production Build
   */
  IS_PRODUCTION: import.meta.env.PROD,

  /**
   * Is Development Build
   */
  IS_DEVELOPMENT: import.meta.env.DEV,

  /**
   * Base URL for assets
   */
  BASE_URL: import.meta.env.BASE_URL || '/',
} as const;

/**
 * Helper Functions
 */
export const Config = {
  /**
   * Check if UX V2 or V3 is enabled (any enhanced UI)
   */
  isEnhancedUI(): boolean {
    return FLAGS.UX_V2_ENABLED || FLAGS.UX_V3_ENABLED;
  },

  /**
   * Get version string for display
   */
  getVersionString(): string {
    const commit = FLAGS.VERCEL_COMMIT || FLAGS.COMMIT;
    return commit === 'dev' ? 'Development' : `v${commit}`;
  },

  /**
   * Get full configuration as object (useful for debugging)
   */
  getAll(): Record<string, unknown> {
    return { ...FLAGS };
  },

  /**
   * Log configuration (only in development)
   */
  logConfig(): void {
    if (FLAGS.IS_DEVELOPMENT && FLAGS.DEBUG_ENABLED) {
      console.group('🔧 Feature Flags & Configuration');
      console.table(FLAGS);
      console.groupEnd();
    }
  },
};

// Auto-log in development if debug mode
if (FLAGS.IS_DEVELOPMENT && FLAGS.DEBUG_ENABLED) {
  Config.logConfig();
}

/**
 * Type-safe environment variable access
 * 
 * @deprecated Use FLAGS object instead for better type safety and defaults
 */
export function getEnvironmentVariable(key: string, defaultValue: string = ''): string {
  console.warn(`getEnvironmentVariable is deprecated. Use FLAGS.${key} instead.`);
  return getEnv(key, defaultValue);
}
