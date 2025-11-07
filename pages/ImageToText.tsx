import { IntentPage } from '../components/v3/IntentPage';

/**
 * Image to Text page
 * SEO-optimized route for /image-to-text
 */
export default function ImageToText() {
  return (
    <IntentPage
      title="Image to Text Converter - Free Online OCR Tool"
      description="Convert any image to text instantly with our free AI-powered OCR tool. Extract text from JPG, PNG, WEBP, and PDF files with high accuracy. No signup required."
      heading="Convert Image to Text"
      subheading="AI-powered OCR that extracts text from images in seconds. Supports JPG, PNG, WEBP, and more."
      keywords={['image to text', 'OCR', 'photo to text', 'convert image', 'extract text', 'image converter']}
      canonicalUrl="https://freetextfromimage.com/image-to-text"
      faq={[
        {
          question: 'How does the image to text converter work?',
          answer: 'Our OCR (Optical Character Recognition) tool uses advanced AI models to analyze your image and extract all readable text. Simply upload an image, and our system will process it in seconds, identifying text with high accuracy.',
        },
        {
          question: 'What image formats are supported?',
          answer: 'We support all common image formats including JPG, JPEG, PNG, WEBP, GIF, and BMP. For best results, use high-resolution images with clear, readable text.',
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes! All processing happens securely over HTTPS. We do not store your images or extracted text on our servers. Your data is processed in real-time and immediately deleted.',
        },
        {
          question: 'How accurate is the text extraction?',
          answer: 'Our AI-powered OCR achieves 95%+ accuracy for clear, high-quality images with printed text. Accuracy may vary for handwritten text, low-resolution images, or complex layouts.',
        },
        {
          question: 'Is there a file size limit?',
          answer: 'Images up to 10MB are supported. For best performance and accuracy, we recommend images between 500KB and 5MB.',
        },
        {
          question: 'Can I extract text from multiple images?',
          answer: 'Yes! Simply upload one image at a time. Your previous results are saved in the history (accessible via the H key or History button) so you can easily reference past extractions.',
        },
      ]}
    />
  );
}
