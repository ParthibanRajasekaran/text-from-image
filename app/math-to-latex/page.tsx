import { makeNichePage, type NichePageConfig } from '../(tools)/_builder';

/**
 * Math to LaTeX - Niche Page
 * 
 * SEO-optimized page for converting images of mathematical notation to LaTeX code.
 * Targets users with:
 * - Printed equations from textbooks, papers, worksheets
 * - Screenshots of formulas from PDFs or web pages
 * - Typed math expressions that need LaTeX conversion
 * 
 * Features:
 * - 500-800 words about LaTeX output, KaTeX/MathJax preview
 * - 5-7 FAQs about ambiguous symbols, LaTeX syntax, rendering
 * - JSON-LD structured data
 * - AdGate-compliant ad placement (1 position after first explainer)
 * - Math-specific tool defaults with symbol disambiguation hints
 */

const config: NichePageConfig = {
  slug: 'math-to-latex',
  
  title: 'Math to LaTeX Converter – Extract Equations from Images (Free)',
  
  description: 'Convert images of math equations to LaTeX code instantly. Extract formulas from textbooks, papers, and screenshots. Free OCR with KaTeX preview and symbol disambiguation.',
  
  hero: {
    heading: 'Convert Math Images to LaTeX Code',
    subheading: 'Transform photos of equations, formulas, and mathematical notation into editable LaTeX markup. Our intelligent OCR recognizes fractions, exponents, integrals, and Greek symbols—with instant KaTeX preview to verify accuracy.',
  },
  
  howItWorks: [
    {
      step: 1,
      title: 'Upload Math Image',
      description: 'Upload a photo or screenshot of any mathematical expression—equations from textbooks, formulas from research papers, or typed expressions from documents. Works with printed and clear typed math.',
    },
    {
      step: 2,
      title: 'OCR with Symbol Recognition',
      description: 'Our engine identifies mathematical structures like fractions, superscripts, subscripts, radicals, integrals, and Greek letters. Ambiguity hints help distinguish × from x, and l from 1 for better accuracy.',
    },
    {
      step: 3,
      title: 'LaTeX Output with Preview',
      description: 'Get clean LaTeX code ready to paste into documents, papers, or web pages. KaTeX preview renders your equation in real-time so you can verify correctness before exporting. Copy with one click.',
    },
  ],
  
  supported: {
    title: 'What Mathematical Notation Can We Convert?',
    items: [
      'Basic arithmetic operations: addition, subtraction, multiplication (× or ·), division (÷ or /)',
      'Fractions and nested fractions with numerators and denominators',
      'Exponents, superscripts, and subscripts for powers and indices',
      'Square roots, cube roots, and nth roots with radicands',
      'Greek letters: α, β, γ, δ, θ, λ, π, σ, Σ, ∫, and more',
      'Calculus notation: integrals, derivatives, limits, summations',
      'Matrices and vectors with brackets, parentheses, or vertical bars',
      'Set theory symbols: ∈, ⊂, ∪, ∩, ∅, and logical operators',
    ],
    caveats: [
      'Ambiguous symbols require careful review—× (times) vs x (variable), l (lowercase L) vs 1 (one), O (letter) vs 0 (zero)',
      'Handwritten math has lower accuracy than printed; consider using handwritten-math-to-latex page for script equations',
      'Complex multi-line equations may need manual alignment tags (\\\\) and spacing adjustments in LaTeX',
      'Subscripts and superscripts must be clearly positioned; overlapping elements reduce recognition accuracy',
      'Font styles matter—ensure images have sufficient contrast and resolution (300+ DPI for best results)',
      'Non-standard notation or custom symbols may not convert automatically; edit LaTeX output for specialty characters',
    ],
  },
  
  privacy: {
    title: 'Your Research and Homework Stay Private',
    description: 'Mathematical equations often represent original research, proprietary formulas, or coursework. We prioritize your privacy and academic integrity.',
    features: [
      'All math OCR processing happens locally in your browser—no server uploads',
      'Equations and formulas never leave your device',
      'Zero data collection, no tracking, no account required',
      'Images processed in memory only, nothing saved to disk',
      'HTTPS encryption protects your browser session',
      'Refresh the page to completely clear all data from memory',
    ],
  },
  
  examples: [
    {
      src: '/examples/math-equation-printed.jpg',
      alt: 'Printed quadratic formula',
      caption: 'Before: Printed quadratic formula from textbook. After: LaTeX code \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} with KaTeX preview matching original layout.',
    },
    {
      src: '/examples/math-integral-calculus.jpg',
      alt: 'Integral expression with bounds',
      caption: 'Before: Calculus integral with limits. After: LaTeX \\int_{0}^{\\infty} e^{-x^2} dx with proper superscripts and subscripts recognized.',
    },
    {
      src: '/examples/math-greek-symbols.jpg',
      alt: 'Equation with Greek letters',
      caption: 'Before: Physics formula with Greek symbols. After: \\theta, \\pi, \\sigma converted to LaTeX commands with disambiguation hints for ambiguous characters.',
    },
  ],
  
  faq: [
    {
      question: 'How do I handle ambiguous symbols like × versus x or l versus 1?',
      answer: 'Our OCR provides disambiguation hints when it detects potentially confusing symbols. Review the highlighted characters in the preview—if × (multiplication) was misread as x (variable), or l (letter L) as 1 (numeral one), you can click the suggestion to swap. The KaTeX preview updates instantly so you can verify the correction.',
    },
    {
      question: 'What is LaTeX and why would I need it?',
      answer: 'LaTeX is a markup language for typesetting mathematical notation in academic papers, research publications, and technical documents. It produces high-quality, professional-looking equations that can be rendered in PDFs, web pages (via MathJax or KaTeX), and word processors. If you are writing a thesis, journal article, or homework in LaTeX, this tool converts images to LaTeX code you can paste directly.',
    },
    {
      question: 'Can I preview the LaTeX output before copying it?',
      answer: 'Yes! After OCR completes, we render your LaTeX code using KaTeX—a fast math rendering library. The preview appears alongside the raw LaTeX markup, so you can visually compare the rendered equation to your original image. If the preview looks correct, the LaTeX code is ready to use. If not, check disambiguation hints or manually edit the code.',
    },
    {
      question: 'Does this work with handwritten equations or only printed math?',
      answer: 'This page is optimized for printed or typed mathematical notation—textbooks, PDFs, screenshots. Handwritten math has lower accuracy due to variable stroke styles, slant, and spacing. For handwritten equations, use our dedicated handwritten-math-to-latex page, which includes symbol disambiguation tools tailored for script characters.',
    },
    {
      question: 'How do I copy the LaTeX code to my document or paper?',
      answer: 'After the LaTeX code is generated, click the "Copy LaTeX" button. The markup is copied to your clipboard, ready to paste into your LaTeX editor (Overleaf, TeXShop, etc.), Markdown document, or any system that supports LaTeX rendering. No manual typing required—just paste and compile.',
    },
    {
      question: 'What if my equation has multiple lines or alignment requirements?',
      answer: 'Single-line equations convert directly. Multi-line equations may need manual alignment tags like \\\\ (line break) and & (alignment point) in LaTeX. After pasting the generated code, wrap it in an align or gather environment (\\begin{align} ... \\end{align}) in your LaTeX editor for proper formatting.',
    },
    {
      question: 'Is my homework or research equation data stored or analyzed?',
      answer: 'Absolutely not. All math OCR and LaTeX generation happens entirely in your browser using local processing. Equation images, LaTeX code, and preview data never reach our servers. No storage, no logging, no tracking. Your academic work remains completely private on your device.',
    },
  ],
  
  relatedPages: [
    {
      title: 'Handwritten Math to LaTeX',
      href: '/handwritten-math-to-latex',
      description: 'Convert handwritten equations to LaTeX with symbol disambiguation tools.',
    },
    {
      title: 'Image to Text',
      href: '/image-to-text',
      description: 'General-purpose OCR for extracting text from any printed document or image.',
    },
    {
      title: 'Whiteboard to Text',
      href: '/whiteboard-to-text',
      description: 'Extract text and equations from whiteboard photos with glare reduction.',
    },
  ],
  
  adPositions: {
    afterExplainer1: true,  // After "How It Works" section
  },
  
  toolDefaults: {
    preprocessing: {
      grayscale: true,
      contrast: 1.4,        // Higher contrast for math symbols
      binarize: true,
      denoise: true,
      sharpen: true,
      brightness: 1.0,
    },
    postProcessing: {
      wordJoiner: false,    // Keep math symbols separate
      trimWhitespace: true,
    },
  },
};

// Generate the page component
const MathToLatexPage = makeNichePage(config);

// Export default for routing
export default MathToLatexPage;

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
