
import { useEffect } from 'react';

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_PUB_ID;
const IS_PROD = import.meta.env.MODE === 'production';

export function AutoAds() {
  useEffect(() => {
    if (!IS_PROD || !ADSENSE_CLIENT) return;
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    // Only load script if not already present
    if (document.querySelector(`script[src='${src}']`)) return;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = src;
    document.head.appendChild(script);
  }, []);
  return null;
}
