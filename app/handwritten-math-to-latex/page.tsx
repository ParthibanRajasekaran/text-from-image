import { makeNichePage, type NichePageConfig } from '../(tools)/_builder';

/**
 * Handwritten Math to LaTeX - Niche Page
 * 
 * SEO-optimized page for converting handwritten mathematical notation to LaTeX.
 * Targets users with:
 * - Handwritten homework, notes, or exam solutions
 * - Whiteboard photos from lectures or tutoring sessions
 * - Scanned notebooks with mathematical work
 * 
 * Features:
 * - 500-800 words unique from math-to-latex, focusing on handwriting challenges
 * - 5-7 FAQs about symbol disambiguation, stroke recognition, slant
 * - JSON-LD structured data
 * - AdGate-compliant ad placement
 * - Interactive quick-fix step for ambiguous symbols with instant preview re-render
 */

const config: NichePageConfig = {
  slug: 'handwritten-math-to-latex',
  
  title: 'Handwritten Math to LaTeX – Convert Script Equations (Free OCR)',
  
  description: 'Convert handwritten math equations to LaTeX code. Extract formulas from notes, whiteboards, and homework. Free OCR with symbol disambiguation and instant preview for script notation.',
  
  hero: {
    heading: 'Transform Handwritten Math to LaTeX',
    subheading: 'Convert photos of handwritten equations, lecture notes, and whiteboard formulas into editable LaTeX markup. Our intelligent disambiguation handles script ambiguities—recognizing slanted variables, loopy integrals, and connected symbols with interactive quick-fix tools.',
  },
  
  howItWorks: [
    {
      step: 1,
      title: 'Capture Handwritten Math',
      description: 'Photograph or scan handwritten equations from notebooks, homework, whiteboards, or exam solutions. Works best with clear strokes, consistent spacing, and good lighting. Avoid shadows or pen bleed-through.',
    },
    {
      step: 2,
      title: 'Symbol Disambiguation UI',
      description: 'Our OCR analyzes stroke patterns for mathematical structures. When ambiguous symbols are detected—like curly 2 vs α, loopy ∫ vs cursive f, or slanted × vs x—interactive hints appear. Click to swap alternatives and see instant preview updates.',
    },
    {
      step: 3,
      title: 'Instant LaTeX Preview',
      description: 'Each disambiguation fix triggers real-time KaTeX re-rendering. Compare the preview to your original handwriting. Once symbols match, copy the LaTeX code directly to your document, paper, or homework submission.',
    },
  ],
  
  supported: {
    title: 'What Handwritten Math Can We Recognize?',
    items: [
      'Variables and constants with slant or script styles (x, y, a, b, c)',
      'Operators written by hand: +, −, ×, ÷, =, ≠, ≈, with stroke variation',
      'Fractions with hand-drawn division lines, including nested or stacked fractions',
      'Exponents and subscripts written above or below baseline (x², aₙ)',
      'Square roots and radicals with extended vinculum (the horizontal bar)',
      'Handwritten Greek letters: α, β, θ, π, λ, Σ, often confused with Latin characters',
      'Integrals, summations, and limits with connected or loopy strokes',
      'Parentheses, brackets, and braces with varying sizes and stroke weights',
    ],
    caveats: [
      'Handwriting style affects accuracy—print-style letters work better than highly cursive or connected script',
      'Symbol ambiguity is common: curly 2 vs α, script f vs ∫, o vs 0, l vs 1, Z vs 2—use disambiguation hints to correct',
      'Stroke thickness and pen pressure variations can confuse OCR; use consistent medium-thickness pens when possible',
      'Overlapping symbols or cramped spacing reduce recognition; leave whitespace between terms and operators',
      'Faded pencil, light ink, or poor lighting lowers accuracy; photograph under bright, even lighting without glare',
      'Multi-line equations with manual alignment require LaTeX environment tags (align, gather) after conversion',
    ],
  },
  
  privacy: {
    title: 'Your Homework and Notes Stay Confidential',
    description: 'Handwritten math often contains coursework, exam solutions, or personal study notes. We ensure complete privacy for your academic work.',
    features: [
      'All handwriting OCR happens locally in your browser—no server uploads',
      'Homework, notes, and exam solutions never leave your device',
      'Zero data collection, no tracking, no account required',
      'Images processed in memory only, nothing saved to disk',
      'HTTPS encryption protects your browser session',
      'Refresh the page to completely clear all data from memory',
    ],
  },
  
  examples: [
    {
      src: '/examples/handwritten-quadratic.jpg',
      alt: 'Handwritten quadratic equation with slant',
      caption: 'Before: Handwritten quadratic with slanted x. After: Disambiguation UI highlights x vs × ambiguity; click to confirm variable. Preview renders correctly.',
    },
    {
      src: '/examples/handwritten-integral-loopy.jpg',
      alt: 'Loopy integral symbol from whiteboard',
      caption: 'Before: Whiteboard integral with cursive stroke. After: OCR suggests ∫ vs script f; select integral. LaTeX \\int updates instantly in preview pane.',
    },
    {
      src: '/examples/handwritten-greek-alpha.jpg',
      alt: 'Greek letters in notebook notes',
      caption: 'Before: Handwritten α resembling curly 2. After: Quick-fix step prompts alpha vs 2 choice; selecting \\alpha re-renders KaTeX preview for verification.',
    },
  ],
  
  faq: [
    {
      question: 'How does the symbol disambiguation UI work for handwritten math?',
      answer: 'After OCR, ambiguous symbols are flagged with interactive hints. For example, if a stroke could be × (times) or x (variable), both options appear. Click your intended symbol, and the LaTeX preview re-renders instantly using KaTeX. This quick-fix workflow ensures accuracy without manual LaTeX editing.',
    },
    {
      question: 'What makes handwritten math harder to convert than printed equations?',
      answer: 'Handwriting introduces stroke variation, slant, spacing inconsistencies, and personal style quirks. Characters like l (lowercase L), 1 (one), and I (uppercase i) look nearly identical. Greek letters (α, β, θ) can resemble numbers or Latin letters. Our tool addresses this with disambiguation prompts, but consistent, clear handwriting always improves results.',
    },
    {
      question: 'Can I use this for whiteboard photos from lectures or tutoring?',
      answer: 'Yes! Whiteboard equations work well if lighting is even and strokes are bold. Avoid glare from overhead lights or windows—photograph at an angle or use diffuse lighting. Thin or faded marker strokes reduce accuracy. For best results, use medium-thickness markers and capture images straight-on.',
    },
    {
      question: 'What if my handwriting is very cursive or connected?',
      answer: 'Highly cursive or connected script reduces OCR accuracy because stroke boundaries blur. For best results, use print-style mathematical notation with separated characters. If you must convert cursive math, expect to use more disambiguation hints and manually verify the LaTeX preview before copying.',
    },
    {
      question: 'How do I fix incorrect symbol recognition after OCR?',
      answer: 'Incorrect symbols appear with disambiguation hints. Click the flagged character to see alternatives (e.g., o vs 0, l vs 1, × vs x). Select the correct option, and the LaTeX code updates with instant preview re-rendering. If no hint appears but the preview looks wrong, you can manually edit the LaTeX code after copying.',
    },
    {
      question: 'Does this tool support matrices or multi-line derivations?',
      answer: 'Single-line equations convert directly. Matrices and multi-line derivations require manual LaTeX environment tags (\\begin{matrix}, \\begin{align}) after conversion. The OCR extracts individual lines or elements; you will need to structure them in your LaTeX editor for proper alignment and formatting.',
    },
  ],
  
  relatedPages: [
    {
      title: 'Math to LaTeX',
      href: '/math-to-latex',
      description: 'Convert printed mathematical equations to LaTeX format with high accuracy.',
    },
    {
      title: 'Handwriting to Text',
      href: '/handwriting-to-text',
      description: 'Extract text from handwritten notes, forms, and documents.',
    },
    {
      title: 'Cursive to Text',
      href: '/cursive-to-text',
      description: 'Specialized tool for cursive handwriting with connected letters.',
    },
  ],
  
  adPositions: {
    afterExplainer1: true,  // After "How it works" section
  },
  
  toolDefaults: {
    preprocessing: {
      grayscale: true,
      contrast: 1.5,        // Very high contrast for handwriting strokes
      binarize: true,
      denoise: true,
      sharpen: true,
      brightness: 1.1,      // Slight boost for faded pencil/marker
    },
    postProcessing: {
      wordJoiner: false,    // Keep symbols separate for math parsing
      trimWhitespace: true,
    },
  },
};

// Generate the page component
const HandwrittenMathToLatexPage = makeNichePage(config);

// Export default for routing
export default HandwrittenMathToLatexPage;

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
