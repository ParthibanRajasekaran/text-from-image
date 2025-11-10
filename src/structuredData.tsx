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
      'name': 'Free Text From Image',
      'description': 'Extract text from images for free.'
    }} />
    <StructuredData data={{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Free Text From Image',
      'url': siteUrl,
      'logo': `${siteUrl}/og/default.png` // TODO: Ensure OG image exists
    }} />
    <StructuredData data={{
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'Free Text From Image',
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
