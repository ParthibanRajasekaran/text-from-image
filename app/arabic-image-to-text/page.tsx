import { makeNichePage, type NichePageConfig } from '../(tools)/_builder';

/**
 * Arabic Image to Text - Niche Page
 * 
 * SEO-optimized page for converting Arabic script images to editable text.
 * Targets users with:
 * - Arabic newspapers, books, documents, certificates
 * - Printed or digital Arabic text from screenshots
 * - Arabic signage, posters, or handwritten notes
 * 
 * Features:
 * - 500-800 words about Arabic OCR, RTL rendering, ligatures
 * - 5-7 FAQs about Arabic script, diacritics, fonts
 * - JSON-LD structured data
 * - AdGate-compliant ad placement (after content only)
 * - RTL (right-to-left) result rendering for proper Arabic display
 */

const config: NichePageConfig = {
  slug: 'arabic-image-to-text',
  
  title: 'Arabic Image to Text Converter – OCR for Arabic Script (Free)',
  
  description: 'Convert Arabic images to editable text instantly. Extract Arabic script from photos, documents, and books. Free OCR with RTL rendering, ligature support, and Unicode output.',
  
  hero: {
    heading: 'Extract Arabic Text from Images',
    subheading: 'Transform photos of Arabic documents, books, newspapers, and signage into editable Unicode text. Our Arabic OCR recognizes right-to-left script, complex ligatures, and diacritical marks—preserving the elegance of العربية (al-ʿArabīyah) with accurate digital conversion.',
  },
  
  howItWorks: [
    {
      step: 1,
      title: 'Upload Arabic Image',
      description: 'Photograph or scan any document with Arabic script—newspapers, books, certificates, posters, or handwritten notes. Works with printed Arabic fonts (Traditional Arabic, Simplified Arabic, Naskh, Kufi) and clear handwritten styles.',
    },
    {
      step: 2,
      title: 'Arabic Script Recognition with Ligatures',
      description: 'Our OCR engine recognizes Arabic letters (ا–ي), diacritics (فَتْحَة, كَسْرَة, ضَمَّة), and complex ligatures where characters connect based on position (initial, medial, final, isolated). Context-aware processing handles شَدَّة (shadda) and تَنْوِين (tanween).',
    },
    {
      step: 3,
      title: 'RTL Text Output',
      description: 'Extracted text is rendered right-to-left (RTL) with proper Unicode Arabic formatting. Copy directly to Word, Google Docs, or any RTL-compatible editor. Ligatures and diacritics are preserved, ensuring authentic Arabic text representation.',
    },
  ],
  
  supported: {
    title: 'What Arabic Content Can We Extract?',
    items: [
      'Arabic newspapers and news websites (screenshots) with modern fonts',
      'Arabic books, novels, poetry, and classical literature in various scripts',
      'Official documents: certificates, contracts, government papers in Arabic',
      'Arabic signage, advertisements, posters, and banners',
      'Educational materials: Arabic textbooks, worksheets, Quran verses',
      'Handwritten Arabic notes, letters, and calligraphy (clear styles only)',
      'Arabic subtitles from video screenshots or streaming services',
      'Religious texts: Quran, Hadith, دُعَاء (prayers) with diacritics',
    ],
    caveats: [
      'Arabic ligatures connect letters based on position—OCR must infer context, which can introduce errors in complex combinations',
      'Diacritical marks (حَرَكَات - Tashkeel) are optional in modern Arabic; faded or missing diacritics cannot be inferred automatically',
      'Font style affects accuracy: Naskh and Simplified Arabic fonts work best, while decorative or calligraphic fonts (Diwani, Thuluth) have lower accuracy',
      'Handwritten Arabic requires consistent character formation; highly cursive or stylized calligraphy has reduced recognition rates',
      'Mixed Arabic-English text is supported, but RTL/LTR switching may cause spacing or alignment issues in the output',
      'Ancient Arabic scripts (Kufic, Maghrebi) or regional dialects with unique characters may not be fully supported',
    ],
  },
  
  privacy: {
    title: 'Your Arabic Documents Stay Confidential',
    description: 'Arabic text often includes personal correspondence, official documents, or religious content. We prioritize complete privacy for your Arabic language data.',
    features: [
      'All Arabic OCR processing happens locally in your browser—no server uploads',
      'Arabic documents, certificates, and letters never leave your device',
      'Zero data collection, no tracking, no account required',
      'Images processed in memory only, nothing saved to disk',
      'HTTPS encryption protects your browser session',
      'Refresh the page to completely clear all data from memory',
    ],
  },
  
  examples: [
    {
      src: '/examples/arabic-newspaper-headline.jpg',
      alt: 'Arabic newspaper headline with clear print',
      caption: 'Before: Arabic newspaper headline in Simplified Arabic font. After: RTL Unicode text مرحبا (Marhaba) extracted with proper right-to-left rendering and ligatures preserved.',
    },
    {
      src: '/examples/arabic-quran-verse.jpg',
      alt: 'Quranic verse with diacritics',
      caption: 'Before: Quran verse with diacritical marks (fatḥa, kasra, ḍamma). After: Unicode Arabic with tashkeel حَرَكَات recognized, suitable for religious study or citation.',
    },
    {
      src: '/examples/arabic-handwritten-note.jpg',
      alt: 'Handwritten Arabic note with Naskh style',
      caption: 'Before: Handwritten Arabic in clear Naskh-style strokes. After: RTL text converted to Unicode, though highly cursive or calligraphic styles may need manual review.',
    },
  ],
  
  faq: [
    {
      question: 'How does the tool handle Arabic ligatures and connected letters?',
      answer: 'Arabic letters change shape based on position (initial, medial, final, isolated). Our OCR analyzes character context to recognize ligatures where letters connect. For example, ل + ا becomes the ligature لا (lam-alif). The output is Unicode Arabic text where ligatures are preserved, and RTL rendering displays them correctly in compatible editors.',
    },
    {
      question: 'Does this support Arabic diacritics like fatḥa, kasra, and ḍamma?',
      answer: 'Yes, if diacritical marks (حَرَكَات - Tashkeel) are visible in the image, they are extracted. Diacritics like فَتْحَة (fatḥa), كَسْرَة (kasra), ضَمَّة (ḍamma), شَدَّة (shadda), and تَنْوِين (tanween) are recognized. However, modern Arabic often omits diacritics—the OCR cannot infer missing marks; it only extracts what is printed.',
    },
    {
      question: 'What does RTL (right-to-left) rendering mean for Arabic text?',
      answer: 'RTL rendering displays Arabic text flowing from right to left, as Arabic is naturally written. After extraction, the text is formatted with Unicode RTL markers, ensuring proper display in Word, Google Docs, or web browsers. If you paste into a non-RTL editor, you may need to enable RTL text direction in the editor settings.',
    },
    {
      question: 'Can I extract Arabic text from mixed Arabic-English documents?',
      answer: 'Yes, mixed-language documents are supported. The OCR detects and switches between Arabic (RTL) and English (LTR) scripts. However, bidirectional text can cause spacing or alignment issues at script boundaries. For best results, process purely Arabic or purely English sections separately, or manually adjust formatting after extraction.',
    },
    {
      question: 'What Arabic fonts work best for OCR accuracy?',
      answer: 'Modern Unicode Arabic fonts like Simplified Arabic, Traditional Arabic, Naskh, and Arial Unicode MS provide the best accuracy. Decorative or calligraphic fonts (Diwani, Thuluth, Maghrebi Kufi) have lower recognition rates due to stylistic embellishments. If your document uses a decorative font, expect to review and correct the extracted text manually.',
    },
    {
      question: 'Does this work with handwritten Arabic or calligraphy?',
      answer: 'Printed Arabic has the highest accuracy. Handwritten Arabic works if strokes are clear and follow standard Naskh or Ruq\'ah styles. Highly cursive, stylized calligraphy, or artistic Arabic scripts have reduced accuracy. For calligraphy, consider consulting an Arabic language expert to verify extracted text, as decorative flourishes can confuse OCR.',
    },
    {
      question: 'Is my personal Arabic correspondence or religious text data stored?',
      answer: 'Absolutely not. All Arabic OCR processing is client-side in your browser. Personal letters, religious texts (Quran, Hadith, دُعَاء), or official documents never reach our servers. No storage, no logging, no tracking. Your Arabic language content remains completely private on your device.',
    },
  ],
  
  relatedPages: [
    {
      title: 'Tamil Image to Text',
      href: '/tamil-image-to-text',
      description: 'OCR tool specialized for Tamil script with Unicode support.',
    },
    {
      title: 'Image to Text',
      href: '/image-to-text',
      description: 'General-purpose OCR supporting multiple languages and scripts.',
    },
    {
      title: 'Offline Image to Text',
      href: '/offline-image-to-text',
      description: 'Process Arabic documents completely offline for maximum privacy.',
    },
  ],
  
  adPositions: {
    afterExplainer2: true,  // After "Supported" section (ad only after content)
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
      wordJoiner: false,    // Keep Arabic words separate for proper Unicode
      trimWhitespace: true,
    },
  },
};

// Generate the page component
const ArabicImageToTextPage = makeNichePage(config);

// Export default for routing
export default ArabicImageToTextPage;

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
