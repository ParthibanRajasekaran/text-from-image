import { makeNichePage, type NichePageConfig } from '../(tools)/_builder';

/**
 * Image to Excel - Niche Page
 * 
 * SEO-optimized page for converting images of tables to Excel/CSV.
 * Targets users with:
 * - Printed tables, spreadsheets, data grids
 * - Receipts, invoices, financial documents
 * - Reports, statistics, data visualization captures
 * 
 * Features:
 * - 500-800 words of practical table extraction tips
 * - 5-8 FAQs about table structure, merged cells, formatting
 * - JSON-LD structured data
 * - AdGate-compliant ad placement (2 positions)
 * - Table-specific tool defaults
 */

const config: NichePageConfig = {
  slug: 'image-to-excel',
  
  title: 'Image to Excel Converter – Extract Tables from Images (Free)',
  
  description: 'Convert images of tables to Excel or CSV instantly. Extract data from printed spreadsheets, receipts, and reports. Free OCR with header and cell detection.',
  
  hero: {
    heading: 'Extract Tables from Images to Excel',
    subheading: 'Transform photos of spreadsheets, receipts, and data tables into editable Excel or CSV files. Our intelligent table recognition detects borders, headers, and cell structure—making data entry obsolete.',
  },
  
  howItWorks: [
    {
      step: 1,
      title: 'Upload Table Image',
      description: 'Upload a photo or screenshot of any table—spreadsheets, receipts, invoices, or printed reports. Works with bordered tables, grid lines, or even borderless data columns.',
    },
    {
      step: 2,
      title: 'Smart Table Detection',
      description: 'Our algorithm identifies table boundaries, column separators, and row divisions. Header detection automatically distinguishes titles from data. Handles merged cells and multi-line entries.',
    },
    {
      step: 3,
      title: 'Export to Excel or CSV',
      description: 'Download your extracted table as Excel (XLSX) or CSV format. Cell values preserve numbers, currencies, and dates. Copy directly to your spreadsheet or import into any data tool.',
    },
  ],
  
  supported: {
    title: 'What Table Formats Can We Extract?',
    items: [
      'Printed spreadsheets with visible grid lines or borders',
      'Receipts and invoices with itemized line items and totals',
      'Financial statements, balance sheets, and accounting reports',
      'Survey results, statistics tables, and data summaries',
      'Product catalogs with columns for name, price, description',
      'Scientific data tables from research papers or lab reports',
      'Timetables, schedules, and calendar grids with dates',
      'Comparison charts showing features across products or options',
    ],
    caveats: [
      'Clear borders or grid lines significantly improve accuracy—borderless tables need strong column alignment',
      'Glare, shadows, or reflections on glossy paper can obscure cell boundaries; use diffuse lighting when photographing',
      'Skewed or rotated table images reduce detection accuracy; capture tables straight-on when possible',
      'Merged cells (spanning multiple columns/rows) are detected but may need manual adjustment in output',
      'Handwritten tables have lower accuracy than printed; consider using print handwriting page for text-heavy tables',
      'Very small fonts or dense tables (many columns) require high-resolution images (minimum 600 DPI for best results)',
      'Currency symbols, percentages, and special formatting are extracted as text; apply formatting in Excel after import',
    ],
  },
  
  privacy: {
    title: 'Your Financial Data Stays Secure',
    description: 'Tables often contain sensitive information—financial records, personal data, business metrics. We designed this tool for maximum privacy and security.',
    features: [
      'All table extraction happens locally in your browser—no server uploads',
      'Receipt and invoice data never leaves your device',
      'Zero data collection, no tracking, no account required',
      'Images processed in memory only, nothing saved to disk',
      'HTTPS encryption protects your browser session',
      'Refresh the page to completely clear all data from memory',
    ],
  },
  
  examples: [
    {
      src: '/examples/table-spreadsheet-printed.jpg',
      alt: 'Printed spreadsheet with grid lines',
      caption: 'Before: Printed table with clear borders. After: Border detection identifies cells accurately, preserving column alignment and numeric values.',
    },
    {
      src: '/examples/table-receipt-itemized.jpg',
      alt: 'Receipt with itemized list and totals',
      caption: 'Before: Receipt with glare on thermal paper. After: Glare reduction and adaptive thresholding recover line items, quantities, and prices despite reflection.',
    },
    {
      src: '/examples/table-financial-report.jpg',
      alt: 'Financial report with merged header cells',
      caption: 'Before: Balance sheet with merged header cells. After: Header detection recognizes titles, cell merge patterns preserved in structure.',
    },
    {
      src: '/examples/table-borderless-aligned.jpg',
      alt: 'Borderless table with column alignment',
      caption: 'Before: Borderless data table with whitespace separators. After: Column alignment inference detects boundaries using spacing patterns.',
    },
  ],
  
  faq: [
    {
      question: 'Can this tool handle merged cells or cells spanning multiple columns?',
      answer: 'Yes, our table detection algorithm identifies merged cells by analyzing cell boundaries and content flow. However, the output structure may represent merged cells as a single cell with combined content, or multiple cells with repeated values. You may need to manually reapply merge formatting in Excel after import for complex table layouts.',
    },
    {
      question: 'How does the tool distinguish between numbers and text in cells?',
      answer: 'The OCR extracts all cell content as text initially. Numbers, currencies, dates, and percentages are recognized by pattern matching. When exporting to Excel, numeric values are flagged, but final formatting happens in your spreadsheet software. Currency symbols and thousands separators are preserved in the text output.',
    },
    {
      question: 'What if my table has glare or shadows from photography?',
      answer: 'Glare and shadows are common challenges with glossy paper or uneven lighting. Our preprocessing includes glare reduction and adaptive thresholding to recover obscured cells. For best results: photograph tables under diffuse lighting (avoid direct flash), use matte paper when possible, or scan documents instead of photographing them.',
    },
    {
      question: 'Can I extract tables from receipts with poor print quality?',
      answer: 'Receipts, especially thermal paper, often have faded or low-contrast text. We apply contrast enhancement and binarization specifically for receipts. However, very faded receipts may have reduced accuracy. If possible, photograph receipts immediately after printing, before thermal ink fades. High-contrast lighting helps enormously.',
    },
    {
      question: 'Does this work with borderless tables or data separated by spaces?',
      answer: 'Yes, but with caveats. Borderless tables rely on column alignment and whitespace for structure detection. If columns are consistently aligned (like tab-separated data), our algorithm can infer boundaries. However, inconsistent spacing or word-wrapped cells reduce accuracy. Bordered tables always produce better results.',
    },
    {
      question: 'How do I export the extracted table to Excel or CSV?',
      answer: 'After extraction, you will see download buttons for both Excel (XLSX) and CSV formats. XLSX preserves basic cell structure and is ready to open in Microsoft Excel, Google Sheets, or LibreOffice Calc. CSV is a plain-text format compatible with any spreadsheet software or data analysis tool. Choose based on your workflow.',
    },
    {
      question: 'Can this extract tables from scanned PDFs or multi-page documents?',
      answer: 'This tool is designed for single images. If your PDF contains one table per page, convert each page to an image first (using PDF export tools), then upload images individually. For multi-page or multi-table extraction, you will need to process each table separately. We do not currently support batch processing or PDF input directly.',
    },
    {
      question: 'Is my financial data or receipt information stored or analyzed?',
      answer: 'Absolutely not. All table extraction occurs entirely in your browser using local OCR processing. Receipt data, invoice details, and financial tables never reach our servers. No data is stored, logged, or transmitted. Your sensitive information remains completely private on your device.',
    },
  ],
  
  relatedPages: [
    {
      title: 'Receipt to CSV',
      href: '/receipt-to-csv',
      description: 'Extract receipt line items, totals, and merchant details to CSV format.',
    },
    {
      title: 'Image to Text',
      href: '/image-to-text',
      description: 'General-purpose OCR for extracting text from any image or document.',
    },
    {
      title: 'Offline Image to Text',
      href: '/offline-image-to-text',
      description: 'Process spreadsheet photos offline with on-device OCR for complete privacy.',
    },
  ],
  
  adPositions: {
    afterExplainer2: true,  // After "Supported" section
    afterExamples: true,     // After examples gallery
  },
  
  toolDefaults: {
    preprocessing: {
      grayscale: true,
      contrast: 1.3,
      binarize: true,
      denoise: true,
      sharpen: true,
      brightness: 1.05,  // Slight boost for faded receipts
    },
    postProcessing: {
      wordJoiner: false,    // Keep cell boundaries clear
      trimWhitespace: true,
    },
  },
};

// Generate the page component
const ImageToExcelPage = makeNichePage(config);

// Export default for routing
export default ImageToExcelPage;

// Export metadata for SEO
export const metadata = {
  title: config.title,
  description: config.description,
  openGraph: {
    title: config.title,
    description: config.description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: config.title,
    description: config.description,
  },
};
