import { useEffect } from 'react';
import App from '../App';

/**
 * Image to Excel page
 * SEO-optimized route for /image-to-excel
 */
export default function ImageToExcel() {
  useEffect(() => {
    // Update page metadata
    document.title = 'Image to Excel - Extract Tables and Text from Images';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Extract text from images to use in Excel. Convert screenshots, scanned documents, and photos to editable text for your spreadsheets.'
      );
    }
  }, []);

  return <App />;
}
