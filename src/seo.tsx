import { useEffect } from 'react';

export type SEOProps = {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
};

const ORIGIN = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
const abs = (p?: string) => {
  if (!p) return ORIGIN;
  return p.startsWith('http') ? p : new URL(p, ORIGIN).toString();
};

export function useSEO({ title, description, canonical, ogImage, ogImageAlt }: SEOProps) {
  useEffect(() => {
    // Title
    if (title) {
      let t = document.querySelector('title');
      if (!t) {
        t = document.createElement('title');
        document.head.appendChild(t);
      }
      t.textContent = title;
    }
    // Description
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', abs(canonical));
    // OG/Twitter image
    const img = abs(ogImage ?? '/og/default.png');
    const imgAlt = ogImageAlt ?? 'Extract text from image — Free OCR';
    // OG tags
    const ogTags = [
      ['og:type', 'website'],
      ['og:site_name', 'TextFromImage'],
      ['og:title', title],
      ['og:description', description],
      ['og:url', abs(canonical)],
      ['og:image', img],
      ['og:image:width', '1200'],
      ['og:image:height', '630'],
      ['og:image:type', 'image/png'],
      ['og:image:alt', imgAlt],
      ['og:locale', 'en_GB'],
    ];
    ogTags.forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
    // Twitter tags
    const twTags = [
      ['twitter:card', 'summary_large_image'],
      ['twitter:title', title],
      ['twitter:description', description],
      ['twitter:image', img],
      // ['twitter:site', '@yourhandle'], // Optional
    ];
    twTags.forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
  }, [title, description, canonical, ogImage, ogImageAlt]);
}
