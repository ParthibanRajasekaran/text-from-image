// JSON-LD structured data helpers
import React from 'react';

export function StructuredData({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

// Example: WebSite, Organization, SoftwareApplication for Home
export function HomeStructuredData({ siteUrl }: { siteUrl: string }) {
  return <>
    <StructuredData data={{
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'url': siteUrl,
      'name': 'RenderCheck',
      'description': 'Local OCR assertions for Playwright and Cypress, and a free image-to-text tool that runs in your browser.'
    }} />
    <StructuredData data={{
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': 'Parthiban Rajasekaran',
      'sameAs': ['https://github.com/ParthibanRajasekaran', 'https://www.linkedin.com/in/parthibanrajasekaran'],
      'url': siteUrl
    }} />
    <StructuredData data={{
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'RenderCheck',
      'applicationCategory': 'WebApplication',
      'operatingSystem': 'All',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    }} />
  </>;
}

// FAQPage for guides
export function FAQStructuredData({ faqs }: { faqs: { question: string, answer: string }[] }) {
  if (!faqs || faqs.length < 2) return null;
  return <StructuredData data={{
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  }} />;
}
