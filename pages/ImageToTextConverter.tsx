import { useEffect } from 'react';
import App from '../App';

/**
 * Image to Text Converter page
 * SEO-optimized route for /image-to-text-converter
 */
export default function ImageToTextConverter() {
  useEffect(() => {
    // Update page metadata
    document.title = 'Image to Text Converter - Free OCR Tool Online';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Free image to text converter. Upload any image and extract text instantly using advanced OCR technology. No registration required.'
      );
    }
  }, []);

  return <App />;
}
