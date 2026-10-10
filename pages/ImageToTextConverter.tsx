import { IntentPage } from '../components/v3/IntentPage';

/**
 * Image to Text Converter page
 * SEO-optimized route for /image-to-text-converter
 */
export default function ImageToTextConverter() {
  return (
    <IntentPage
      title="Image to Text Converter - Free Online OCR Tool"
      description="Free image to text converter that runs in your browser. Extract text from JPG, PNG and WEBP without uploading anything."
      heading="Free Image to Text Converter"
      subheading="Upload images and extract text in seconds with an OCR converter that runs in your browser."
      keywords={['image to text converter', 'free ocr', 'online ocr', 'text converter', 'photo to text', 'image converter']}
      canonicalUrl="https://getrendercheck.com/image-to-text-converter"
      faq={[
        {
          question: 'What makes this converter different?',
          answer: 'Our converter runs the Tesseract OCR engine entirely in your browser, so nothing is uploaded. It requires no signup, and processes images instantly for English text.',
        },
        {
          question: 'Can I convert multiple images at once?',
          answer: 'Currently, you can convert one image at a time. However, the history feature saves your last 20 conversions, making it easy to work with multiple images in sequence.',
        },
        {
          question: 'Does it support non-English text?',
          answer: 'Not yet. This tool loads the English model only, so text in other languages will be misread.',
        },
      ]}
    />
  );
}
