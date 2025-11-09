import SEO from '../components/SEO';
import { StructuredData } from '../structuredData';

export default function Contact() {
  return (
  <section className="prose mx-auto p-4" aria-label="Contact content">
      <SEO title="Contact" description="Contact Free Text From Image." canonical="/contact" />
      <h1>Contact</h1>
      <p>For support or feedback, email us at <a href="mailto:support@freetextfromimage.com">support@freetextfromimage.com</a>.</p>
      {/* Or add a simple form here, no backend required */}
      <StructuredData data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Contact' }} />
  </section>
  );
}
