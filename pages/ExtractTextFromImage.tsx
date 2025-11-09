import { IntentPage } from '../components/v3/IntentPage';
import { useSEO } from '../src/seo';

/**
 * Extract Text from Image page
 * SEO-optimized route for /extract-text-from-image
 */
export default function ExtractTextFromImage() {
  useSEO({
    title: "Extract Text from Image - Free AI-Powered OCR",
    description: "Extract text from any image online for free. Advanced AI OCR with 95%+ accuracy. Supports JPG, PNG, WEBP. No signup required.",
    canonical: "https://freetextfromimage.com/extract-text-from-image",
  });
  return (
    <IntentPage
      title="Extract Text from Image - Free AI-Powered OCR"
      description="Extract text from any image online for free. Advanced AI OCR with 95%+ accuracy. Supports JPG, PNG, WEBP. No upload limits, no signup required."
      heading="Extract Text from Any Image"
      subheading="AI-powered text extraction from photos, screenshots, scanned documents, and more."
      keywords={['extract text from image', 'text extraction', 'ocr online', 'read text from image', 'image text extractor']}
      canonicalUrl="https://freetextfromimage.com/extract-text-from-image"
      faq={[
        {
          question: 'How quickly can I extract text?',
          answer: 'Most images are processed in 2-5 seconds. The exact time depends on image size and complexity, but our AI model is optimized for speed without sacrificing accuracy.',
        },
        {
          question: 'What if the extracted text has errors?',
          answer: 'For best results, use high-resolution, well-lit images with clear text. If you notice errors, try uploading a higher quality version of the image or adjust lighting/contrast before capturing.',
        },
        {
          question: 'Can I extract text from handwritten notes?',
          answer: 'Yes, our OCR can handle handwritten text, though accuracy is higher for printed text. Clear, legible handwriting in good lighting will produce the best results.',
        },
        {
          question: 'Is there a download option?',
          answer: 'Yes! After extraction, you can either copy the text to your clipboard (C key) or download it as a text file (D key or Download button).',
        },
      ]}
    />
  );
}
