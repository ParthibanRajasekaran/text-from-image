import React from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

/**
 * FAQPage JSON-LD Schema Component
 * 
 * Generates structured data for SEO-rich FAQs
 * per schema.org/FAQPage spec
 * 
 * @see https://schema.org/FAQPage
 * @see https://developers.google.com/search/docs/appearance/structured-data/faqpage
 */
export function FAQSchema({ faqs }: FAQSchemaProps) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const schemaData = {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
