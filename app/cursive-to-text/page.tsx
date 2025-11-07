import { makeNichePage, type NichePageConfig } from '../(tools)/_builder';

/**
 * Cursive to Text - Niche Page
 * 
 * SEO-optimized page for converting cursive handwriting to digital text.
 * Targets users with:
 * - Cursive letters, personal correspondence
 * - Historical documents, old journals
 * - Elegant calligraphy, wedding invitations
 * 
 * Features:
 * - 450-700 words of unique publisher content
 * - 5-7 realistic FAQs about cursive challenges
 * - JSON-LD structured data
 * - AdGate-compliant ad placement
 * - Cursive-specific tool defaults
 */

const config: NichePageConfig = {
  slug: 'cursive-to-text',
  
  title: 'Cursive to Text Converter (Free AI OCR) – TextFromImage',
  
  description: 'Convert cursive handwriting to digital text with AI-powered OCR. Extract text from cursive letters, journals, and calligraphy. Free tool, works in browser.',
  
  hero: {
    heading: 'Convert Cursive Handwriting to Text',
    subheading: 'Advanced AI-powered OCR designed for connected cursive writing. Extract text from elegant handwriting, old letters, and flowing script—accurately and privately.',
  },
  
  howItWorks: [
    {
      step: 1,
      title: 'Upload Cursive Image',
      description: 'Drop a photo or scan of your cursive writing. Our system works with letters, journals, invitations, or historical documents with flowing script.',
    },
    {
      step: 2,
      title: 'AI Analysis',
      description: 'Specialized cursive recognition analyzes letter joins, baseline flow, and character spacing. Our algorithm adapts to different slant angles and writing styles.',
    },
    {
      step: 3,
      title: 'Review & Edit',
      description: 'Get your extracted text instantly. Review the results, make corrections if needed, then copy or download. Perfect for digitizing old correspondence.',
    },
  ],
  
  supported: {
    title: 'What Types of Cursive Work Best?',
    items: [
      'Traditional cursive handwriting with consistent letter joins',
      'Personal letters and correspondence with flowing script',
      'Journal entries and diary pages written in cursive',
      'Vintage documents and historical manuscripts',
      'Wedding invitations and calligraphy with elegant loops',
      'Signatures and autographs (longer text works better)',
      'Cursive notes on lined or unlined paper',
    ],
    caveats: [
      'Legible cursive produces the best results—highly stylized or decorative scripts may have lower accuracy',
      'Consistent slant angle improves recognition; extreme variations can reduce success rate',
      'Well-defined letter connections help; overly tight or messy joins may cause confusion',
      'Faded ink or low-contrast writing (pencil on yellowed paper) needs good lighting and scanning',
      'Mixed cursive and print in the same line can sometimes confuse character boundaries',
      'Very small cursive text requires high-resolution scans (minimum 300 DPI recommended)',
    ],
  },
  
  privacy: {
    title: 'Your Personal Letters Stay Private',
    description: 'Cursive writing often contains deeply personal content. We built this tool with privacy as the foundation—your letters, journals, and documents never leave your device.',
    features: [
      'Complete local processing—no text is sent to external servers',
      'Images stay in your browser memory and are never uploaded',
      'No account creation, no email collection, no tracking',
      'Optional history saved locally in your browser only (you control deletion)',
      'Secure HTTPS connection protects your session',
      'Open your browser developer tools to verify: zero network requests to our servers during processing',
    ],
  },
  
  examples: [
    {
      src: '/examples/cursive-letter-vintage.jpg',
      alt: 'Vintage cursive letter with flowing script',
      caption: 'Before: Vintage letter with elegant cursive. After: Character spacing inference detects word boundaries despite tight letter joins.',
    },
    {
      src: '/examples/cursive-journal-entry.jpg',
      alt: 'Cursive journal entry on lined paper',
      caption: 'Before: Journal entry with consistent baseline. After: Slant correction and baseline tracking handle continuous flowing text accurately.',
    },
    {
      src: '/examples/cursive-wedding-invitation.jpg',
      alt: 'Cursive calligraphy on wedding invitation',
      caption: 'Before: Decorative cursive calligraphy with loops. After: AI distinguishes decorative flourishes from actual letter forms.',
    },
    {
      src: '/examples/cursive-faded-note.jpg',
      alt: 'Faded cursive note with low contrast',
      caption: 'Before: Faded pencil cursive on aged paper. After: Contrast enhancement and adaptive thresholding recover legible text.',
    },
  ],
  
  faq: [
    {
      question: 'Why is cursive harder to read than print for OCR?',
      answer: 'Cursive writing connects letters together, making it difficult to determine where one character ends and another begins. Print has clear spacing between letters. Additionally, cursive varies greatly between individuals—slant, loop size, and letter formation differ, while print is more standardized. Our AI uses character spacing inference to predict word boundaries in connected writing.',
    },
    {
      question: 'Can this tool read very old or historical cursive documents?',
      answer: 'Yes, but with caveats. Historical documents often have unique challenges: faded ink, aged paper discoloration, archaic letter forms (like long s), and stylistic variations from older writing systems. For best results, scan at high resolution (600 DPI or more) with good lighting. You may need to manually correct some characters, especially uncommon historical letterforms.',
    },
    {
      question: 'What if the cursive has a strong slant or unusual baseline?',
      answer: 'Our tool handles moderate slant angles automatically. Extreme forward or backward slants may reduce accuracy but still produce usable results. Uneven baselines (wavy lines) are more challenging than straight baselines. If possible, scan the document aligned with the cursive baseline for best results.',
    },
    {
      question: 'Does this work with signatures or very short cursive text?',
      answer: 'Signatures are extremely difficult for OCR because they are often highly stylized, compressed, and unique. Longer cursive text (sentences or paragraphs) works much better because the algorithm can learn patterns from context. For signatures, expect limited success unless the signature is very clear and legible.',
    },
    {
      question: 'How do I improve accuracy for messy or rushed cursive?',
      answer: 'Messy cursive is inherently challenging. To improve results: use the highest resolution scan possible, ensure even lighting without glare, adjust the image to maximize contrast between ink and paper, and be prepared to manually edit the output. Sometimes breaking the text into smaller sections (one line at a time) can help.',
    },
    {
      question: 'Is my cursive handwriting analyzed or stored for training?',
      answer: 'Absolutely not. All OCR processing happens locally in your browser using open-source models. Your images and text never reach our servers, and we do not collect or store any handwriting data. This tool is designed for privacy—your personal letters remain completely private.',
    },
    {
      question: 'Can I use this for cursive in languages other than English?',
      answer: 'Currently, our cursive recognition is optimized for English cursive letterforms. Other Latin-based languages (French, Spanish, Italian) may work with varying accuracy, especially if the cursive style is similar. Non-Latin scripts with cursive forms (Arabic, Cyrillic) are not yet supported. Accuracy depends on how closely the writing resembles English cursive patterns.',
    },
  ],
  
  relatedPages: [
    {
      title: 'Handwriting to Text',
      href: '/handwriting-to-text',
      description: 'General handwriting OCR for print and cursive notes, forms, and documents.',
    },
    {
      title: 'Handwritten Math to LaTeX',
      href: '/handwritten-math-to-latex',
      description: 'Convert handwritten mathematical equations to LaTeX with symbol recognition.',
    },
    {
      title: 'Offline Image to Text',
      href: '/offline-image-to-text',
      description: 'Process handwritten notes completely offline with on-device OCR for privacy.',
    },
  ],
  
  adPositions: {
    afterExplainer1: true,  // After "How it works"
  },
  
  toolDefaults: {
    preprocessing: {
      grayscale: true,
      contrast: 1.4,        // Higher contrast for cursive
      binarize: true,       // Strong binarization for letter detection
      denoise: true,
      sharpen: true,
      brightness: 1.1,      // Slight brightness boost for faded text
    },
    postProcessing: {
      wordJoiner: true,     // Critical for cursive word boundaries
      trimWhitespace: true,
    },
  },
};

// Generate the page component
const CursiveToTextPage = makeNichePage(config);

// Export default for routing
export default CursiveToTextPage;

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
