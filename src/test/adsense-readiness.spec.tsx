/**
 * Monetization (AdSense)
 *
 * Prerequisites:
 * - All 5 guide pages are live and crawlable
 * - Policy pages (/privacy-policy, /terms, /about, /contact) are live
 * - Sitemap and robots.txt reference all public routes
 *
 * Consent Mode v2:
 * - Default to denied (no ads, no cookies)
 * - Integrate a certified CMP to call updateConsent() on user action
 *
 * AdSense Setup:
 * - In AdSense dashboard: Sites → Add https://freetextfromimage.com
 * - After approval, set VITE_ADSENSE_PUB_ID in env
 * - Update /public/ads.txt with your publisher ID
 * - Redeploy site
 *
 * Placement Rules:
 * - No ads near uploader or CTAs
 * - Reserved space for all ad slots (zero CLS)
 * - Ads only load in production with consent and valid pub ID
 *
 * Troubleshooting:
 * - Use Tag Assistant to verify consent pings
 * - Check Policy Center for violations
 * - Monitor IVT (invalid traffic) hygiene in AdSense reports
 */


import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { ConsentState } from '../consent/consent';
import { shouldShowAds } from '@/src/ads/shouldShowAds';
import adsSpec from '../../specs/ads.spec.json';

const consentDenied: ConsentState = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
const consentGranted: ConsentState = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' };

describe('AutoAds', () => {
  beforeEach(() => {
    // Remove AdSense script before each test
    document.head.querySelectorAll("script[src^='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-']").forEach(s => s.remove());
    vi.resetModules();
  });

  it('injects script in production when pubId set', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_ADSENSE_PUB_ID', 'ca-pub-TEST');
    const { AutoAds } = await import('../ads/AutoAds');
    render(<AutoAds />);
    const src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-TEST';
    const script = document.head.querySelector(`script[src='${src}']`);
    expect(script).toBeTruthy();
    expect(script?.tagName.toLowerCase()).toBe('script');
    vi.unstubAllEnvs();
  });

  it('does not inject script when conditions not met', async () => {
    // Development mode
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_ADSENSE_PUB_ID', 'ca-pub-TEST');
    const { AutoAds: AutoAds1 } = await import('../ads/AutoAds');
    render(<AutoAds1 />);
    const src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-TEST';
    expect(document.head.querySelector(`script[src='${src}']`)).not.toBeTruthy();
    vi.unstubAllEnvs();
    vi.resetModules();

    // No pub ID
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_ADSENSE_PUB_ID', '');
    const { AutoAds: AutoAds2 } = await import('../ads/AutoAds');
    render(<AutoAds2 />);
    expect(document.head.querySelector(`script[src*='adsbygoogle.js']`)).not.toBeTruthy();
    vi.unstubAllEnvs();
  });
});

describe('InArticle', () => {
  beforeEach(() => {
    document.head.querySelectorAll("script[src^='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-']").forEach(s => s.remove());
    vi.resetModules();
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_ADSENSE_PUB_ID', 'ca-pub-TEST');
  });

  it('slot exists with min-h-[280px], no ad push without consent', async () => {
    const { InArticle } = await import('../ads/InArticle');
    const src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-TEST';
    
    // Consent denied - reserves height but no <ins>
    const { container: container1 } = render(<InArticle consent={consentDenied} />);
    const slot1 = container1.querySelector('[data-testid="inarticle-slot"]');
    expect(slot1).toBeInTheDocument();
    expect(slot1).toHaveClass('min-h-[280px]');
    expect(container1.querySelector('ins.adsbygoogle')).not.toBeInTheDocument();
    
    // Consent granted but no script - reserves height but no <ins>
    const { container: container2 } = render(<InArticle consent={consentGranted} />);
    const slot2 = container2.querySelector('[data-testid="inarticle-slot"]');
    expect(slot2).toBeInTheDocument();
    expect(slot2).toHaveClass('min-h-[280px]');
    expect(container2.querySelector('ins.adsbygoogle')).not.toBeInTheDocument();
    
    // Consent granted + script present - mounts <ins>
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
    const { container: container3 } = render(<InArticle consent={consentGranted} />);
    const slot3 = container3.querySelector('[data-testid="inarticle-slot"]');
    expect(slot3).toBeInTheDocument();
    expect(slot3).toHaveClass('min-h-[280px]');
    expect(container3.querySelector('ins.adsbygoogle')).toBeInTheDocument();
    
    vi.unstubAllEnvs();
  });
});

describe('shouldShowAds - spec-driven route rules', () => {
  it('toolRoutesNoAds return false', () => {
    adsSpec.toolRoutesNoAds.forEach((route) => {
      expect(shouldShowAds(route)).toBe(false);
    });
  });

  it('guideRoutesOneSlot return true', () => {
    adsSpec.guideRoutesOneSlot.forEach((route) => {
      expect(shouldShowAds(route)).toBe(true);
    });
  });

  it('unlisted routes return false', () => {
    expect(shouldShowAds('/handwriting-to-text')).toBe(false);
    expect(shouldShowAds('/unknown-route')).toBe(false);
  });
});
