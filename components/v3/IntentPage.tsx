import React, { useMemo } from 'react';
import { HeroOCR } from './HeroOCR';
import { motion } from 'framer-motion';
import { SEO, baseJsonLd, createFAQJsonLd } from '../SEO';

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
 * - Full SEO metadata with SEO component
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
  const faqJsonLd = useMemo(() => createFAQJsonLd(faq), [faq]);
  
  // Combine base JSON-LD with Breadcrumb, Article and FAQ schema
  const combinedJsonLd = useMemo(() => {
    const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://getrendercheck.com';
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
        { '@type': 'ListItem', position: 3, name: title, item: canonicalUrl },
      ],
    };

    const article = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      dateModified: new Date().toISOString(),
      author: { '@type': 'Person', name: 'TextFromImage' },
      mainEntityOfPage: canonicalUrl,
    };

    return [
      ...baseJsonLd,
      breadcrumb,
      article,
      faqJsonLd,
    ];
  }, [faqJsonLd, title, description, canonicalUrl]);

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical={canonicalUrl}
        keywords={keywords.join(', ')}
        jsonLd={combinedJsonLd}
      />

      {/* Main OCR Tool */}
      <HeroOCR customHeading={heading} customSubheading={subheading} />


      {/* FAQ Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden">

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
                  className="group rounded-xl bg-surface/40 backdrop-blur-xl border border-border/50 hover:border-border hover: transition-all duration-200 overflow-hidden"
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
