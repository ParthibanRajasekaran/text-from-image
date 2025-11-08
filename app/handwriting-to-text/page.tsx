import { makeNichePage, type NichePageConfig } from '../(tools)/_builder';

/**
 * Handwriting to Text - Niche Page
 * 
 * SEO-optimized page for converting handwritten notes to digital text.
 * Targets users with:
 * - Handwritten notes, forms, letters
 * - Notebook pages, sticky notes
 * - Whiteboard captures
 * 
 * Features:
 * - 450-700 words of unique publisher content
 * - 6-8 realistic FAQs
 * - JSON-LD structured data
 * - AdGate-compliant ad placement
 */

const config: NichePageConfig = {
  slug: 'handwriting-to-text',
  
  title: 'Handwriting to Text (Free & Fast) – TextFromImage',
  
  description: 'Convert handwritten notes to digital text instantly. Free OCR tool for notebooks, forms, and handwritten documents. Privacy-first processing, no signup needed.',
  
  hero: {
    heading: 'Turn Handwriting into Digital Text',
    subheading: 'Extract text from handwritten notes, forms, and documents in seconds. Our AI-powered OCR makes your handwritten content searchable and editable—privately and for free.',
  },
  
  howItWorks: [
    {
      step: 1,
      title: 'Upload Your Image',
      description: 'Drag and drop a photo of your handwritten note, or paste from clipboard. Supports JPG, PNG, and PDF files up to 20MB.',
    },
    {
      step: 2,
      title: 'Automatic Enhancement',
      description: 'Our system automatically adjusts contrast, removes noise, and optimizes your image for maximum accuracy with handwritten text.',
    },
    {
      step: 3,
      title: 'Copy or Download',
      description: 'Get your text instantly. Copy to clipboard with one click or download as a text file. All processing happens in your browser.',
    },
  ],
  
  supported: {
    title: 'What Handwriting Can We Process?',
    items: [
      'Clear handwritten notes in notebooks or journals',
      'Form fields with printed or cursive handwriting',
      'Sticky notes and Post-it messages',
      'Whiteboard handwriting captured with good lighting',
      'Letters and greeting cards with legible writing',
      'Homework assignments and student notes',
      'Meeting notes and brainstorming sketches with text',
    ],
    caveats: [
      'Best results with clear, well-spaced handwriting',
      'Cursive may have lower accuracy than print—test with a sample first',
      'Very small or tightly packed writing may need higher resolution images',
      'Good lighting and minimal shadows significantly improve results',
      'Currently optimized for English—other languages may vary in accuracy',
    ],
  },
  
  privacy: {
    title: 'Your Privacy Matters',
    description: 'We take your privacy seriously. Your handwritten notes often contain personal information, and we ensure they stay private.',
    features: [
      'All OCR processing happens directly in your browser—no server uploads',
      'Images are never stored or transmitted to external servers',
      'No account required, no tracking, no data collection',
      'Optional local history stored only on your device (can be cleared anytime)',
      'HTTPS encryption protects your browsing session',
      'Delete your data instantly—nothing is saved permanently',
    ],
  },
  
  examples: [
    {
      src: '/examples/handwriting-notebook.jpg',
      alt: 'Handwritten notebook page with clear text',
      caption: 'Notebook pages with clear handwriting in blue ink—ideal conditions for high accuracy extraction.',
    },
    {
      src: '/examples/handwriting-sticky-note.jpg',
      alt: 'Yellow sticky note with handwritten reminder',
      caption: 'Sticky notes and Post-its work well when photographed with good lighting and minimal glare.',
    },
    {
      src: '/examples/handwriting-whiteboard.jpg',
      alt: 'Whiteboard with handwritten meeting notes',
      caption: 'Whiteboard captures can be extracted effectively when lighting is even and text is not too small.',
    },
    {
      src: '/examples/handwriting-cursive-letter.jpg',
      alt: 'Handwritten cursive letter on stationery',
      caption: 'Cursive handwriting is more challenging but can be processed with varying accuracy depending on legibility.',
    },
  ],
  
  faq: [
    {
      question: 'How accurate is handwriting recognition compared to printed text?',
      answer: 'Handwriting recognition is generally less accurate than printed text OCR because handwriting varies significantly between individuals. You can expect 70-85% accuracy with clear handwriting, and 50-70% with cursive or stylized writing. For best results, use high-contrast images with good lighting and well-spaced text.',
    },
    {
      question: 'Does this work with cursive handwriting?',
      answer: 'Yes, but with limitations. Cursive handwriting is more challenging for OCR systems because letters are connected and styles vary greatly. You may see lower accuracy, especially with decorative or very stylized cursive. Print handwriting typically yields better results. We recommend testing with a sample to see if accuracy meets your needs.',
    },
    {
      question: 'What image quality do I need for good results?',
      answer: 'For best results, use images with at least 300 DPI resolution, good lighting without harsh shadows, and clear focus. Hold your phone camera steady and ensure text fills most of the frame. Higher resolution and contrast make a significant difference—blurry or low-light photos will reduce accuracy.',
    },
    {
      question: 'Can I process handwriting in languages other than English?',
      answer: 'Currently, our tool is optimized for English handwriting. While it may work with other Latin-alphabet languages (Spanish, French, German), accuracy may vary. Non-Latin scripts (Chinese, Arabic, etc.) are not yet supported. We are working on expanding language support in future updates.',
    },
    {
      question: 'Is my handwriting data stored or shared anywhere?',
      answer: 'No. All processing happens locally in your browser using client-side OCR technology. Your images and extracted text are never uploaded to our servers or any third-party services. Optional history is stored only in your browser local storage and can be cleared at any time. Your handwriting remains completely private.',
    },
    {
      question: 'Why is the accuracy lower than expected?',
      answer: 'Several factors affect accuracy: unclear handwriting, poor lighting, low image resolution, skewed angles, or decorative fonts. Try improving image quality by using better lighting, holding the camera directly above the text, and ensuring the writing is in focus. Our automatic enhancement helps, but starting with a good photo is key.',
    },
    {
      question: 'Can I edit the extracted text before downloading?',
      answer: 'Yes! Once the text is extracted, you can click into the text area to edit, correct mistakes, or format the content. After making your changes, use the copy or download buttons to save your final text. This is especially useful for correcting any OCR errors in challenging handwriting.',
    },
    {
      question: 'What file formats are supported for handwriting images?',
      answer: 'We support JPG, PNG, WEBP, and PDF files up to 20MB. For photos of handwritten notes, JPG or PNG work best. If you are scanning documents, make sure to save them at sufficient resolution (at least 300 DPI) for optimal text recognition.',
    },
  ],
  
  relatedPages: [
    {
      title: 'Cursive to Text',
      href: '/cursive-to-text',
      description: 'Specialized tool for cursive handwriting with connected letters and flowing styles.',
    },
    {
      title: 'Whiteboard to Text',
      href: '/whiteboard-to-text',
      description: 'Extract text from whiteboard photos with advanced de-skewing and glare reduction.',
    },
    {
      title: 'Handwritten Math to LaTeX',
      href: '/handwritten-math-to-latex',
      description: 'Convert handwritten mathematical equations to LaTeX format with symbol recognition.',
    },
  ],
  
  adPositions: {
    afterExplainer1: true,  // After "How it works"
    afterExamples: true,    // After examples gallery
  },
  
  toolDefaults: {
    preprocessing: {
      grayscale: true,
      contrast: 1.3,      // Higher contrast for handwriting
      binarize: true,     // Black/white conversion helps
      denoise: true,      // Remove noise for cleaner text
      sharpen: true,      // Sharpen edges for better recognition
    },
    postProcessing: {
      wordJoiner: true,   // Join hyphenated words
      trimWhitespace: true,
    },
  },
};

// Generate the page component
const HandwritingToTextPage = makeNichePage(config);

// Export default for routing
export default HandwritingToTextPage;

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
