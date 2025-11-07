import { useEffect } from 'react';
import App from '../App';

/**
 * JPG to Word page
 * SEO-optimized route for /jpg-to-word
 */
export default function JpgToWord() {
  useEffect(() => {
    // Update page metadata
    document.title = 'JPG to Word - Convert Images to Editable Text';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Convert JPG images to Word-ready text. Extract text from photos and images, then download as TXT or copy to your document.'
      );
    }
  }, []);

  return <App />;
}
