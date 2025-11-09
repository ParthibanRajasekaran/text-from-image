
import { useEffect, useRef } from 'react';

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_PUB_ID;
const IS_PROD = import.meta.env.MODE === 'production';

export function InArticle({ consent, disabled }: { consent: any; disabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!IS_PROD || !ADSENSE_CLIENT || consent?.ad_storage !== 'granted' || disabled) return;
    if (!ref.current) return;
    // Only render slot if AdSense script is present
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    if (!document.querySelector(`script[src='${src}']`)) return;
    // Prevent duplicate <ins>
    if (ref.current.querySelector('ins.adsbygoogle')) return;
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', ADSENSE_CLIENT);
    ins.setAttribute('data-ad-format', 'fluid');
    ins.setAttribute('data-ad-layout', 'in-article');
    ins.setAttribute('aria-label', 'Advertisement');
    ref.current.appendChild(ins);
    // @ts-ignore
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, [consent, disabled]);
  return <div ref={ref} className="min-h-[280px] w-full my-8" role="region" aria-label="Advertisement" data-testid="inarticle-slot" />;
}
