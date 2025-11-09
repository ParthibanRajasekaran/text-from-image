import SEO from '../components/SEO';
import { StructuredData } from '../structuredData';

export default function PrivacyPolicy() {
  return (
  <section className="prose mx-auto p-4" aria-label="Privacy Policy content">
      <SEO title="Privacy Policy" description="Our privacy policy for Free Text From Image." canonical="/privacy-policy" />
      <h1>Privacy Policy</h1>
      <p>Your privacy is important to us. This page explains how we handle your data...</p>
      {/* ...more content... */}
      <StructuredData data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Privacy Policy' }} />
  </section>
  );
}
