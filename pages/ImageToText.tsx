import { useEffect } from 'react';
import App from '../App';

/**
 * Image to Text page
 * SEO-optimized route for /image-to-text
 */
export default function ImageToText() {
  useEffect(() => {
    // Update page metadata
    document.title = 'Image to Text - Free Online OCR Converter';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Convert images to text instantly with our free online OCR tool. Extract text from JPG, PNG, and WEBP images with high accuracy.'
      );
    }
  }, []);

  return <App />;
}
