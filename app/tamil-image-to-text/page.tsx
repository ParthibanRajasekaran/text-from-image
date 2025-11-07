import { makeNichePage, type NichePageConfig } from '../(tools)/_builder';

/**
 * Tamil Image to Text - Niche Page
 * 
 * SEO-optimized page for converting Tamil script images to editable text.
 * Targets users with:
 * - Tamil newspapers, magazines, books, documents
 * - Printed Tamil text from photos or scans
 * - Tamil handwritten notes or signage
 * 
 * Features:
 * - 500-800 words about Tamil OCR, script recognition, optional translation
 * - 5-7 FAQs about Tamil characters, diacritics, font support
 * - JSON-LD structured data
 * - AdGate-compliant ad placement
 * - Tamil-specific language hint preset for better accuracy
 */

const config: NichePageConfig = {
  slug: 'tamil-image-to-text',
  
  title: 'Tamil Image to Text Converter – OCR for Tamil Script (Free)',
  
  description: 'Convert Tamil images to editable text instantly. Extract Tamil script from photos, documents, and books. Free OCR with native character recognition and optional translation.',
  
  hero: {
    heading: 'Extract Tamil Text from Images',
    subheading: 'Transform photos of Tamil documents, books, newspapers, and signage into editable Unicode text. Our Tamil OCR recognizes native script characters, diacritics, and ligatures—preserving the beauty of தமிழ் language with accurate digital conversion.',
  },
  
  howItWorks: [
    {
      step: 1,
      title: 'Upload Tamil Image',
      description: 'Photograph or scan any document with Tamil script—newspapers, books, letters, posters, or handwritten notes. Works with printed Tamil fonts (Latha, Bamini, TAM, Unicode) and clear handwriting in Tamil.',
    },
    {
      step: 2,
      title: 'Tamil Script Recognition',
      description: 'Our OCR engine is pre-configured with Tamil language hints, recognizing அ-ஃ vowels, க-ன consonants, and compound characters with diacritics (ஸ்ரீ, கௌ, நீ). Ligatures and conjuncts are preserved in Unicode output.',
    },
    {
      step: 3,
      title: 'Copy or Translate',
      description: 'Download extracted Tamil text in Unicode format, ready to paste into Word, Google Docs, or any Unicode-compatible editor. Optional: use translation tools to convert Tamil to English, Hindi, or other languages while preserving original text.',
    },
  ],
  
  supported: {
    title: 'What Tamil Content Can We Extract?',
    items: [
      'Tamil newspapers and magazines with printed Tamil fonts',
      'Tamil books, novels, poetry, and literary works in various fonts',
      'Government documents, certificates, and official Tamil papers',
      'Tamil signage, posters, advertisements, and banners',
      'Educational materials: Tamil textbooks, worksheets, exam papers',
      'Handwritten Tamil notes, letters, and personal documents (print-style)',
      'Tamil subtitles from screenshots or video frames',
      'Religious texts: திருக்குறள் (Thirukkural), பாடல்கள் (songs), mantras',
    ],
    caveats: [
      'Tamil script has 247 characters including vowels, consonants, and compound forms—complex ligatures may need review',
      'Font quality affects accuracy; modern Unicode Tamil fonts (Latha, Noto Sans Tamil) work best, while older Bamini or TAM fonts may have conversion quirks',
      'Diacritics and vowel marks (மாத்திரைகள்) must be clearly visible; faded or blurred marks reduce accuracy',
      'Handwritten Tamil requires consistent stroke formation; highly stylized or cursive Tamil has lower recognition rates',
      'Mixed Tamil-English text is supported, but switching between scripts may introduce spacing or alignment issues',
      'Ancient Tamil scripts (தமிழ் பிராமி, வட்டெழுத்து) are not supported; this tool focuses on modern printed Tamil',
    ],
  },
  
  privacy: {
    title: 'Your Tamil Documents Stay Private',
    description: 'Tamil text often includes personal letters, official documents, or religious content. We ensure complete confidentiality for your Tamil language data.',
    features: [
      'All Tamil OCR processing happens locally in your browser—no server uploads',
      'Tamil documents, letters, and certificates never leave your device',
      'Zero data collection, no tracking, no account required',
      'Images processed in memory only, nothing saved to disk',
      'HTTPS encryption protects your browser session',
      'Refresh the page to completely clear all data from memory',
    ],
  },
  
  examples: [
    {
      src: '/examples/tamil-newspaper-headline.jpg',
      alt: 'Tamil newspaper headline with clear print',
      caption: 'Before: Tamil newspaper headline in standard font. After: Unicode text வணக்கம் (Vanakkam) extracted with diacritics preserved, ready for editing or translation.',
    },
    {
      src: '/examples/tamil-book-page.jpg',
      alt: 'Page from Tamil book with compound characters',
      caption: 'Before: Tamil book page with ligatures and conjuncts. After: Compound characters like ஸ்ரீ (Shri) and கௌ (Kau) recognized accurately in Unicode format.',
    },
    {
      src: '/examples/tamil-handwritten-note.jpg',
      alt: 'Handwritten Tamil note with print-style letters',
      caption: 'Before: Handwritten Tamil note with clear strokes. After: Print-style Tamil characters converted to Unicode, though cursive or stylized forms may need manual review.',
    },
  ],
  
  faq: [
    {
      question: 'Does this tool support all Tamil Unicode characters and diacritics?',
      answer: 'Yes! Our Tamil OCR recognizes the full Unicode Tamil block (U+0B80–U+0BFF), including all 12 vowels (அ-ஔ), 18 consonants (க-ன), 216+ compound characters, and diacritics (மாத்திரைகள்). Ligatures and conjuncts are preserved in the output, ensuring accurate digital representation of Tamil script.',
    },
    {
      question: 'Can I translate the extracted Tamil text to English or other languages?',
      answer: 'This tool extracts Tamil text in Unicode format. For translation, copy the extracted text and paste it into translation services like Google Translate, Microsoft Translator, or Tamil-specific tools. The Unicode output is compatible with all major translation platforms, preserving Tamil script integrity during translation.',
    },
    {
      question: 'What Tamil fonts work best for OCR accuracy?',
      answer: 'Modern Unicode Tamil fonts like Latha, Noto Sans Tamil, Bamini Unicode, and Arima Madurai provide the best accuracy. Older non-Unicode fonts (TAM, Vanavil) may have character mapping issues. If your document uses legacy fonts, consider converting the font to Unicode before photographing, or expect to manually review extracted text.',
    },
    {
      question: 'Does this work with handwritten Tamil or only printed text?',
      answer: 'Both printed and handwritten Tamil are supported. Printed Tamil in standard fonts has very high accuracy. Handwritten Tamil works if strokes are clear and print-style (not highly cursive or stylized). For best results with handwriting, use consistent character formation, leave space between words, and ensure good lighting when photographing.',
    },
    {
      question: 'Can I extract Tamil text from mixed Tamil-English documents?',
      answer: 'Yes, mixed-language documents are supported. The OCR automatically detects and switches between Tamil and English (Latin) scripts. However, spacing and alignment at script boundaries may need manual adjustment. For purely Tamil documents, accuracy is higher than mixed-script content.',
    },
    {
      question: 'How do I type or edit the extracted Tamil text after copying it?',
      answer: 'The extracted text is in Unicode Tamil format. Paste it into any Unicode-compatible editor: Microsoft Word, Google Docs, LibreOffice, or text editors with Tamil input support. To type additional Tamil text, enable Tamil keyboard input on your device (Windows: Tamil99, Mac: Tamil, Android/iOS: Tamil keyboard). The extracted Unicode text will blend seamlessly with your typing.',
    },
    {
      question: 'Is my personal Tamil correspondence or religious text data stored?',
      answer: 'Absolutely not. All Tamil OCR processing is client-side in your browser. Personal letters, religious texts (திருக்குறள், பாடல்கள்), or official documents never reach our servers. No storage, no logging, no tracking. Your Tamil language content remains completely private on your device.',
    },
  ],
  
  relatedPages: [
    {
      title: 'Arabic Image to Text',
      href: '/arabic-image-to-text',
      description: 'OCR tool specialized for Arabic script with RTL rendering and ligature support.',
    },
    {
      title: 'Image to Text',
      href: '/image-to-text',
      description: 'General-purpose OCR supporting multiple languages and scripts.',
    },
    {
      title: 'Offline Image to Text',
      href: '/offline-image-to-text',
      description: 'Process Tamil documents completely offline for maximum privacy.',
    },
  ],
  
  adPositions: {
    afterExplainer1: true,  // After "How It Works" section
  },
  
  toolDefaults: {
    preprocessing: {
      grayscale: true,
      contrast: 1.3,
      binarize: true,
      denoise: true,
      sharpen: true,
      brightness: 1.0,
    },
    postProcessing: {
      wordJoiner: false,    // Keep Tamil words separate for proper Unicode
      trimWhitespace: true,
    },
  },
};

// Generate the page component
const TamilImageToTextPage = makeNichePage(config);

// Export default for routing
export default TamilImageToTextPage;

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
