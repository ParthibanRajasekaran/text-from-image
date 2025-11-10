
import { useEffect } from 'react';

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_PUB_ID;
const IS_PREVIEW = import.meta.env.MODE === 'preview';
const IS_PROD = import.meta.env.MODE === 'production';
const ALLOW_PREVIEW = import.meta.env.VITE_ENABLE_ADS_IN_PREVIEW === 'true';

/**
 * AutoAds: Mounts Google AdSense script once in <head>
 * 
 * Rules:
 * - Production: loads when MODE='production' AND pubId present
 * - Preview: loads when MODE='preview' AND VITE_ENABLE_ADS_IN_PREVIEW='true' AND pubId present
 * - Development: NEVER loads
 * - Deduplication: checks for existing script before mounting
 */
export function AutoAds() {
  useEffect(() => {
    // Never load in development
    if (import.meta.env.MODE === 'development') return;
    
    // Require pub ID in all environments
    if (!ADSENSE_CLIENT) return;
    
    // Preview requires explicit flag
    if (IS_PREVIEW && !ALLOW_PREVIEW) return;
    
    // Production or (preview + flag) - proceed
    if (!IS_PROD && !IS_PREVIEW) return;
    
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    
    // Deduplication: only load script if not already present
    if (document.querySelector(`script[src="${src}"]`)) {
      console.log('[AutoAds] Script already loaded, skipping');
      return;
    }
    
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = src;
    document.head.appendChild(script);
    
    console.log('[AutoAds] Mounted AdSense script in <head>');
  }, []);
  
  return null;
}
