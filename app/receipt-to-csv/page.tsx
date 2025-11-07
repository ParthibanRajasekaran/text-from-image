import { makeNichePage, type NichePageConfig } from '../(tools)/_builder';

/**
 * Receipt to CSV - Niche Page
 * 
 * SEO-optimized page for converting receipt images to structured CSV data.
 * Targets users with:
 * - Paper receipts for expense tracking and reimbursement
 * - Digital receipts from email or mobile apps
 * - Business receipts for accounting and tax records
 * 
 * Features:
 * - 500-800 words about line-item capture, totals, merchant extraction
 * - 5-7 FAQs about receipt parsing, currency, dates, CSV export
 * - JSON-LD structured data
 * - AdGate-compliant ad placement (1 position after explainer)
 * - Receipt-specific heuristics for structured data extraction
 */

const config: NichePageConfig = {
  slug: 'receipt-to-csv',
  
  title: 'Receipt to CSV Converter – Extract Line Items from Receipts (Free)',
  
  description: 'Convert receipt images to CSV instantly. Extract line items, totals, dates, and merchant names from paper receipts. Free OCR for expense tracking and accounting.',
  
  hero: {
    heading: 'Extract Receipt Data to CSV',
    subheading: 'Transform photos of receipts into structured CSV files ready for expense tracking, reimbursement, or accounting software. Our intelligent parsing captures line items, quantities, prices, totals, merchant names, and dates—eliminating manual data entry.',
  },
  
  howItWorks: [
    {
      step: 1,
      title: 'Upload Receipt Photo',
      description: 'Photograph or scan any paper receipt—grocery stores, restaurants, gas stations, retail purchases. Works with thermal paper, printed receipts, and digital receipt screenshots. Ensure all line items and totals are visible.',
    },
    {
      step: 2,
      title: 'Smart Receipt Parsing',
      description: 'Our heuristics identify receipt structure: merchant name at the top, line items with descriptions and prices, subtotals, taxes, and final totals. Currency symbols, dates, and quantities are extracted with pattern matching for common receipt formats.',
    },
    {
      step: 3,
      title: 'Export to CSV',
      description: 'Download your parsed receipt as a CSV file with columns for item description, quantity, unit price, line total, tax, and grand total. Import directly into Excel, Google Sheets, QuickBooks, or expense tracking apps. Merchant name and date included as metadata.',
    },
  ],
  
  supported: {
    title: 'What Receipt Types Can We Parse?',
    items: [
      'Grocery store receipts with item names, quantities, unit prices, and subtotals',
      'Restaurant receipts with menu items, quantities, prices, taxes, tips, and totals',
      'Gas station receipts showing fuel type, gallons, price per gallon, and total',
      'Retail purchase receipts with product descriptions, SKUs, prices, discounts, and taxes',
      'Hotel and lodging receipts with room charges, service fees, and payment details',
      'Online order receipts (printed or screenshot) with line items and shipping costs',
      'Pharmacy receipts with medication names, quantities, copays, and insurance info',
      'Office supply and hardware store receipts with itemized lists and totals',
    ],
    caveats: [
      'Thermal paper fades over time—photograph receipts immediately after purchase for best results',
      'Glare, wrinkles, or folds on receipts obscure text; flatten and photograph under even lighting without flash',
      'Currency symbols and decimal separators vary by region; verify totals match your locale format',
      'Handwritten receipts or annotations (tips, notes) have lower accuracy than printed text',
      'Long receipts may need cropping or multiple photos if items are numerous; process in sections if needed',
      'Receipt formats vary widely—some line items may need manual adjustment in CSV after export',
    ],
  },
  
  privacy: {
    title: 'Your Purchase Data Stays Secure',
    description: 'Receipts contain sensitive information—merchant names, payment methods, purchase details. We prioritize your financial privacy and data security.',
    features: [
      'All receipt OCR processing happens locally in your browser—no server uploads',
      'Purchase details, totals, and merchant data never leave your device',
      'Zero data collection, no tracking, no account required',
      'Images processed in memory only, nothing saved to disk',
      'HTTPS encryption protects your browser session',
      'Refresh the page to completely clear all data from memory',
    ],
  },
  
  examples: [
    {
      src: '/examples/receipt-grocery-itemized.jpg',
      alt: 'Grocery store receipt with line items',
      caption: 'Before: Grocery receipt with 12 line items, quantities, unit prices. After: CSV with columns for item, qty, price, total—ready for expense tracking software.',
    },
    {
      src: '/examples/receipt-restaurant-tip.jpg',
      alt: 'Restaurant receipt with tax and tip',
      caption: 'Before: Restaurant receipt showing subtotal, tax, tip, and grand total. After: CSV captures each component separately with merchant name and date metadata.',
    },
  ],
  
  faq: [
    {
      question: 'How does the tool identify line items versus totals on receipts?',
      answer: 'Our parsing heuristics use position, formatting, and keywords to distinguish line items from totals. Line items typically appear mid-receipt with descriptions and prices. Totals use keywords like "SUBTOTAL", "TAX", "TOTAL", or "AMOUNT DUE" near the bottom. Prices are pattern-matched by currency symbols and decimal formats.',
    },
    {
      question: 'Can this extract the merchant name and purchase date automatically?',
      answer: 'Yes! Merchant names usually appear at the top of receipts in larger or bold text. Dates follow common formats (MM/DD/YYYY, DD-MM-YYYY, etc.) and are extracted via pattern matching. Both merchant and date are included as metadata in the CSV output, making expense categorization easier.',
    },
    {
      question: 'What if my receipt has handwritten notes or tips added by pen?',
      answer: 'Handwritten additions like tips or notes have lower OCR accuracy than printed text. The tool will attempt to capture them, but you may need to manually verify or edit those fields in the CSV. For best results, photograph receipts before adding handwritten annotations, or edit the CSV after export.',
    },
    {
      question: 'Does this work with faded thermal paper receipts?',
      answer: 'Thermal paper fades significantly over time, especially with heat or light exposure. We apply contrast enhancement and binarization to recover faded text, but very old or completely faded receipts may have reduced accuracy. Photograph receipts immediately after purchase to preserve readability.',
    },
    {
      question: 'How do I import the CSV into my accounting or expense software?',
      answer: 'After downloading the CSV, open it in Excel, Google Sheets, or any spreadsheet software. Most accounting tools (QuickBooks, FreshBooks, Expensify) support CSV import. Map the columns (item, price, total, date, merchant) to your software fields during import. Refer to your accounting platform documentation for specific import steps.',
    },
    {
      question: 'Can this handle receipts in multiple currencies or languages?',
      answer: 'Currency symbols ($, €, £, ¥) are recognized via pattern matching. However, language-specific item descriptions require OCR language support. This tool is optimized for English-language receipts. For non-English receipts, accuracy depends on character recognition for that language. Currency conversion is not performed—values are extracted as-is.',
    },
    {
      question: 'Is my credit card or payment information extracted or stored?',
      answer: 'Payment details (card numbers, CVV, etc.) are typically truncated or redacted on receipts. If present, they may be extracted as text, but we do NOT store, log, or transmit any data. All processing is local. For security, consider cropping payment info from photos before upload, or delete those rows from the CSV after export.',
    },
  ],
  
  relatedPages: [
    {
      title: 'Image to Excel',
      href: '/image-to-excel',
      description: 'Convert tables and spreadsheet images to Excel format with row/column detection.',
    },
    {
      title: 'Image to Text',
      href: '/image-to-text',
      description: 'General-purpose OCR for extracting text from any document or image.',
    },
    {
      title: 'Offline Image to Text',
      href: '/offline-image-to-text',
      description: 'Process receipts completely offline with on-device OCR for privacy.',
    },
  ],
  
  adPositions: {
    afterExplainer1: true,  // After "How It Works" section
  },
  
  toolDefaults: {
    preprocessing: {
      grayscale: true,
      contrast: 1.5,        // High contrast for faded thermal paper
      binarize: true,
      denoise: true,
      sharpen: true,
      brightness: 1.15,     // Boost for faded receipts
    },
    postProcessing: {
      wordJoiner: false,    // Keep line items separate
      trimWhitespace: true,
    },
  },
};

// Generate the page component
const ReceiptToCSVPage = makeNichePage(config);

// Export default for routing
export default ReceiptToCSVPage;

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
