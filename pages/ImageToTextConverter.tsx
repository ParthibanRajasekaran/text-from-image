import { IntentPage } from '../components/v3/IntentPage';

/**
 * Image to Text Converter page
 * SEO-optimized route for /image-to-text-converter
 */
export default function ImageToTextConverter() {
  return (
    <IntentPage
      title="Image to Text Converter - Free Online OCR Tool"
      description="Free online image to text converter with advanced OCR. Upload any image and extract text instantly. Supports JPG, PNG, WEBP with 95%+ accuracy."
      heading="Free Image to Text Converter"
      subheading="Upload images and extract text in seconds with our powerful AI-driven OCR converter."
      keywords={['image to text converter', 'free ocr', 'online ocr', 'text converter', 'photo to text', 'image converter']}
      canonicalUrl="https://freetextfromimage.com/image-to-text-converter"
      faq={[
        {
          question: 'What makes this converter different?',
          answer: 'Our converter uses state-of-the-art AI models for superior accuracy. It works entirely in your browser, requires no signup, and processes images instantly with support for multiple languages.',
        },
        {
          question: 'Can I convert multiple images at once?',
          answer: 'Currently, you can convert one image at a time. However, the history feature saves your last 20 conversions, making it easy to work with multiple images in sequence.',
        },
        {
          question: 'Does it support non-English text?',
          answer: 'Yes! Our OCR supports over 100 languages including Chinese, Arabic, Cyrillic, and many more. The AI automatically detects the language in your image.',
        },
      ]}
    />
  );
}
