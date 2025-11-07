/**
 * Monetization policy utilities for AdSense compliance
 * 
 * Policy requirements:
 * - Ads only on pages with substantial publisher content (≥250 words OR user-generated content)
 * - No ads on utility/empty screens (login, 404, loading, etc.)
 * - Content-first approach: helpful, people-first content
 */

/**
 * Utility routes where ads should never appear
 * Per AdSense policy: no ads on empty, error, or functional-only pages
 */
const UTILITY_ROUTES = [
  '/404',
  '/500',
  '/login',
  '/signup',
  '/auth',
  '/api',
  '/_next',
  '/loading',
] as const;

/**
 * Check if a route is a utility/functional route where ads should not appear
 * 
 * @param path - URL pathname to check
 * @returns true if route is utility-only (no ads allowed)
 * 
 * @example
 * isUtilityRoute('/404') // true
 * isUtilityRoute('/image-to-text') // false
 */
export function isUtilityRoute(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return true; // Treat invalid paths as utility
  }

  const normalizedPath = path.toLowerCase().trim();

  // Check exact matches and prefixes
  return UTILITY_ROUTES.some(route => 
    normalizedPath === route || normalizedPath.startsWith(`${route}/`)
  );
}

/**
 * Content requirements for ad display per AdSense policy
 */
export interface PublisherContentRequirements {
  /** Word count of unique publisher content (target: ≥250 words) */
  wordCount: number;
  /** Whether page displays user-generated OCR results */
  hasResult: boolean;
  /** Whether page includes helpful explainers/FAQs */
  hasExplainers: boolean;
}

/**
 * Determine if a page has sufficient publisher content for ad display
 * 
 * AdSense requires substantial, helpful content. Page qualifies if:
 * - Has ≥250 words of unique publisher content, OR
 * - Displays user-generated OCR results (valuable to user), OR
 * - Includes educational explainers/FAQs
 * 
 * @param requirements - Content metrics for the page
 * @returns true if page meets content requirements for ads
 * 
 * @example
 * // Content page with 300 words - qualifies
 * hasPublisherContent({ wordCount: 300, hasResult: false, hasExplainers: true }) // true
 * 
 * // Empty upload screen - does not qualify
 * hasPublisherContent({ wordCount: 50, hasResult: false, hasExplainers: false }) // false
 * 
 * // Tool with active result - qualifies (valuable to user)
 * hasPublisherContent({ wordCount: 100, hasResult: true, hasExplainers: false }) // true
 */
export function hasPublisherContent(
  requirements: PublisherContentRequirements
): boolean {
  const { wordCount, hasResult, hasExplainers } = requirements;

  // Minimum word count threshold per AdSense best practices
  const MINIMUM_WORD_COUNT = 250;

  // Page qualifies if any condition is met:
  return (
    wordCount >= MINIMUM_WORD_COUNT || // Substantial unique content
    hasResult ||                       // User-generated valuable content
    hasExplainers                      // Educational/helpful content
  );
}

/**
 * Check if ads should be displayed on a page
 * 
 * Combines route check and content check for full policy compliance
 * 
 * @param path - Current URL pathname
 * @param content - Publisher content requirements
 * @returns true if ads are allowed on this page
 * 
 * @example
 * shouldShowAds('/image-to-text', { wordCount: 300, hasResult: false, hasExplainers: true }) // true
 * shouldShowAds('/404', { wordCount: 300, hasResult: false, hasExplainers: true }) // false
 */
export function shouldShowAds(
  path: string,
  content: PublisherContentRequirements
): boolean {
  // Never show ads on utility routes
  if (isUtilityRoute(path)) {
    return false;
  }

  // Only show ads if content requirements are met
  return hasPublisherContent(content);
}

/**
 * Get recommended ad placement strategy based on content
 * 
 * @param content - Publisher content requirements
 * @returns Recommended number of ad slots and placement strategy
 */
export function getAdPlacementStrategy(
  content: PublisherContentRequirements
): {
  maxAdSlots: number;
  placements: Array<'top' | 'mid' | 'bottom' | 'sidebar'>;
} {
  const { wordCount, hasResult } = content;

  // Conservative approach: fewer ads for shorter content
  if (wordCount < 400) {
    return {
      maxAdSlots: 1,
      placements: ['mid'],
    };
  }

  if (wordCount < 700) {
    return {
      maxAdSlots: 2,
      placements: hasResult ? ['mid', 'bottom'] : ['top', 'bottom'],
    };
  }

  // Longer content can support more ads
  return {
    maxAdSlots: 3,
    placements: ['top', 'mid', 'bottom'],
  };
}
