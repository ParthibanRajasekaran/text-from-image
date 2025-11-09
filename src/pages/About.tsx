import SEO from '../components/SEO';
import { StructuredData } from '../structuredData';

export default function About() {
  return (
  <section className="prose mx-auto p-4" aria-label="About content">
      <SEO title="About" description="About Free Text From Image." canonical="/about" />
      <h1>About</h1>
      <p>Free Text From Image is a web app that helps you extract text from images easily and securely...</p>
      {/* ...more content... */}
      <StructuredData data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'About' }} />
  </section>
  );
}
