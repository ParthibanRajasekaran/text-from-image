import { IntentPage } from '../components/v3/IntentPage';
import { isUXV3Enabled } from '../utils/env';
import App from '../App';

/**
 * JPG to Word page
 * SEO-optimized route for /jpg-to-word
 */
export default function JpgToWord() {
  if (!isUXV3Enabled()) {
    return <App />;
  }

  return (
    <IntentPage
      title="JPG to Word Converter - Extract Text to DOCX Format"
      description="Convert JPG images to Word documents instantly. Extract text from photos and save as editable DOCX files. Free online JPG to Word converter with OCR."
      heading="Convert JPG to Word"
      subheading="Extract text from JPG images and download as Word documents. Perfect for digitizing printed documents."
      keywords={['jpg to word', 'jpg to docx', 'image to word', 'photo to document', 'ocr word', 'convert jpg']}
      canonicalUrl="https://freetextfromimage.com/jpg-to-word"
      faq={[
        {
          question: 'How do I convert JPG to Word?',
          answer: 'Simply upload your JPG image using the dropzone above. Our OCR will extract all text, and you can then download the result as a .txt file which can be opened in Word or converted to DOCX format.',
        },
        {
          question: 'Can I maintain formatting from the original JPG?',
          answer: 'Our tool extracts plain text content. While it preserves the text accurately, complex formatting, images, and layouts need to be adjusted manually in Word after conversion.',
        },
        {
          question: 'Does this work with scanned documents?',
          answer: 'Yes! Our OCR is specifically designed to handle scanned documents. For best results, ensure the scan is clear, well-lit, and at least 300 DPI resolution.',
        },
        {
          question: 'Is the Word document editable?',
          answer: 'Yes, the extracted text is fully editable. You can copy it directly or download as a text file to import into Word, where you can format, edit, and save as a proper DOCX document.',
        },
      ]}
    />
  );
}
