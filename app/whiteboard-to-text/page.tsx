import { makeNichePage, type NichePageConfig } from '../(tools)/_builder';

/**
 * Whiteboard to Text - Niche Page
 * 
 * SEO-optimized page for converting whiteboard photos to editable text.
 * Targets users with:
 * - Lecture notes from classroom whiteboards
 * - Meeting notes from office whiteboards
 * - Brainstorming sessions, diagrams, and sketches
 * 
 * Features:
 * - 500-800 words about whiteboard challenges: glare, skew, low contrast
 * - 5-7 FAQs about preprocessing, de-skewing, glare reduction
 * - JSON-LD structured data
 * - AdGate-compliant ad placement (after explainer)
 * - Preprocessing toggles: de-skew, glare reduction, contrast boost
 */

const config: NichePageConfig = {
  slug: 'whiteboard-to-text',
  
  title: 'Whiteboard to Text Converter – Extract Notes from Whiteboard (Free)',
  
  description: 'Convert whiteboard photos to editable text instantly. Extract lecture notes, meeting notes, and brainstorming sessions. Free OCR with de-skew, glare reduction, and contrast boost.',
  
  hero: {
    heading: 'Capture Whiteboard Notes as Text',
    subheading: 'Transform photos of classroom whiteboards, office meeting boards, and brainstorming sessions into editable digital text. Our intelligent preprocessing handles glare, perspective skew, and low-contrast markers—turning faded board photos into clear, searchable notes.',
  },
  
  howItWorks: [
    {
      step: 1,
      title: 'Photograph Whiteboard',
      description: 'Capture whiteboard content from any angle—classroom lectures, office meetings, or personal brainstorming boards. Works with dry-erase markers in any color (black, blue, red, green), even if partially erased or faded.',
    },
    {
      step: 2,
      title: 'Automatic Preprocessing',
      description: 'Our tool applies de-skew to correct perspective distortion from angled photos, glare reduction to remove reflections from lights or windows, and contrast boost to enhance faded markers. Preprocessing toggles let you customize corrections for your specific whiteboard photo.',
    },
    {
      step: 3,
      title: 'Extract Clean Text',
      description: 'OCR converts cleaned whiteboard content to editable text. Handwritten notes, diagrams, and annotations are extracted. Copy directly to note-taking apps, Word documents, or project management tools for digital archival and sharing.',
    },
  ],
  
  supported: {
    title: 'What Whiteboard Content Can We Extract?',
    items: [
      'Lecture notes from classroom whiteboards with clear handwriting or typed text',
      'Meeting notes, action items, and agendas from office whiteboards',
      'Brainstorming sessions with bullet points, mind maps, and flowcharts',
      'Mathematical equations, formulas, and problem-solving steps on whiteboards',
      'Diagrams, sketches, and visual notes with text labels',
      'To-do lists, schedules, and project timelines written on boards',
      'Language learning content: vocabulary, grammar rules, sentences',
      'Workshop or training session notes with mixed text and drawings',
    ],
    caveats: [
      'Glare from overhead lights or windows is the biggest challenge—photograph at an angle to minimize reflections, or use glare reduction preprocessing',
      'Perspective skew from angled photos distorts text—de-skew preprocessing helps, but straight-on photos always work best',
      'Faded markers or partially erased content have lower accuracy—use contrast boost preprocessing to recover faded text',
      'Colored markers (red, green, blue) may have lower contrast than black; ensure marker is bold and not running dry',
      'Handwriting clarity matters—neat, print-style handwriting works better than cursive or highly stylized script',
      'Mixed content (text + diagrams) is supported, but complex diagrams may not convert to structured data; extract text only',
    ],
  },
  
  privacy: {
    title: 'Your Meeting and Lecture Notes Stay Private',
    description: 'Whiteboard photos often contain confidential meeting notes, proprietary brainstorming ideas, or academic lecture content. We ensure complete privacy for your whiteboard data.',
    features: [
      'All whiteboard OCR processing happens locally in your browser—no server uploads',
      'Meeting notes, lecture content, and brainstorming sessions never leave your device',
      'Zero data collection, no tracking, no account required',
      'Images processed in memory only, nothing saved to disk',
      'HTTPS encryption protects your browser session',
      'Refresh the page to completely clear all data from memory',
    ],
  },
  
  examples: [
    {
      src: '/examples/whiteboard-lecture-notes.jpg',
      alt: 'Classroom whiteboard with lecture notes',
      caption: 'Before: Whiteboard photo with glare from overhead lights and perspective skew. After: Glare reduction + de-skew preprocessing applied, clean text extracted for note-taking.',
    },
    {
      src: '/examples/whiteboard-meeting-agenda.jpg',
      alt: 'Office whiteboard with meeting agenda',
      caption: 'Before: Meeting whiteboard with faded blue marker and reflection. After: Contrast boost + glare removal recover faded items, action points extracted as editable text.',
    },
    {
      src: '/examples/whiteboard-brainstorm-bullets.jpg',
      alt: 'Brainstorming whiteboard with bullet points',
      caption: 'Before: Brainstorming session with mixed colors and angled photo. After: De-skew corrects perspective, multi-color markers recognized, bullet points preserved in text output.',
    },
  ],
  
  faq: [
    {
      question: 'How do the preprocessing toggles (de-skew, glare, contrast) work?',
      answer: 'De-skew corrects perspective distortion when you photograph a whiteboard at an angle instead of straight-on. Glare reduction removes reflections from overhead lights or windows using adaptive filtering. Contrast boost enhances faded markers by increasing the difference between marker ink and whiteboard background. Toggle these on or off based on your photo quality—most whiteboard photos benefit from all three.',
    },
    {
      question: 'What is the best way to photograph a whiteboard for OCR accuracy?',
      answer: 'Stand directly in front of the whiteboard (straight-on, not angled) to minimize perspective distortion. Use even lighting—avoid direct overhead lights or window reflections that cause glare. Ensure markers are bold and not faded; refresh dry-erase markers if they are running out of ink. Capture the entire whiteboard content in the frame without cutting off edges.',
    },
    {
      question: 'Can this handle colored markers (red, blue, green) on whiteboards?',
      answer: 'Yes, all marker colors are supported. However, black markers typically have the highest contrast and best accuracy. Red, blue, and green markers work well if the marker is bold and not faded. Very light colors (yellow, pink) or markers running dry may have reduced accuracy due to low contrast with the white background. Use contrast boost preprocessing to help.',
    },
    {
      question: 'Does this work with handwritten whiteboard notes or only printed text?',
      answer: 'Whiteboard content is almost always handwritten. The OCR is designed for handwriting, but clarity matters—neat, print-style handwriting works best. Cursive or highly stylized script has lower accuracy. If multiple people write on the same board with different handwriting styles, expect varied recognition rates. For best results, use clear, separated letters with consistent spacing.',
    },
    {
      question: 'What if my whiteboard photo has glare that covers important text?',
      answer: 'Glare reduction preprocessing can recover text under mild to moderate reflections. However, severe glare that completely washes out text cannot be recovered—re-photograph the whiteboard from a different angle to avoid the reflection. If re-photographing is not possible, try adjusting room lighting or closing blinds to reduce glare before capturing.',
    },
    {
      question: 'Can I extract diagrams, flowcharts, or drawings from whiteboards?',
      answer: 'This tool is optimized for text extraction. Simple diagrams with text labels will have the text extracted, but the diagram structure is not preserved. For complex flowcharts, mind maps, or drawings, consider using the image directly or a specialized diagramming OCR tool. This tool focuses on converting whiteboard text to editable digital text only.',
    },
    {
      question: 'Is my confidential meeting or proprietary brainstorming content stored?',
      answer: 'Absolutely not. All whiteboard OCR processing is client-side in your browser. Meeting notes, proprietary ideas, or lecture content never reach our servers. No storage, no logging, no tracking. Your whiteboard content remains completely private on your device.',
    },
  ],
  
  relatedPages: [
    {
      title: 'Handwriting to Text',
      href: '/handwriting-to-text',
      description: 'Extract text from handwritten notes, forms, and documents with OCR.',
    },
    {
      title: 'Math to LaTeX',
      href: '/math-to-latex',
      description: 'Convert mathematical equations from whiteboards to LaTeX format.',
    },
    {
      title: 'Image to Text',
      href: '/image-to-text',
      description: 'General-purpose OCR for extracting text from any image or document.',
    },
  ],
  
  adPositions: {
    afterExplainer1: true,  // After "How It Works" section
  },
  
  toolDefaults: {
    preprocessing: {
      grayscale: true,
      contrast: 1.6,        // Very high contrast for faded markers
      binarize: true,
      denoise: true,
      sharpen: true,
      brightness: 1.2,      // Boost for low-light whiteboard photos
    },
    postProcessing: {
      wordJoiner: true,     // Join words that may be split by marker gaps
      trimWhitespace: true,
    },
  },
};

// Generate the page component
const WhiteboardToTextPage = makeNichePage(config);

// Export default for routing
export default WhiteboardToTextPage;

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
