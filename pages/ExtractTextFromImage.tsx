import React from "react";
import { SEO, baseJsonLd, createFAQJsonLd } from "../components/SEO";
import { useSEO } from "../src/seo";
import { FAQSchema } from "../components/FAQSchema";
import { Link } from "react-router-dom";
import { GuideLayout } from "../src/layouts/GuideLayout";
import { InArticle } from "../src/ads/InArticle";

const faqs = [
  {
    question: 'How quickly can I extract text?',
    answer: 'Most images are processed in 2-5 seconds. The exact time depends on image size and complexity, but our AI model is optimized for speed without sacrificing accuracy.',
  },
  {
    question: 'What if the extracted text has errors?',
    answer: 'For best results, use high-resolution, well-lit images with clear text. If you notice errors, try uploading a higher quality version of the image or adjust lighting/contrast before capturing.',
  },
  {
    question: 'Can I extract text from handwritten notes?',
    answer: 'Yes, our OCR can handle handwritten text, though accuracy is higher for printed text. Clear, legible handwriting in good lighting will produce the best results.',
  },
  {
    question: 'Is there a download option?',
    answer: 'Yes! After extraction, you can either copy the text to your clipboard (C key) or download it as a text file (D key or Download button).',
  },
  {
    question: 'What image formats can I use?',
    answer: 'We support JPG, JPEG, PNG, WEBP, GIF, BMP, and most other image formats. For best OCR accuracy, use lossless formats like PNG for screenshots and scanned documents.',
  },
  {
    question: 'Can I extract text from multi-page documents?',
    answer: 'The tool processes one image at a time. For multi-page documents, extract text from each page separately, then combine the results. Use the History feature (H key) to access previous extractions while working through pages.',
  },
];

/**
 * Extract Text from Image page
 * SEO-optimized route for /extract-text-from-image
 */
