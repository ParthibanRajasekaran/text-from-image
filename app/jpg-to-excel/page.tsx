import ImageToExcelPage from '../image-to-excel/page';

/**
 * JPG to Excel - Alias Route
 * 
 * This is an SEO-optimized alias that redirects to the main
 * image-to-excel page. Users searching for "jpg to excel" will
 * land here, but the content and functionality are identical.
 * 
 * The canonical link points to /image-to-excel to avoid duplicate
 * content penalties and consolidate SEO authority.
 */

// Re-export the same page component
export default ImageToExcelPage;

// Override metadata with JPG-specific keywords and canonical link
export const metadata = {
  title: 'JPG to Excel Converter – Extract Tables from JPG Images (Free)',
  description: 'Convert JPG images of tables to Excel or CSV instantly. Extract data from photo spreadsheets, receipts, and reports. Free OCR with header and cell detection.',
  
  // Canonical link to consolidate SEO authority
  alternates: {
    canonical: '/image-to-excel',
  },
  
  openGraph: {
    title: 'JPG to Excel Converter – Extract Tables from JPG Images (Free)',
    description: 'Convert JPG images of tables to Excel or CSV instantly. Extract data from photo spreadsheets, receipts, and reports. Free OCR with header and cell detection.',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'JPG to Excel Converter – Extract Tables from JPG Images (Free)',
    description: 'Convert JPG images of tables to Excel or CSV instantly. Extract data from photo spreadsheets, receipts, and reports. Free OCR with header and cell detection.',
  },
};
