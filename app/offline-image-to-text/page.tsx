import { makeNichePage, type NichePageConfig } from '../(tools)/_builder';

/**
 * Offline Image to Text (PWA) - Niche Page
 * 
 * SEO-optimized page for offline OCR using Progressive Web App (PWA) technology.
 * Targets users with:
 * - Privacy-sensitive documents requiring no internet connection
 * - Users in low-connectivity or no-network environments
 * - Travelers, field workers, or remote locations
 * 
 * Features:
 * - 500-800 words about offline OCR, WASM model, privacy, limitations
 * - 5-7 FAQs about offline mode, model size, accuracy trade-offs
 * - JSON-LD structured data
 * - NO ADS (as specified) - privacy-focused utility page
 * - On-device indicator, install prompt, lazy-load WASM model
 */

const config: NichePageConfig = {
  slug: 'offline-image-to-text',
  
  title: 'Offline Image to Text – PWA OCR Without Internet (100% Private)',
  
  description: 'Convert images to text completely offline. No internet required after install. 100% private on-device OCR using WASM. Perfect for sensitive documents and remote locations.',
  
  hero: {
    heading: 'OCR That Works Offline',
    subheading: 'Extract text from images without any internet connection. Our Progressive Web App (PWA) uses WebAssembly (WASM) to run OCR entirely on your device—no server, no network, no data transmission. Install once, use anywhere, anytime, with absolute privacy.',
  },
  
  howItWorks: [
    {
      step: 1,
      title: 'Install PWA (One-Time Setup)',
      description: 'Click the "Install" button or use your browser Add to Home Screen option. The OCR engine (WASM model, ~10MB) downloads once and caches locally. After installation, you can use the tool completely offline—no internet required.',
    },
    {
      step: 2,
      title: 'On-Device OCR Processing',
      description: 'Upload images and process them entirely on your device using WebAssembly. The WASM model runs in your browser without network access. An "Offline Ready" indicator confirms no data leaves your device—total privacy for sensitive documents.',
    },
    {
      step: 3,
      title: 'Extract Text Anywhere',
      description: 'Use the tool in airplanes, remote locations, secure facilities, or anywhere without internet. Extracted text is stored locally in browser memory only. Copy, save, or export—all without connectivity. Perfect for privacy-critical or field work scenarios.',
    },
  ],
  
  supported: {
    title: 'What Can You Do Offline?',
    items: [
      'Extract text from printed documents, receipts, and forms without internet',
      'Process sensitive documents (NDAs, contracts, medical records) with zero network transmission',
      'Work in remote locations: field research, travel, rural areas with no connectivity',
      'Use in secure environments where internet access is restricted or prohibited',
      'Airplane mode OCR for travel documents, boarding passes, itineraries',
      'Emergency scenarios where network is unavailable but text extraction is needed',
      'Educational use: students without reliable internet access can digitize notes',
      'Privacy-first OCR for personal documents you never want to upload anywhere',
    ],
    caveats: [
      'Offline model is smaller than cloud models—accuracy is slightly lower, especially for complex fonts or handwriting',
      'Initial installation requires internet to download the WASM model (~10MB); subsequent use is fully offline',
      'Processing speed may be slower than server-based OCR, depending on device CPU power',
      'Language support is limited to English in offline mode; multilingual OCR requires online connectivity',
      'Advanced features (translation, format conversion, cloud sync) are not available offline',
      'Model updates require re-installing the PWA when connected to the internet',
    ],
  },
  
  privacy: {
    title: 'Absolute Privacy Guaranteed',
    description: 'This offline tool is designed for maximum privacy. No data ever leaves your device—not during processing, not during storage, not ever.',
    features: [
      'All OCR processing happens on your device using WASM—zero server communication',
      'Works in airplane mode or with network completely disabled',
      'No data collection, no tracking, no analytics, no account required',
      'Images processed in browser memory only, nothing saved to disk unless you choose',
      'WASM model is open-source and auditable for security verification',
      'Refresh the page to completely clear all data from memory',
    ],
  },
  
  examples: [
    {
      src: '/examples/offline-document-scan.jpg',
      alt: 'Document scan processed offline',
      caption: 'Before: Sensitive document requiring offline processing. After: Text extracted on-device using WASM model—no internet connection used, complete privacy maintained.',
    },
    {
      src: '/examples/offline-receipt-field.jpg',
      alt: 'Receipt photo in remote location',
      caption: 'Before: Receipt photo captured in remote field location with no connectivity. After: OCR processed entirely offline, expense data extracted without network access.',
    },
  ],
  
  faq: [
    {
      question: 'How does offline OCR work without an internet connection?',
      answer: 'We use WebAssembly (WASM)—a technology that runs code directly in your browser without needing a server. The OCR model is downloaded once during PWA installation (~10MB) and cached locally. After that, all processing happens on your device CPU, requiring zero network access. The tool works in airplane mode or with internet completely disabled.',
    },
    {
      question: 'What is the accuracy trade-off for offline vs online OCR?',
      answer: 'Offline models are smaller and optimized for speed, resulting in slightly lower accuracy (~85-90%) compared to large cloud models (~95-98%). Printed text in clear fonts works very well offline. Handwriting, complex fonts, or low-quality images have more noticeable accuracy differences. For critical documents, consider using online OCR if connectivity is available.',
    },
    {
      question: 'How large is the offline model, and how long does installation take?',
      answer: 'The WASM OCR model is approximately 10MB. On a typical broadband connection, installation takes 10-30 seconds. On slower mobile networks, it may take 1-2 minutes. You only download the model once; after installation, the tool works offline indefinitely. Model updates (if any) require reconnecting to the internet to download the updated version.',
    },
    {
      question: 'Can I use this tool in secure facilities where internet is prohibited?',
      answer: 'Yes, this is a primary use case. After installing the PWA while connected to the internet, you can use the tool in secure environments with network access completely disabled. The tool will show an "Offline Ready" indicator confirming no network communication. Ideal for classified documents, secure facilities, or privacy-critical scenarios.',
    },
    {
      question: 'Does offline mode support languages other than English?',
      answer: 'Currently, the offline WASM model is optimized for English text only. Multilingual OCR (Spanish, French, German, Chinese, etc.) requires larger models that are impractical for offline use due to size constraints. For non-English text, use our online OCR tools when connectivity is available.',
    },
    {
      question: 'What happens if I close the browser or refresh the page?',
      answer: 'The WASM model remains cached in your browser, so offline functionality persists across sessions. However, any uploaded images or extracted text in memory are cleared when you close the tab or refresh. To preserve extracted text, copy it to a local file or note-taking app before closing. The tool does not save data to disk automatically.',
    },
    {
      question: 'Why are there no ads on this page?',
      answer: 'This offline tool is designed as a privacy-focused utility. Ads require network requests and tracking scripts, which would compromise the offline and privacy guarantees. We prioritize user privacy and offline functionality over monetization for this specific tool. Use it freely without ads or tracking.',
    },
  ],
  
  relatedPages: [
    {
      title: 'Image to Text',
      href: '/image-to-text',
      description: 'Online OCR tool with faster processing and support for more formats.',
    },
    {
      title: 'Handwriting to Text',
      href: '/handwriting-to-text',
      description: 'Extract text from handwritten notes with enhanced preprocessing.',
    },
    {
      title: 'Receipt to CSV',
      href: '/receipt-to-csv',
      description: 'Extract receipt data offline with line-item detection and CSV export.',
    },
  ],
  
  adPositions: {
    // NO ADS on offline page (as specified)
  },
  
  toolDefaults: {
    preprocessing: {
      grayscale: true,
      contrast: 1.3,
      binarize: true,
      denoise: true,
      sharpen: false,       // Sharpen can be slow on offline WASM; disabled by default
      brightness: 1.0,
    },
    postProcessing: {
      wordJoiner: true,
      trimWhitespace: true,
    },
  },
};

// Generate the page component
const OfflineImageToTextPage = makeNichePage(config);

// Export default for routing
export default OfflineImageToTextPage;

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
