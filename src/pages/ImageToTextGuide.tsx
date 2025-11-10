import SEO from '../components/SEO';
import { StructuredData, getFAQPageLD } from '../structuredData';

const faqs = [
  { question: 'How accurate is image to text?', answer: 'Accuracy depends on image quality and text clarity.' },
  { question: 'Is my data private?', answer: 'We do not store your images or extracted text.' },
];

export default function ImageToTextGuide() {
  return (
  <section className="prose mx-auto p-4" aria-label="Guide content">
      <SEO title="Image to Text Guide" description="How to extract text from images." canonical="/image-to-text" />
      <h1>Image to Text Guide</h1>
      <section>
        <h2>Overview</h2>
        <p>Learn how to convert images to text using our free web app...</p>
      </section>
      <section>
        <h2>How it works</h2>
        <p>Upload your image, and our OCR engine extracts the text...</p>
      </section>
      <section>
        <h2>Step-by-step</h2>
        <ol>
          <li>Go to the Home page.</li>
          <li>Upload your image.</li>
          <li>Click "Extract Text".</li>
          <li>Copy or download the result.</li>
        </ol>
      </section>
      <section>
        <h2>Accuracy tips</h2>
        <ul>
          <li>Use high-resolution images.</li>
          <li>Avoid glare and shadows.</li>
        </ul>
      </section>
      <section>
        <h2>Privacy note</h2>
        <p>Your images are processed securely and never stored.</p>
      </section>
      <section>
        <h2>FAQ</h2>
        <ul>
          {faqs.map(faq => (
            <li key={faq.question}><strong>{faq.question}</strong> {faq.answer}</li>
          ))}
        </ul>
      </section>
      <StructuredData data={getFAQPageLD(faqs)} />
  </section>
  );
}
