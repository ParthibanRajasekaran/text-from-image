import React from "react";
import { SEO, baseJsonLd, createFAQJsonLd } from "../components/SEO";
import { useSEO } from "../src/seo";
import { FAQSchema } from "../components/FAQSchema";
import { Link } from "react-router-dom";
import { GuideLayout } from "../src/layouts/GuideLayout";
import { TableWrap } from "../src/components/TableWrap";
import { InArticle } from "../src/ads/InArticle";

const faqs = [
  {
    question: "What does 'copy text from image' mean?",
    answer: "It means extracting and copying text found in an image to your clipboard, making it easy to reuse or share.",
  },
  {
    question: "Is the process secure?",
    answer: "Yes. All OCR is performed locally in your browser. No images or text are sent to any server.",
  },
  {
    question: "Can I copy text from screenshots?",
    answer: "Absolutely! Screenshots, scanned documents, and photos are all supported.",
  },
  {
    question: "Does it work with handwriting?",
    answer: "Handwriting is supported, but results depend on clarity and style.",
  },
  {
    question: "Are there limits on usage?",
    answer: "No limits. Use as often as you need, free of charge.",
  },
  {
    question: "Will formatting be preserved?",
    answer: "Basic formatting is preserved, but complex layouts may not transfer perfectly.",
  },
  {
    question: "Can I use this on mobile?",
    answer: "Yes, our app is mobile-friendly and works in most browsers."
  }
];

// FAQSchema returns a <script> tag with FAQPage JSON-LD

