/**
 * Environment variable guards and utilities
 * Ensures critical variables are set at runtime with helpful warnings
 */

let siteUrlWarningShown = false;

/**
 * Get the site URL with runtime guard in production
 * Warns once if VITE_SITE_URL is missing in production builds
 */
export function getSiteUrl(): string {
  const url = import.meta.env.VITE_SITE_URL;

  if (!url && !import.meta.env.DEV && !siteUrlWarningShown) {
    siteUrlWarningShown = true;
    console.warn(
      '⚠️  [ENV] VITE_SITE_URL is not set in production. ' +
      'This may affect canonical links, sitemaps, and SEO metadata. ' +
      'Set VITE_SITE_URL in your production environment variables. ' +
      'Falling back to window.location.origin.'
    );
  }

  return url || (typeof window !== 'undefined' ? window.location.origin : 'https://freetextfromimage.com');
}

/**
 * Get the AdSense publisher ID
 * Returns null if not set (ads will be disabled)
 */
export function getAdSensePubId(): string | null {
  return import.meta.env.VITE_ADSENSE_PUB_ID || null;
}

/**
 * Check if ads are enabled in preview builds
 */
export function isAdsEnabledInPreview(): boolean {
  return import.meta.env.VITE_ENABLE_ADS_IN_PREVIEW === 'true' || import.meta.env.VITE_ENABLE_ADS_IN_PREVIEW === '1';
}

/**
 * Check if specific ad slots are enabled
 */
export function areAdSlotsEnabled(): boolean {
  return import.meta.env.VITE_ADS_SLOTS_ENABLED === 'true' || import.meta.env.VITE_ADS_SLOTS_ENABLED === '1';
}