export default function ExtractTextFromImage() {
  const isPreview = import.meta.env.MODE === "preview";
  const allowPreview = import.meta.env.VITE_ENABLE_ADS_IN_PREVIEW === "true";
  const slotsEnabled = (isPreview && allowPreview) || import.meta.env.VITE_ADS_SLOTS_ENABLED === "true";
  const consent = { ad_storage: 'denied' as const, ad_user_data: 'denied' as const, ad_personalization: 'denied' as const };
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalPath = '/extract-text-from-image';
  const canonicalAbsolute = new URL(canonicalPath, SITE_URL).toString();

  useSEO({
    title: "Extract Text from Image - Free AI-Powered OCR",
    description: "Extract text from any image online for free. Advanced AI OCR with 95%+ accuracy. Supports JPG, PNG, WEBP. No signup required.",
    canonical: canonicalPath,
  });

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: 'Extract Text from Image', item: canonicalAbsolute },
    ],
  };

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Extract Text from Image - Free AI-Powered OCR',
    description: 'Extract text from any image online for free using advanced AI-powered OCR technology.',
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
        title="Extract Text from Image - Free AI-Powered OCR"
        description="Extract text from any image online for free. Advanced AI OCR with 95%+ accuracy. Supports JPG, PNG, WEBP. No signup required."
        canonical={canonicalAbsolute}
        jsonLd={pageJsonLd}
      />
      <FAQSchema faqs={faqs} />
      <GuideLayout
        title="Extract Text from Image"
        description="Unlock text data from images using AI-powered OCR extraction"
      >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Overview</h2>
        <p className="mb-4">
          Extracting text from images transforms locked visual content into usable, editable, searchable data. Whether you're digitizing a library of printed materials, pulling quotes from social media screenshots, or archiving handwritten notes, text extraction automates what would otherwise be hours of manual retyping.
        </p>
        <p className="mb-4">
          Unlike simply viewing text in an image, <em>extracting</em> it means converting the visual representation into machine-readable characters that you can search, edit, translate, analyze, or store in databases. This capability is essential for knowledge workers, researchers, and anyone who needs to repurpose text from non-editable sources like PDFs, photos, or scanned documents.
        </p>
        <p>
          Our browser-based extraction tool uses AI-powered OCR (Optical Character Recognition) to identify and isolate text from images in seconds—no software installation, no uploads to external servers, and no limits on how many images you can process.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Who Needs Text Extraction from Images</h3>
        <ul className="space-y-3 ml-2">
          <li>
            <strong className="block mb-1">Researchers & Academics:</strong>
            <span className="text-foreground/90">Extract quotes, citations, and data from scanned academic papers, historical documents, or research notes. Build searchable digital archives from printed journals or books.</span>
          </li>
          <li>
            <strong className="block mb-1">Legal Professionals:</strong>
            <span className="text-foreground/90">Digitize contracts, court filings, case law excerpts, or deposition transcripts from scanned PDFs. Extract relevant clauses for analysis or inclusion in legal briefs.</span>
          </li>
          <li>
            <strong className="block mb-1">Journalists & Content Curators:</strong>
            <span className="text-foreground/90">Pull text from screenshots of social media posts, interviews, or press releases. Verify quotes, fact-check claims, or archive sources for investigative reporting.</span>
          </li>
          <li>
            <strong className="block mb-1">Librarians & Archivists:</strong>
            <span className="text-foreground/90">Convert rare books, historical manuscripts, or archival documents into searchable text. Preserve aging materials by digitizing before further deterioration.</span>
          </li>
          <li>
            <strong className="block mb-1">Data Analysts & Scientists:</strong>
            <span className="text-foreground/90">Extract numeric data, labels, or annotations from charts, graphs, or published research figures. Convert legacy data tables from scanned reports into analyzable formats.</span>
          </li>
          <li>
            <strong className="block mb-1">Accessibility Specialists:</strong>
            <span className="text-foreground/90">Extract text from image-based content (infographics, memes, social media posts) to create alt text, captions, or transcripts for screen reader users.</span>
          </li>
          <li>
            <strong className="block mb-1">Personal Productivity Users:</strong>
            <span className="text-foreground/90">Digitize personal journals, handwritten to-do lists, or recipes from cookbooks. Extract text from photos of whiteboards, sticky notes, or event schedules captured on your phone.</span>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">How Text Extraction Works: OCR Pipeline Explained</h2>
        <p className="mb-4">
          Text extraction is a sophisticated process that combines computer vision, machine learning, and linguistic analysis. Our system performs the following steps to isolate and capture text from images:
        </p>

        <h3 className="text-xl font-medium mb-2">Step 1: Image Acquisition and Normalization</h3>
        <p className="mb-3">
          When you upload an image, the system first standardizes it for optimal recognition:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Format conversion:</strong> All image formats (JPG, PNG, WEBP, etc.) are converted to a standardized internal format.</li>
          <li><strong>Color space normalization:</strong> Color images are analyzed to determine if they contain meaningful color information. For text extraction, most images are converted to grayscale, which simplifies processing and improves speed.</li>
          <li><strong>Resolution assessment:</strong> The system checks image resolution. Very low-resolution images (below 720p) trigger a quality warning, while very high-resolution images may be downscaled slightly to balance speed and accuracy.</li>
        </ul>

        <h3 className="text-xl font-medium mb-2">Step 2: Text Region Detection</h3>
        <p className="mb-3">
          Before recognizing individual characters, the system identifies where text exists in the image:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Layout analysis:</strong> Computer vision algorithms scan the image for text-like patterns—continuous sequences of similar-sized shapes arranged in lines.</li>
          <li><strong>Bounding box creation:</strong> Each detected text region is enclosed in a bounding box. These boxes define the areas to be processed by the OCR engine.</li>
          <li><strong>Reading order determination:</strong> The system determines the logical reading order (top-to-bottom, left-to-right for Latin scripts) to preserve document structure in the extracted output.</li>
        </ul>
        <p className="mb-4">
          This stage is crucial for complex images containing multiple text blocks (e.g., newspaper pages, infographics with captions, or screenshots with overlaid text).
        </p>

        <h3 className="text-xl font-medium mb-2">Step 3: Character Recognition (OCR)</h3>
        <p className="mb-3">
          With text regions identified, the OCR engine processes each bounding box:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Tesseract OCR:</strong> Our primary recognition engine uses Tesseract, which compares detected character shapes against a trained model of letter and symbol patterns. Tesseract handles 100+ languages and achieves 95%+ accuracy on clear printed text.</li>
          <li><strong>Line and word segmentation:</strong> The engine breaks each text region into lines, then words, then individual characters. This segmentation respects whitespace, punctuation, and line breaks.</li>
          <li><strong>Confidence scoring:</strong> Each recognized character receives a confidence score (0-100%). Low-confidence characters may be flagged for review or alternative processing.</li>
        </ul>

        <h3 className="text-xl font-medium mb-2">Step 4: AI-Powered Verification (Optional)</h3>
        <p className="mb-3">
          For challenging text (handwriting, unusual fonts, low quality), an AI fallback provides enhanced recognition:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Vision-Language Model:</strong> A deep learning model trained on millions of text images re-analyzes low-confidence regions. This model understands context—for example, it can infer partially obscured letters based on surrounding words.</li>
          <li><strong>Ensemble voting:</strong> When both Tesseract and the AI model produce results, the system compares them. If they agree, confidence is high. If they differ, the system selects the more plausible result based on language models and context.</li>
        </ul>

        <h3 className="text-xl font-medium mb-2">Step 5: Text Reconstruction and Formatting</h3>
        <p className="mb-3">
          Finally, the system assembles individual character recognitions into coherent text:
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Whitespace restoration:</strong> Spaces between words, line breaks, and paragraph separations are reconstructed based on the original image layout.</li>
          <li><strong>Punctuation handling:</strong> Periods, commas, quotes, and other punctuation are recognized and placed correctly.</li>
          <li><strong>Unicode encoding:</strong> All text is output in UTF-8 Unicode, supporting international characters, symbols, and emoji.</li>
          <li><strong>Output delivery:</strong> The extracted text is displayed in an editable text box, ready for copying, downloading, or further editing.</li>
        </ul>

        <p className="mt-4">
          This entire pipeline completes in 2–5 seconds for typical images, running entirely in your browser using WebAssembly and JavaScript—no server uploads required.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Step-by-Step: Extract Text from Any Image</h2>
        <p className="mb-4">
          Follow this detailed workflow to extract text from images efficiently:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Step 1: Prepare Your Image</h3>
            <p className="mb-2">
              Before uploading, optimize your image for best extraction results:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Check resolution:</strong> Ensure the image is at least 1280×720 pixels. For text smaller than 12pt, use 1920×1080 or higher.</li>
              <li><strong>Straighten if needed:</strong> If the image is rotated or skewed, use your device's photo editor to straighten it. Text should be horizontally aligned.</li>
              <li><strong>Crop to focus area:</strong> Remove unnecessary borders, backgrounds, or non-text content. Focusing the OCR on the text region improves speed and accuracy.</li>
              <li><strong>Adjust contrast (if necessary):</strong> For low-contrast images (e.g., faded printouts), increase contrast using a photo editor before uploading.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 2: Upload the Image</h3>
            <p className="mb-2">
              Navigate to the <Link to="/" className="text-primary hover:text-primary/80">home page</Link> or <Link to="/extract-text-from-image" className="text-primary hover:text-primary/80">Extract Text from Image</Link> tool. Load your image using one of these methods:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Drag and drop:</strong> Drag the image file from your desktop or file manager into the dropzone.</li>
              <li><strong>File browser:</strong> Click the dropzone or "Choose File" button to open your system's file picker.</li>
              <li><strong>Paste from clipboard:</strong> If you've taken a screenshot or copied an image, click the dropzone and press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Ctrl+V</kbd> (Windows/Linux) or <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Cmd+V</kbd> (Mac) to paste it instantly.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 3: Preview and Verify</h3>
            <p>
              After uploading, the image appears in a preview pane. Inspect it to confirm:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>The text is visible and legible</li>
              <li>The image is properly oriented (not upside down or sideways)</li>
              <li>There are no major quality issues (extreme blur, heavy shadows, or glare obscuring text)</li>
            </ul>
            <p className="mt-2">
              If the preview looks good, proceed to extraction. If not, correct the issues and re-upload.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 4: Start Text Extraction</h3>
            <p className="mb-2">
              Click the <strong>"Extract Text"</strong> button (or press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Enter</kbd>). The extraction process begins immediately. You'll see progress indicators:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Analyzing image...</strong> Detecting text regions and preparing for OCR</li>
              <li><strong>Extracting text...</strong> Running character recognition on each text region</li>
              <li><strong>Finalizing...</strong> Reconstructing full text with proper formatting and spacing</li>
            </ul>
            <p className="mt-2">
              Most images complete extraction in 2–5 seconds. Larger images (10MB+) or those with extensive text (e.g., full book pages) may take up to 10 seconds.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 5: Review Extracted Text</h3>
            <p className="mb-2">
              The extracted text appears in an editable text box below the image. Review it carefully:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Check accuracy:</strong> Scan for obvious errors like misread characters (e.g., "0" instead of "O", "1" instead of "I").</li>
              <li><strong>Verify completeness:</strong> Ensure all text regions from the image are represented. If the image contained multiple columns or text blocks, confirm they appear in logical order.</li>
              <li><strong>Edit if needed:</strong> The text box is fully editable. Correct any OCR mistakes directly before copying or downloading.</li>
            </ul>
            <p className="mt-2">
              If extraction quality is poor (many errors or missing text), see the accuracy tips below for guidance on improving results.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 6: Use the Extracted Text</h3>
            <p className="mb-2">
              Choose how to export or use the extracted text:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Copy to clipboard:</strong> Click <strong>"Copy"</strong> or press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">C</kbd>. The text is now in your clipboard, ready to paste (Ctrl+V / Cmd+V) into any application.</li>
              <li><strong>Download as .txt file:</strong> Click <strong>"Download"</strong> or press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">D</kbd> to save the text as a plain text file on your computer.</li>
              <li><strong>Select partial text:</strong> Use your mouse to select specific portions of the extracted text, then copy or edit just those sections.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 7: Process Multiple Images (Optional)</h3>
            <p className="mb-2">
              If you have multiple images to extract from:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Sequential processing:</strong> Extract one image, then click "New Image" or simply upload the next file. Your previous extraction is automatically saved to History.</li>
              <li><strong>Access history:</strong> Press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">H</kbd> or click the <strong>"History"</strong> button to view all past extractions in the current session. You can copy or download any previous result from the history panel.</li>
              <li><strong>Parallel tabs:</strong> For batch processing, open multiple browser tabs (one per image) and extract simultaneously. Each tab operates independently.</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-primary/10 border-l-4 border-primary rounded">
          <p className="font-medium mb-1">Pro Tip: Organizing Large Extraction Projects</p>
          <p className="text-sm">
            When digitizing a multi-page document or batch of images, create a folder structure on your computer beforehand. Download each extracted text file with a descriptive filename (e.g., "page-01.txt", "page-02.txt"), making it easy to combine or reference them later.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Advanced Tips for Reliable Text Extraction</h2>
        <p className="mb-4">
          Extraction accuracy depends heavily on image quality and content characteristics. Apply these techniques for optimal results:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Image Quality Standards</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Resolution threshold:</strong> 1280×720 pixels minimum; 1920×1080 or higher recommended for small text (10pt or smaller).</li>
              <li><strong>Compression artifacts:</strong> Avoid heavily compressed JPEGs (quality settings below 80%). Compression introduces blocky artifacts that confuse OCR. Use PNG for screenshots or scanned documents.</li>
              <li><strong>Focus and sharpness:</strong> Blurry images drastically reduce accuracy. When photographing documents, use your camera's tap-to-focus feature and hold steady.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Lighting and Exposure</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Even illumination:</strong> Avoid dark corners or bright hotspots. Use diffused natural light or soft artificial lighting.</li>
              <li><strong>Eliminate glare:</strong> Glossy or laminated pages can create reflections. Angle your camera or move the light source to minimize shine.</li>
              <li><strong>Contrast ratio:</strong> Dark text on light backgrounds (or vice versa) is ideal. If your image has low contrast, adjust brightness/contrast in a photo editor before extracting.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Text Orientation and Layout</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Horizontal alignment:</strong> Ensure text lines are horizontal (not tilted). Most OCR engines expect left-to-right, top-to-bottom reading order for Latin scripts.</li>
              <li><strong>Deskewing:</strong> If the image is skewed (perspective distortion from angled photography), use a photo editing app's "perspective correction" or "deskew" tool.</li>
              <li><strong>Multiple columns:</strong> Images with newspaper-style columns may confuse reading order. If possible, crop each column separately and extract individually.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Font and Typography Considerations</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Font size:</strong> Text smaller than 9pt (roughly 12px on screen) often causes errors. If your source allows, increase font size before capturing the image.</li>
              <li><strong>Font style:</strong> Plain, sans-serif fonts (Arial, Helvetica, Calibri) and standard serif fonts (Times New Roman, Georgia) work best. Highly decorative, script, or handwritten fonts are more error-prone.</li>
              <li><strong>Bold and italic:</strong> Normal weight text is most reliable. Extra-bold or very thin fonts may be misread.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Handling Special Content Types</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Handwritten text:</strong> OCR accuracy drops significantly for handwriting. For best results, use images of clear, legible print handwriting (not cursive). Consider our <Link to="/handwriting-to-text" className="text-primary hover:text-primary/80">Handwriting to Text</Link> guide for specialized tips.</li>
              <li><strong>Text on colored backgrounds:</strong> Text overlaid on photos or colored backgrounds (e.g., infographics, memes) is more challenging. Crop to isolate text regions if possible.</li>
              <li><strong>Multi-language documents:</strong> The OCR supports 100+ languages. For best results, ensure the entire image contains text in one primary language. Mixed-language documents may have reduced accuracy at language boundaries.</li>
              <li><strong>Mathematical formulas and symbols:</strong> Standard OCR handles basic mathematical symbols (÷, ×, =, etc.), but complex LaTeX-style formulas may require specialized tools. See our <Link to="/math-to-latex" className="text-primary hover:text-primary/80">Math to LaTeX</Link> guide.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">When to Re-Extract</h3>
            <p className="mb-2">
              Consider re-capturing and re-extracting if:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>More than 10% of words contain errors</li>
              <li>Entire lines or paragraphs are missing from the output</li>
              <li>Reading order is scrambled (e.g., columns extracted out of sequence)</li>
            </ul>
            <p className="mt-2">
              In these cases, improving the source image (better lighting, higher resolution, straightening) and re-extracting is faster than manually correcting extensive OCR mistakes.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Privacy & Security in Text Extraction</h2>
        <p className="mb-4">
          Extracting text from sensitive documents requires robust privacy protections. Here's how our tool safeguards your data:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Client-side processing only:</strong> All OCR operations occur entirely in your web browser using WebAssembly. Your images and extracted text never leave your device—no server uploads, no cloud storage.</li>
          <li><strong>Zero data retention:</strong> We do not log, store, or transmit any images or text. Once you close the browser tab, all data is permanently deleted from memory.</li>
          <li><strong>Anonymous usage:</strong> No account, login, or personal information is required. You can use the tool completely anonymously.</li>
          <li><strong>Local history storage:</strong> The History feature stores past extractions in your browser's local storage (IndexedDB), which resides on your device. This data is not synced to servers and can be cleared at any time via your browser settings.</li>
          <li><strong>Secure transmission:</strong> All web traffic (including this page) is encrypted via HTTPS, protecting against man-in-the-middle attacks.</li>
          <li><strong>No third-party data sharing:</strong> We do not share your data with advertisers, analytics platforms, or other third parties. Your text extraction activity is completely private.</li>
        </ul>
        <p className="mt-4">
          This architecture makes our tool safe for extracting text from confidential contracts, medical records, financial statements, legal documents, or any other sensitive material. Because processing happens locally, you maintain complete control over your data.
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
            <Link to="/copy-text-from-image" className="text-primary hover:text-primary/80">Copy Text from Image</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/image-to-text" className="text-primary hover:text-primary/80">Image to Text Converter</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/jpg-to-excel" className="text-primary hover:text-primary/80">JPG to Excel</Link>
          </div>
        </nav>
      </section>
      </GuideLayout>
    </>
  );
}
