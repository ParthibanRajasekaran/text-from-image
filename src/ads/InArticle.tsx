
import { useEffect, useRef } from 'react';

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_PUB_ID;

/**
 * InArticle: Mid-article ad slot with consent gating
 * 
 * Rules:
 * - Only renders <ins> when consent.ad_storage === 'granted'
 * - Reserves space (min-h-[280px]) to prevent CLS
 * - Checks for AutoAds script before rendering
 * - Prevents duplicate <ins> elements
 * - Never on tool/uploader pages (only in guides)
 */
export interface InArticleProps {
  /** Consent object with ad_storage, ad_user_data, ad_personalization */
  consent: {
    ad_storage: 'granted' | 'denied';
    ad_user_data?: 'granted' | 'denied';
    ad_personalization?: 'granted' | 'denied';
  };
}

export function InArticle({ consent }: InArticleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const consentGranted = consent.ad_storage === 'granted';
  
  useEffect(() => {
    // Require pub ID
    if (!ADSENSE_CLIENT) return;
    
    // Consent gate: only render when consent granted
    if (!consentGranted) {
      console.log('[InArticle] Consent not granted, slot reserved but empty');
      return;
    }
    
    // Ensure AutoAds script is loaded
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    if (!document.querySelector(`script[src="${src}"]`)) {
      console.warn('[InArticle] AutoAds script not found in <head>, cannot render slot');
      return;
    }
    
    if (!ref.current) return;
    
    // Prevent duplicate <ins> elements
    if (ref.current.querySelector('ins.adsbygoogle')) {
      console.log('[InArticle] Slot already rendered, skipping');
      return;
    }
    
    // Render ad slot
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', ADSENSE_CLIENT);
    ins.setAttribute('data-ad-format', 'fluid');
    ins.setAttribute('data-ad-layout', 'in-article');
    ins.setAttribute('aria-label', 'Advertisement');
    ref.current.appendChild(ins);
    
    // Push to AdSense queue
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      console.log('[InArticle] Ad slot pushed to queue');
    } catch (e) {
      console.error('[InArticle] Failed to push ad:', e);
    }
  }, [consentGranted]);
  
  // Always reserve space to prevent CLS
  return (
    <div 
      ref={ref} 
      className="min-h-[280px] w-full my-8" 
      role="region" 
      aria-label="Advertisement" 
      data-testid="inarticle-slot"
    />
  );
}
