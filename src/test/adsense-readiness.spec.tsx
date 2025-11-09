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
import { shouldShowAds } from '../ads/shouldShowAds';


const consentDenied = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
const consentGranted = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' };

describe('AutoAds', () => {
  beforeEach(() => {
    // Remove AdSense script before each test
    document.head.querySelectorAll("script[src^='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-']").forEach(s => s.remove());
    vi.resetModules();
  });

  it('loads AdSense script in Production when pub ID exists, regardless of consent', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_ADSENSE_PUB_ID', 'ca-pub-TEST');
    const { AutoAds } = await import('../ads/AutoAds');
    render(<AutoAds />);
    const src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-TEST';
    expect(document.head.querySelector(`script[src='${src}']`)).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('does not load script if not Production', async () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_ADSENSE_PUB_ID', 'ca-pub-TEST');
    const { AutoAds } = await import('../ads/AutoAds');
    render(<AutoAds />);
    const src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-TEST';
    expect(document.head.querySelector(`script[src='${src}']`)).not.toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('does not load script if no pub ID', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_ADSENSE_PUB_ID', '');
    const { AutoAds } = await import('../ads/AutoAds');
    render(<AutoAds />);
    const src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=';
    expect(document.head.querySelector(`script[src='${src}']`)).not.toBeInTheDocument();
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

  it('reserves height and does not mount <ins> or push unless consent is granted AND script is present', async () => {
    const { InArticle } = await import('../ads/InArticle');
    const src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-TEST';
    
    // No script present, consent granted - should reserve height but not mount <ins>
    const { container: container1 } = render(<InArticle consent={consentGranted} />);
    expect(container1.firstChild).toHaveClass('min-h-[280px]');
    expect(container1.querySelector('ins.adsbygoogle')).not.toBeInTheDocument();
    
    // Add script, consent denied - should still not mount <ins>
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
    const { container: container2 } = render(<InArticle consent={consentDenied} />);
    expect(container2.querySelector('ins.adsbygoogle')).not.toBeInTheDocument();
    
    // Add script, consent granted - should mount <ins>
    const { container: container3 } = render(<InArticle consent={consentGranted} />);
    expect(container3.querySelector('ins.adsbygoogle')).toBeInTheDocument();
    
    vi.unstubAllEnvs();
  });
});

describe('shouldShowAds', () => {
  it('returns true for guide pages, false for others', () => {
    expect(shouldShowAds('/image-to-text')).toBe(true);
    expect(shouldShowAds('/extract-text-from-image')).toBe(true);
    expect(shouldShowAds('/copy-text-from-image')).toBe(true);
    expect(shouldShowAds('/jpg-to-word')).toBe(true);
    expect(shouldShowAds('/jpg-to-excel')).toBe(true);
    expect(shouldShowAds('/image-to-excel')).toBe(false);
    expect(shouldShowAds('/')).toBe(false);
    expect(shouldShowAds('/handwriting-to-text')).toBe(false);
  });
});