export default function CopyTextFromImageGuide() {
  const isPreview = import.meta.env.MODE === "preview";
  const allowPreview = import.meta.env.VITE_ENABLE_ADS_IN_PREVIEW === "true";
  const slotsEnabled = (isPreview && allowPreview) || import.meta.env.VITE_ADS_SLOTS_ENABLED === "true";
  const consent = { ad_storage: 'denied' as const, ad_user_data: 'denied' as const, ad_personalization: 'denied' as const };
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalPath = '/copy-text-from-image';
  const canonicalAbsolute = new URL(canonicalPath, SITE_URL).toString();

  // SEO meta tags (title/description/canonical) via useSEO helper
  useSEO({
    title: 'Copy Text from Image – Free OCR Guide',
    description: 'Step-by-step guide to copy text from images using secure, client-side OCR. Tips, examples, and FAQs.',
    canonical: canonicalPath,
  });

  // Structured data: BreadcrumbList, Article, FAQ (if present)
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: 'Copy Text from Image', item: canonicalAbsolute },
    ],
  };

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Copy Text from Image – Free OCR Guide',
    description: 'Step-by-step guide to copy text from images using secure, client-side OCR. Tips, examples, and FAQs.',
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
        title="Copy Text from Image – Free OCR Guide"
        description="Quickly copy text from images using our secure, client-side OCR tool. Step-by-step instructions, tips, and FAQs."
        canonical={canonicalAbsolute}
        jsonLd={pageJsonLd}
      />
      <FAQSchema faqs={faqs} />
      <GuideLayout
        title="Copy Text from Image"
        description="Instantly extract and copy text from images using secure, browser-based OCR"
      >
      <section className="mb-6">
        <p>
          Copying text from images is a common need in modern workflows. Whether you're digitizing handwritten notes, extracting quotes from screenshots, or repurposing text from scanned documents, having a reliable method to convert visual text into editable content saves time and reduces errors from manual retyping.
        </p>
        <p className="mt-3">
          Our browser-based OCR tool processes images entirely on your device, ensuring your documents remain private while delivering fast, accurate text extraction. No account creation, no file uploads to external servers, and no usage limits—just straightforward optical character recognition whenever you need it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Who Should Use This Tool</h2>
        <p className="mb-3">
          This guide is designed for anyone who regularly encounters text locked inside images. Common use cases include:
        </p>
        <ul className="list-disc ml-6 space-y-2 mb-3">
          <li><strong>Students and researchers:</strong> Extract quotes from textbook photos, lecture slides, or research papers to include in notes or citations.</li>
          <li><strong>Business professionals:</strong> Copy text from business cards, receipts, invoices, or presentation screenshots for expense tracking or client databases.</li>
          <li><strong>Content creators:</strong> Repurpose text from social media images, infographics, or competitor materials for analysis or inspiration.</li>
          <li><strong>Remote workers:</strong> Digitize whiteboard photos from brainstorming sessions or capture action items from meeting screenshots.</li>
          <li><strong>Legal and compliance teams:</strong> Extract text from document scans for contract review, compliance audits, or evidence documentation.</li>
        </ul>
        <p>
          If you frequently find yourself manually retyping text visible in photos or screenshots, this tool eliminates that tedious work in seconds.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">How Our OCR Technology Works</h2>
        <p className="mb-3">
          Optical Character Recognition (OCR) technology analyzes the shapes, patterns, and structures within an image to identify individual characters and words. Our implementation uses two complementary approaches:
        </p>
        <div className="mb-4">
          <h3 className="text-xl font-medium mb-2">Fast OCR Engine (Tesseract)</h3>
          <p className="mb-2">
            For clean, printed text with standard fonts, our primary engine delivers results in under 2 seconds. This method excels at:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Typed documents and digital screenshots</li>
            <li>Book pages and magazine scans</li>
            <li>Business cards with printed text</li>
            <li>Computer-generated images containing text</li>
          </ul>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-medium mb-2">AI-Powered Fallback (Transformers)</h3>
          <p className="mb-2">
            When the fast engine encounters challenges—such as unusual fonts, poor lighting, or handwritten content—our system automatically switches to an advanced AI model. This backup method handles:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Handwritten notes and annotations</li>
            <li>Stylized or decorative fonts</li>
            <li>Low-quality or compressed images</li>
            <li>Text with background noise or watermarks</li>
          </ul>
        </div>
        <p className="mt-3">
          Both engines run entirely in your browser using WebAssembly and client-side JavaScript. No image data ever leaves your device, ensuring complete privacy.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Step-by-Step: Copying Text from Images</h2>
        <p className="mb-4">
          Follow these detailed instructions to extract text from any image using our tool. The entire process typically takes less than 10 seconds.
        </p>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Step 1: Upload Your Image</h3>
            <p className="mb-2">
              Navigate to the home page where you'll find the upload area. You have three convenient options:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Drag and drop:</strong> Simply drag your image file from your desktop or file manager directly onto the upload zone.</li>
              <li><strong>Click to browse:</strong> Click the "Upload Image" button to open your system's file picker and select an image (PNG, JPG, WEBP supported).</li>
              <li><strong>Paste from clipboard:</strong> If you've just taken a screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows), press Cmd+V or Ctrl+V to paste it directly.</li>
            </ul>
            <p className="mt-2">
              The tool accepts images up to 20MB in size, which accommodates even high-resolution document scans.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 2: Preview and Confirm</h3>
            <p>
              After selecting your image, you'll see a preview thumbnail. This allows you to verify you've chosen the correct file before processing begins. If the wrong image appears, simply click "Clear" or "Remove" and upload the correct one.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 3: Automatic OCR Processing</h3>
            <p className="mb-2">
              The moment your image loads, our OCR engine begins analyzing it. You'll see:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>A progress indicator showing the current processing stage</li>
              <li>Real-time status updates (e.g., "Analyzing image structure..." or "Extracting text...")</li>
              <li>The OCR method being used (Fast OCR or AI Model)</li>
            </ul>
            <p className="mt-2">
              Most images complete processing in 1-3 seconds. Complex or low-quality images may take up to 10 seconds when the AI fallback engages.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 4: Review Extracted Text</h3>
            <p>
              Once processing completes, the extracted text appears in the results panel on the right side of your screen. Scan through it to verify accuracy. The tool displays:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>The full extracted text with preserved line breaks</li>
              <li>Confidence score (when available) indicating OCR accuracy</li>
              <li>Word count for quick reference</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 5: Copy to Clipboard</h3>
            <p className="mb-2">
              To copy the extracted text, you have two options:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Click the Copy button:</strong> Located at the top of the results panel, this copies all extracted text to your clipboard instantly.</li>
              <li><strong>Use keyboard shortcut:</strong> Press Cmd+C (Mac) or Ctrl+C (Windows) while the results panel is focused.</li>
            </ul>
            <p className="mt-2">
              You'll see a brief confirmation message ("Copied!") to indicate success. The text is now ready to paste into any application—email, document editor, spreadsheet, or note-taking app.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 6: Optional - Download as Text File</h3>
            <p>
              If you prefer to save the extracted text for later use, click the "Download" button. This generates a .txt file named after your original image (e.g., "receipt-photo.txt") and saves it to your default downloads folder.
            </p>
          </div>
        </div>

        <p className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <strong>Pro Tip:</strong> For batch processing multiple images, extract text from each one, then paste all results into a single document before copying. Our tool maintains your history during the session, allowing you to switch between previously processed images without re-uploading.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Maximizing OCR Accuracy: Best Practices</h2>
        <p className="mb-4">
          While our OCR engine handles a wide variety of image conditions, following these guidelines significantly improves extraction accuracy and reduces errors.
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Image Resolution and DPI</h3>
            <p className="mb-2">
              Higher resolution images yield better results. Aim for these minimum specifications:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Scanned documents:</strong> 300 DPI or higher recommended (200 DPI minimum)</li>
              <li><strong>Digital photos:</strong> At least 1920×1080 pixels (Full HD) for text-heavy content</li>
              <li><strong>Screenshots:</strong> Use your device's native resolution; avoid downscaling before upload</li>
            </ul>
            <p className="mt-2">
              If you're scanning physical documents, avoid the "fast scan" or "draft" settings on your scanner or smartphone scanning app. These typically produce 150 DPI images, which may cause character recognition errors.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Lighting and Contrast</h3>
            <p className="mb-2">
              Good contrast between text and background is crucial. Follow these tips:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Even lighting:</strong> Ensure the entire document is uniformly lit; avoid shadows across text areas</li>
              <li><strong>Reduce glare:</strong> When photographing glossy pages, angle your camera to minimize reflections</li>
              <li><strong>Background separation:</strong> Dark text on light backgrounds (or vice versa) works best; avoid low-contrast combinations like light gray text on white</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Image Orientation and Alignment</h3>
            <p className="mb-2">
              Properly oriented images dramatically improve recognition rates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Straighten skewed text:</strong> If your image is tilted, use your phone's built-in photo editor or a desktop app to rotate it before uploading</li>
              <li><strong>Correct orientation:</strong> Ensure text reads left-to-right and top-to-bottom (for Latin scripts)</li>
              <li><strong>Crop unnecessary areas:</strong> Remove borders, backgrounds, or other content that doesn't contain text you want to extract</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Font Considerations</h3>
            <p className="mb-2">
              OCR performs best with certain text characteristics:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Font size:</strong> Text smaller than 10pt may cause errors; 12pt or larger is ideal</li>
              <li><strong>Font style:</strong> Standard fonts (Arial, Times New Roman, Helvetica) work better than highly decorative or script fonts</li>
              <li><strong>Text weight:</strong> Normal and bold weights are reliable; very thin or extra-bold text may confuse the engine</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Handling Handwritten Text</h3>
            <p className="mb-2">
              Handwriting recognition is inherently more challenging than printed text, but you can improve results:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Legibility matters:</strong> Clear, well-spaced handwriting yields better results than cursive or cramped text</li>
              <li><strong>Use dark ink:</strong> Black or dark blue ink on white paper provides the best contrast</li>
              <li><strong>Write larger:</strong> Handwriting that's too small often causes misrecognition</li>
              <li><strong>Try the AI model:</strong> If the fast engine struggles, our AI-powered fallback often handles handwriting better</li>
            </ul>
            <p className="mt-2">
              For critical handwritten documents, always review extracted text carefully and correct any errors before using it.
            </p>
          </div>
        </div>

        <p className="mt-4 p-4 bg-muted/40 rounded-lg">
          <strong>When to re-scan:</strong> If your initial OCR results show significant errors (more than 10% of words incorrect), it's usually faster to re-scan or re-photograph the document with better lighting and alignment than to manually correct extensive OCR mistakes.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Privacy note</h2>
        <p>
          All OCR is performed in your browser. No images or text are uploaded, stored, or shared. No account needed.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Online vs Native OCR</h2>
        <TableWrap>
          <thead>
            <tr className="bg-muted/40">
              <th className="px-4 py-3 text-left font-semibold">Feature</th>
              <th className="px-4 py-3 text-left font-semibold">Online OCR (Our App)</th>
              <th className="px-4 py-3 text-left font-semibold">Native OCR (Desktop)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border/40">
              <td className="px-4 py-3">Privacy</td>
              <td className="px-4 py-3">Client-side, no upload</td>
              <td className="px-4 py-3">Depends on app</td>
            </tr>
            <tr className="border-t border-border/40">
              <td className="px-4 py-3">Setup</td>
              <td className="px-4 py-3">No install, instant</td>
              <td className="px-4 py-3">Requires installation</td>
            </tr>
            <tr className="border-t border-border/40">
              <td className="px-4 py-3">Accuracy</td>
              <td className="px-4 py-3">High (good images)</td>
              <td className="px-4 py-3">High (pro tools)</td>
            </tr>
            <tr className="border-t border-border/40">
              <td className="px-4 py-3">Handwriting</td>
              <td className="px-4 py-3">Supported, variable</td>
              <td className="px-4 py-3">Supported, variable</td>
            </tr>
            <tr className="border-t border-border/40">
              <td className="px-4 py-3">Export options</td>
              <td className="px-4 py-3">Copy to clipboard</td>
              <td className="px-4 py-3">Copy, save file</td>
            </tr>
          </tbody>
        </TableWrap>
      </section>

      {slotsEnabled && <InArticle consent={consent} />}

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">FAQs</h2>
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
            <Link to="/extract-text-from-image" className="text-primary hover:text-primary/80">Extract Text from Image Guide</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/jpg-to-word" className="text-primary hover:text-primary/80">JPG to Word Guide</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/jpg-to-excel" className="text-primary hover:text-primary/80">JPG to Excel Guide</Link>
          </div>
        </nav>
      </section>
      </GuideLayout>
    </>
  );
}
