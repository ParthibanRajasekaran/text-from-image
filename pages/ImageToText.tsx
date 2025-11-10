import React from "react";
import { SEO, baseJsonLd, createFAQJsonLd } from "../components/SEO";
import { useSEO } from "../src/seo";
import { FAQSchema } from "../components/FAQSchema";
import { Link } from "react-router-dom";
import { GuideLayout } from "../src/layouts/GuideLayout";
import { InArticle } from "../src/ads/InArticle";

const faqs = [
  {
    question: 'How does the image to text converter work?',
    answer: 'Our OCR (Optical Character Recognition) tool uses advanced AI models to analyze your image and extract all readable text. Simply upload an image, and our system will process it in seconds, identifying text with high accuracy.',
  },
  {
    question: 'What image formats are supported?',
    answer: 'We support all common image formats including JPG, JPEG, PNG, WEBP, GIF, and BMP. For best results, use high-resolution images with clear, readable text.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes! All processing happens securely over HTTPS. We do not store your images or extracted text on our servers. Your data is processed in real-time and immediately deleted.',
  },
  {
    question: 'How accurate is the text extraction?',
    answer: 'Our AI-powered OCR achieves 95%+ accuracy for clear, high-quality images with printed text. Accuracy may vary for handwritten text, low-resolution images, or complex layouts.',
  },
  {
    question: 'Is there a file size limit?',
    answer: 'Images up to 20MB are supported. For best performance and accuracy, we recommend images between 500KB and 5MB.',
  },
  {
    question: 'Can I extract text from multiple images?',
    answer: 'Yes! Simply upload one image at a time. Your previous results are saved in the history (accessible via the H key or History button) so you can easily reference past extractions.',
  },
];

/**
 * Image to Text page
 * SEO-optimized route for /image-to-text
 */
