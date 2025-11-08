import { IntentPage } from '../components/v3/IntentPage';

/**
 * Copy Text from Image page
 * SEO-optimized route for /copy-text-from-image
 */
export default function CopyTextFromImage() {
  return (
    <IntentPage
      title="Copy Text from Image - Free Online OCR"
      description="Copy text from any image instantly using our free OCR tool. Extract and copy text from photos, screenshots, and scanned documents."
      heading="Copy Text from Image"
      subheading="Extract and copy text from images in seconds. Supports JPG, PNG, WEBP, and more."
      keywords={['copy text from image', 'image to text', 'ocr copy', 'extract text', 'photo to text']}
      canonicalUrl="https://freetextfromimage.com/copy-text-from-image"
      faq={[
        {
          question: 'How do I copy text from an image?',
          answer: 'Upload your image, extract the text, and click the Copy button or use the C key to copy the result to your clipboard.',
        },
        {
          question: 'Is the copied text accurate?',
          answer: 'Our OCR achieves high accuracy for printed text. For best results, use clear, high-resolution images.',
        },
        {
          question: 'Can I copy text from handwritten notes?',
          answer: 'Yes, but accuracy may vary. Clear handwriting and good lighting improve results.',
        },
      ]}
    />
  );
}
