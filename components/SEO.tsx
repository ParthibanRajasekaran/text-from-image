import { useEffect } from 'react';

export interface SEOProps {
  /**
   * Page title (will be appended with site name)
   */
  title: string;
  
  /**
   * Meta description (150-160 chars recommended)
   */
  description: string;
  
  /**
   * Canonical URL (absolute)
   */
  canonical: string;
  
  /**
   * Open Graph image URL (optional, uses default if not provided)
   */
  ogImage?: string;
  
  /**
   * Page-specific keywords (optional)
   */
  keywords?: string;
  
  /**
   * Structured data (JSON-LD) - optional
   */
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SITE_NAME = 'TextFromImage';
const SITE_URL = 'https://freetextfromimage.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * SEO component that renders meta tags, Open Graph, Twitter Card, and JSON-LD
 * 
 * Usage:
 * ```tsx
 * <SEO
 *   title="Image to Text Converter"
 *   description="Convert images to text with our free OCR tool"
 *   canonical="https://freetextfromimage.com/image-to-text"
 * />
 * ```
 * 
 * Features:
 * - Zero CLS (all meta tags in <head>)
 * - Canonical URLs for SEO
 * - Open Graph and Twitter Card support
 * - JSON-LD structured data
 * - No duplicate titles
 */
export function SEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  keywords,
  jsonLd,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  
  useEffect(() => {
    // Update document title
    document.title = fullTitle;
    
    // Helper to set or update meta tag
    const setMetaTag = (attr: string, value: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${value}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    
    // Helper to set or update link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };
    
    // Primary Meta Tags
    setMetaTag('name', 'title', fullTitle);
    setMetaTag('name', 'description', description);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }
    
    // Canonical URL
    setLinkTag('canonical', canonical);
    
    // Open Graph / Facebook
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', canonical);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', SITE_NAME);
    
    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:url', canonical);
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);
    
    // JSON-LD Structured Data
    if (jsonLd) {
      let scriptElement = document.getElementById('jsonld-seo') as HTMLScriptElement | null;
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'jsonld-seo';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd], null, 0);
    }
  }, [fullTitle, description, canonical, ogImage, keywords, jsonLd]);
  
  return null; // This component doesn't render anything
}

/**
 * Base JSON-LD for Organization and WebSite
 * Include on all pages
 */
export const baseJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Free online OCR tool to extract text from images',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
  },
];

/**
 * Helper to create FAQ JSON-LD
 * Only use when an actual FAQ section exists on the page
 */
export function createFAQJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
