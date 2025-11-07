import React, { useEffect, useMemo } from 'react';
import { HeroOCR } from './HeroOCR';
import { motion } from 'framer-motion';
import { InlineAdSlot } from '../AdSlot';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface IntentPageProps {
  title: string;
  description: string;
  heading: string;
  subheading: string;
  keywords: string[];
  faq: FAQItem[];
  canonicalUrl: string;
}

/**
 * Intent-specific page wrapper for V3 UI
 * 
 * Features:
 * - Full SEO metadata with Helmet
 * - FAQ schema for rich snippets
 * - Canonical URLs
 * - Open Graph tags
 * - Twitter cards
 * - Glass-morphism FAQ section
 */
export function IntentPage({
  title,
  description,
  heading,
  subheading,
  keywords,
  faq,
  canonicalUrl,
}: IntentPageProps) {
  // Structured data for FAQ rich snippets
  const faqSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }), [faq]);

  // Update page metadata
  useEffect(() => {
    document.title = title;
    
    // Update or create meta tags
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords.join(', '));
    updateProperty('og:title', title);
    updateProperty('og:description', description);
    updateProperty('og:url', canonicalUrl);
    updateProperty('twitter:title', title);
    updateProperty('twitter:description', description);

    // Add canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Add FAQ structured data
    let script = document.getElementById('faq-schema') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', 'faq-schema');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqSchema);
  }, [title, description, keywords, canonicalUrl, faqSchema]);

  return (
    <>

      {/* Main OCR Tool */}
      <HeroOCR customHeading={heading} customSubheading={subheading} />

      {/* Ad Slot - Mid Content */}
      <InlineAdSlot slot="rectangle" />

      {/* FAQ Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Section heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about our OCR tool
              </p>
            </motion.div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {faq.map((item, index) => (
                <motion.details
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group rounded-xl bg-surface/40 backdrop-blur-xl border border-border/50 hover:border-border hover:shadow-glow-sm transition-all duration-200 overflow-hidden"
                >
                  <summary className="cursor-pointer list-none px-6 py-4 text-left font-semibold text-foreground hover:text-accent transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <span>{item.question}</span>
                      <span className="flex-shrink-0 text-muted-foreground group-open:rotate-180 transition-transform duration-200">
                        ▼
                      </span>
                    </div>
                  </summary>
                  <div className="px-6 pb-4 text-muted-foreground">
                    <p className="whitespace-pre-line">{item.answer}</p>
                  </div>
                </motion.details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
