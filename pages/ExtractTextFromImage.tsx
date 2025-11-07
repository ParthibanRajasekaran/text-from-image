import { useEffect } from 'react';
import App from '../App';

/**
 * Extract Text from Image page
 * SEO-optimized route for /extract-text-from-image
 */
export default function ExtractTextFromImage() {
  useEffect(() => {
    // Update page metadata
    document.title = 'Extract Text from Image - Free Online OCR';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Extract text from any image online for free. Supports JPG, PNG, WEBP. Advanced OCR technology with high accuracy. No upload limits.'
      );
    }
  }, []);

  return <App />;
}
