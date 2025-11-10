import SEO from '../components/SEO';
import { StructuredData } from '../structuredData';

export default function Terms() {
  return (
  <section className="prose mx-auto p-4" aria-label="Terms content">
      <SEO title="Terms of Service" description="Terms of Service for Free Text From Image." canonical="/terms" />
      <h1>Terms of Service</h1>
      <p>These terms govern your use of Free Text From Image...</p>
      {/* ...more content... */}
      <StructuredData data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Terms of Service' }} />
  </section>
  );
}