export default function ImageToText() {
  const isPreview = import.meta.env.MODE === "preview";
  const allowPreview = import.meta.env.VITE_ENABLE_ADS_IN_PREVIEW === "true";
  const slotsEnabled = (isPreview && allowPreview) || import.meta.env.VITE_ADS_SLOTS_ENABLED === "true";
  const consent = { ad_storage: 'denied' as const, ad_user_data: 'denied' as const, ad_personalization: 'denied' as const };
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalPath = '/image-to-text';
  const canonicalAbsolute = new URL(canonicalPath, SITE_URL).toString();

  useSEO({
    title: "Image to Text Converter - Free Online OCR Tool",
    description: "Convert any image to text instantly with our free AI-powered OCR tool. Extract text from JPG, PNG, WEBP, and PDF files with high accuracy. No signup required.",
    canonical: canonicalPath,
  });

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: 'Image to Text', item: canonicalAbsolute },
    ],
  };

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Image to Text Converter - Free Online OCR Tool',
    description: 'Convert any image to text instantly with our free AI-powered OCR tool. Extract text from JPG, PNG, WEBP, and PDF files with high accuracy.',
    dateModified: new Date().toISOString(),
    author: { '@type': 'Person', name: 'TextFromImage' },
    mainEntityOfPage: canonicalAbsolute,
  };

  const faqJson = createFAQJsonLd(faqs);
  const pageJsonLd = [
    ...baseJsonLd,
    breadcrumb,
    article,
    faqJson,
  ];

  return (
    <>
      <SEO
        title="Image to Text Converter - Free Online OCR Tool"
        description="Convert any image to text instantly with our free AI-powered OCR tool. Extract text from JPG, PNG, WEBP, and PDF files with high accuracy. No signup required."
        canonical={canonicalAbsolute}
        jsonLd={pageJsonLd}
      />
      <FAQSchema faqs={faqs} />
      <GuideLayout
        title="Image to Text Converter"
        description="Transform images into editable text with our free AI-powered OCR tool"
      >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Overview</h2>
        <p className="mb-4">
          An image to text converter uses Optical Character Recognition (OCR) technology to automatically identify and extract text from images. Whether you have a photograph of a document, a screenshot of an article, a scanned receipt, or any other image containing text, our converter transforms it into editable, searchable, and copy-paste-ready text in seconds.
        </p>
        <p className="mb-4">
          This technology eliminates the need for manual retyping, saving hours of work when digitizing books, extracting quotes from images shared on social media, archiving printed documents, or making image-based content accessible to screen readers and search engines.
        </p>
        <p>
          Our browser-based OCR tool supports all major image formats (JPG, PNG, WEBP, GIF, BMP) and works entirely in your web browser—no software installation, no account creation, and no uploads to external servers. Your images remain private and secure on your device.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Who Benefits from Image to Text Conversion</h3>
        <ul className="space-y-3 ml-2">
          <li>
            <strong className="block mb-1">Content Creators & Writers:</strong>
            <span className="text-foreground/90">Extract quotes from books, articles, or social media images for blog posts, essays, or research papers. Quickly digitize handwritten notes or brainstorming sessions captured on whiteboards.</span>
          </li>
          <li>
            <strong className="block mb-1">Students & Educators:</strong>
            <span className="text-foreground/90">Convert lecture slides, textbook pages, or study guides into text for note-taking, flashcard creation, or exam preparation. Make printed course materials searchable and accessible.</span>
          </li>
          <li>
            <strong className="block mb-1">Business & Office Workers:</strong>
            <span className="text-foreground/90">Digitize business cards, invoices, contracts, or meeting notes. Extract data from screenshots of emails, documents, or web pages when copy-paste isn't available.</span>
          </li>
          <li>
            <strong className="block mb-1">Accessibility Advocates:</strong>
            <span className="text-foreground/90">Convert image-based text into screen-reader-friendly formats, making content accessible to visually impaired users. Transform inaccessible PDFs (image-only) into readable text.</span>
          </li>
          <li>
            <strong className="block mb-1">Translators & Language Learners:</strong>
            <span className="text-foreground/90">Extract text from foreign-language signs, menus, or documents photographed while traveling, then paste into translation tools. Digitize language learning materials for flashcard apps.</span>
          </li>
          <li>
            <strong className="block mb-1">Archivists & Historians:</strong>
            <span className="text-foreground/90">Digitize historical documents, letters, or newspaper clippings to create searchable archives. Preserve aging printed materials by converting them to digital text.</span>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">How OCR Technology Converts Images to Text</h2>
        <p className="mb-4">
          Optical Character Recognition is a multi-stage process that combines image processing, pattern recognition, and machine learning to "read" text from images. Here's how our system works:
        </p>

        <h3 className="text-xl font-medium mb-2">Stage 1: Image Pre-Processing</h3>
        <p className="mb-3">
          Before any text recognition occurs, the image undergoes several enhancements to improve OCR accuracy:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Noise reduction:</strong> Digital noise, artifacts from compression, or physical imperfections (like dust on scanned documents) are filtered out.</li>
          <li><strong>Contrast enhancement:</strong> The difference between text and background is amplified, making characters more distinct.</li>
          <li><strong>Binarization:</strong> The image is converted to black-and-white (binary), simplifying the recognition task.</li>
          <li><strong>Deskewing:</strong> If the image is tilted, the system automatically rotates it to align text horizontally.</li>
          <li><strong>Layout analysis:</strong> The system identifies regions of interest—blocks of text, headings, captions, page numbers—and determines reading order.</li>
        </ul>

        <h3 className="text-xl font-medium mb-2">Stage 2: Character Recognition</h3>
        <p className="mb-3">
          Once the image is optimized, the OCR engine analyzes each character:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Tesseract OCR Engine:</strong> Our primary engine uses Tesseract, an open-source OCR system originally developed by Hewlett-Packard and now maintained by Google. Tesseract compares detected shapes against a trained database of character patterns, recognizing letters, numbers, punctuation, and special symbols.</li>
          <li><strong>Feature extraction:</strong> The engine identifies unique features of each character—curves, lines, endpoints, intersections—and matches them to known character profiles.</li>
          <li><strong>Language models:</strong> Tesseract leverages language-specific dictionaries and grammar rules to improve accuracy. For example, it knows "the" is more likely than "tbe" in English text.</li>
        </ul>

        <h3 className="text-xl font-medium mb-2">Stage 3: AI-Powered Enhancement (Optional)</h3>
        <p className="mb-3">
          For challenging images (handwriting, low quality, unusual fonts), our system offers an AI fallback:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Vision-Language Model:</strong> A modern neural network trained on millions of text images analyzes the entire image context, not just individual characters. This model excels at recognizing cursive handwriting, stylized fonts, and text in complex backgrounds.</li>
          <li><strong>Contextual understanding:</strong> Unlike traditional OCR, the AI model understands semantic context—for example, it can infer partially obscured words based on surrounding text.</li>
        </ul>

        <h3 className="text-xl font-medium mb-2">Stage 4: Post-Processing and Output</h3>
        <p className="mb-3">
          After recognition, the extracted text undergoes final refinements:
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Spell checking:</strong> Obvious OCR errors (e.g., "0" instead of "O") are corrected using language dictionaries.</li>
          <li><strong>Formatting preservation:</strong> Line breaks, paragraphs, and text structure are maintained where possible.</li>
          <li><strong>Output delivery:</strong> The final text is presented in a copy-ready format, ready for pasting into documents, translation tools, or note-taking apps.</li>
        </ul>

        <p className="mt-4">
          This entire pipeline runs in your browser using WebAssembly (for Tesseract) and JavaScript, ensuring fast processing without server uploads.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Step-by-Step: Converting Images to Text</h2>
        <p className="mb-4">
          Follow these detailed instructions to extract text from any image:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Step 1: Access the OCR Tool</h3>
            <p>
              Navigate to the homepage of <strong>Free Text From Image</strong>. The OCR tool is immediately available—no login or registration required. The interface displays a large dropzone labeled "Drag & drop or click to upload image."
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 2: Upload Your Image</h3>
            <p className="mb-2">
              You have three convenient methods to load your image:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Drag and drop:</strong> Drag an image file from your desktop or file manager directly into the dropzone. Supported formats: JPG, PNG, WEBP, GIF, BMP, and others.</li>
              <li><strong>Click to browse:</strong> Click anywhere on the dropzone to open your system's file picker. Select the image you want to convert.</li>
              <li><strong>Paste from clipboard:</strong> If you've taken a screenshot (Ctrl+Shift+S on Windows/Linux, Cmd+Shift+4 on Mac) or copied an image (Ctrl+C / Cmd+C), click the dropzone and press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Ctrl+V</kbd> (or <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Cmd+V</kbd>) to paste it instantly.</li>
            </ul>
            <p className="mt-2">
              For best results, use images with resolution of at least 1280×720 pixels. Smaller images may produce less accurate results.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 3: Preview and Confirm</h3>
            <p>
              After uploading, a preview of your image appears on the screen. Review it to ensure the text is legible and properly oriented. If the image is upside down or sideways, rotate it using your device's photo editor before uploading. You can also crop out irrelevant areas (borders, backgrounds) to focus the OCR on the text you need.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 4: Extract Text</h3>
            <p className="mb-2">
              Click the <strong>"Extract Text"</strong> button (or press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Enter</kbd> / <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Return</kbd>). The OCR engine immediately begins processing. A progress indicator shows:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Analyzing image...</strong> Pre-processing (noise reduction, binarization, deskewing)</li>
              <li><strong>Recognizing text...</strong> Character-by-character recognition using Tesseract OCR</li>
              <li><strong>Finalizing...</strong> Post-processing and formatting</li>
            </ul>
            <p className="mt-2">
              Processing typically completes in 2–5 seconds for most images. Very large images (20MB) or those with extensive text may take up to 10 seconds.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 5: Review Extracted Text</h3>
            <p className="mb-2">
              The extracted text appears in a text box below the image. Scroll through to verify accuracy. Common OCR quirks to watch for:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Character confusion:</strong> "O" (letter O) vs. "0" (zero), "l" (lowercase L) vs. "I" (capital i) vs. "1" (one)</li>
              <li><strong>Punctuation errors:</strong> Periods, commas, and apostrophes may be misrecognized in low-quality images</li>
              <li><strong>Line breaks:</strong> Text may run together if line spacing is tight, or split unexpectedly if there are large gaps</li>
            </ul>
            <p className="mt-2">
              If you notice significant errors (more than 5% of words incorrect), try the AI-powered model by clicking "Try AI Model" (if available), or improve the image quality and re-upload.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 6: Copy or Download Text</h3>
            <p className="mb-2">
              Once you're satisfied with the extraction, choose how to use the text:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Copy to clipboard:</strong> Click <strong>"Copy"</strong> (or press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Ctrl+C</kbd> / <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Cmd+C</kbd> with the text selected). Then paste (Ctrl+V / Cmd+V) into your document, email, notes app, or translation tool.</li>
              <li><strong>Download as .txt file:</strong> Click <strong>"Download"</strong> to save the extracted text as a plain text file on your computer.</li>
              <li><strong>Edit before copying:</strong> The text box is editable—you can correct any OCR errors directly before copying or downloading.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 7: Access History (Optional)</h3>
            <p>
              Your recent extractions are automatically saved in local browser history. Press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">H</kbd> or click the <strong>"History"</strong> button to view past results. This feature is useful if you're processing multiple images and need to reference earlier extractions.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-primary/10 border-l-4 border-primary rounded">
          <p className="font-medium mb-1">Pro Tip: Batch Processing Workflow</p>
          <p className="text-sm">
            Need to convert dozens of images? Open multiple browser tabs (one per image) and start all extractions simultaneously. Each tab processes independently, maximizing throughput. Alternatively, use the History feature to extract one image at a time, knowing past results remain accessible.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Tips for Maximum OCR Accuracy</h2>
        <p className="mb-4">
          Image quality directly impacts OCR success. Follow these guidelines for reliable text extraction:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Optimize Image Resolution</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Minimum resolution:</strong> 1280×720 pixels (720p). Lower resolutions cause character confusion.</li>
              <li><strong>Recommended resolution:</strong> 1920×1080 pixels (1080p) or higher for small text (less than 12pt font).</li>
              <li><strong>Avoid over-compression:</strong> Save images at high quality (90%+ for JPEG). Heavy compression introduces artifacts that confuse OCR.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Ensure Good Lighting and Contrast</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Even illumination:</strong> Avoid shadows across text. Use natural light or soft, diffused artificial light.</li>
              <li><strong>High contrast:</strong> Dark text on light backgrounds (or vice versa) works best. Avoid low-contrast combinations like light gray on white.</li>
              <li><strong>No glare:</strong> When photographing glossy pages or screens, angle your camera to avoid reflections.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Align and Straighten Text</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Horizontal orientation:</strong> Ensure text lines run left-to-right (for Latin scripts). Rotated or tilted text reduces accuracy.</li>
              <li><strong>Deskew if needed:</strong> If your photo is angled, use a photo editor's straighten or rotate tool before uploading.</li>
              <li><strong>Avoid perspective distortion:</strong> When photographing printed pages, hold the camera parallel to the page (not at an angle from above or the side).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Choose Clear Fonts and Text</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Printed text preferred:</strong> OCR performs best on typed, printed, or digitally rendered text. Handwriting accuracy varies—see our <Link to="/handwriting-to-text" className="text-primary hover:text-primary/80">Handwriting to Text</Link> guide for specialized tips.</li>
              <li><strong>Font size:</strong> Text smaller than 10pt (approximately 13px) may cause errors. Zoom in or use higher-resolution images for tiny text.</li>
              <li><strong>Standard fonts:</strong> Common fonts (Arial, Times New Roman, Helvetica, Calibri) work best. Highly decorative or script fonts may confuse the engine.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Handle Multi-Language Text</h3>
            <p className="mb-2">
              Our OCR supports 100+ languages, but language detection is automatic. For best results:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Single-language images:</strong> Accuracy is highest when the entire image contains text in one language.</li>
              <li><strong>Mixed-language content:</strong> If your image contains multiple languages (e.g., English and Chinese), the OCR will attempt to recognize both, but accuracy may be lower at language boundaries.</li>
              <li><strong>Non-Latin scripts:</strong> Arabic, Hebrew, Chinese, Japanese, Korean, and other scripts are supported. Ensure high contrast and clear characters for these languages.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">When to Use the AI Model</h3>
            <p className="mb-2">
              If the standard OCR produces unsatisfactory results, try the AI-powered fallback (if available):
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Handwritten text:</strong> The AI model handles cursive and print handwriting better than traditional OCR.</li>
              <li><strong>Unusual fonts:</strong> Stylized, decorative, or heavily stylized fonts (e.g., graffiti-style text) benefit from AI recognition.</li>
              <li><strong>Text in images with busy backgrounds:</strong> Text overlaid on photos or graphics (like memes, infographics, or signs) is easier for the AI to isolate.</li>
              <li><strong>Low-quality or damaged images:</strong> Blurry, faded, or partially obscured text may be readable by the AI where Tesseract fails.</li>
            </ul>
          </div>
        </div>

        <p className="mt-4 p-4 bg-muted/40 rounded-lg">
          <strong>When to re-capture:</strong> If your OCR results show more than 10% errors, it's usually faster to retake the photo or re-scan the document with better lighting, focus, and alignment than to manually correct extensive mistakes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Privacy & Security</h2>
        <p className="mb-4">
          Your privacy is our top priority. Here's how we protect your data:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>No uploads to servers:</strong> All OCR processing occurs in your web browser using WebAssembly. Your images never leave your device.</li>
          <li><strong>No data storage:</strong> We do not store, log, or retain any images or extracted text. Once you close the browser tab, all data is permanently deleted.</li>
          <li><strong>No account required:</strong> You can use the tool anonymously without creating an account or providing personal information.</li>
          <li><strong>Local history only:</strong> The History feature stores past extractions in your browser's local storage (on your device). This data is not transmitted to our servers and can be cleared at any time by clearing your browser cache.</li>
          <li><strong>HTTPS encryption:</strong> All web traffic is encrypted via HTTPS, protecting your data from interception during transit.</li>
        </ul>
        <p className="mt-4">
          This client-side approach ensures complete privacy, making our tool safe for sensitive documents like contracts, medical records, financial statements, or confidential correspondence.
        </p>
      </section>

      {slotsEnabled && <InArticle consent={consent} />}

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Frequently Asked Questions</h2>
        <ul className="space-y-3">
          {faqs.map((faq, idx) => (
            <li key={idx}>
              <strong className="block mb-1">{faq.question}</strong>
              <div className="text-foreground/90">{faq.answer}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 pt-6 border-t border-border/40">
        <h2 className="text-xl font-semibold mb-4 text-center">Related Guides</h2>
        <nav>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link to="/extract-text-from-image" className="text-primary hover:text-primary/80">Extract Text from Image</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/copy-text-from-image" className="text-primary hover:text-primary/80">Copy Text from Image</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/jpg-to-excel" className="text-primary hover:text-primary/80">JPG to Excel</Link>
          </div>
        </nav>
      </section>
      </GuideLayout>
    </>
  );
}
