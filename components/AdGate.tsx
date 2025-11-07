import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  shouldShowAds,
  type PublisherContentRequirements,
} from '../lib/monetization';

interface AdGateProps {
  children: ReactNode;
  /** Content metrics for policy compliance */
  content: PublisherContentRequirements;
  /** Optional: override pathname (for testing) */
  pathname?: string;
}

/**
 * AdGate - Policy-compliant ad display gatekeeper
 * 
 * Prevents ads from showing on:
 * - Utility routes (404, auth, loading, etc.)
 * - Pages without sufficient publisher content
 * - Empty screens without user value
 * 
 * Per AdSense policy: ads only on content-rich, helpful pages
 * 
 * @example
 * // Allow ads on content page with 400 words
 * <AdGate content={{ wordCount: 400, hasResult: false, hasExplainers: true }}>
 *   <AdSlot slot="top" />
 * </AdGate>
 * 
 * // Block ads on empty upload screen
 * <AdGate content={{ wordCount: 50, hasResult: false, hasExplainers: false }}>
 *   <AdSlot slot="top" /> // Won't render
 * </AdGate>
 */
export function AdGate({ children, content, pathname: overridePath }: AdGateProps) {
  const location = useLocation();
  const pathname = overridePath ?? location.pathname ?? '/';

  // Check if ads are allowed per policy
  const canShowAds = shouldShowAds(pathname, content);

  if (!canShowAds) {
    return null;
  }

  return <>{children}</>;
}
