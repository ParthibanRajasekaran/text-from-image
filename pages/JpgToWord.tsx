import React from "react";
import { SEO, baseJsonLd, createFAQJsonLd } from "../components/SEO";
import { useSEO } from "../src/seo";
import { FAQSchema } from "../components/FAQSchema";
import { Link } from "react-router-dom";
import { GuideLayout } from "../src/layouts/GuideLayout";
import { InArticle } from "../src/ads/InArticle";

const faqs = [
  {
    question: 'How do I convert JPG to Word?',
    answer: 'Simply upload your JPG image using the dropzone above. Our OCR will extract all text, and you can then download the result as a .txt file which can be opened in Word or converted to DOCX format.',
  },
  {
    question: 'Can I maintain formatting from the original JPG?',
    answer: 'Our tool extracts plain text content. While it preserves the text accurately, complex formatting, images, and layouts need to be adjusted manually in Word after conversion.',
  },
  {
    question: 'Does this work with scanned documents?',
    answer: 'Yes! Our OCR is specifically designed to handle scanned documents. For best results, ensure the scan is clear, well-lit, and at least 300 DPI resolution.',
  },
  {
    question: 'Is the Word document editable?',
    answer: 'Yes, the extracted text is fully editable. You can copy it directly or download as a text file to import into Word, where you can format, edit, and save as a proper DOCX document.',
  },
  {
    question: 'What image formats are supported besides JPG?',
    answer: 'We support JPG, JPEG, PNG, WEBP, GIF, BMP, and other common image formats. All formats are processed with the same OCR technology.',
  },
  {
    question: 'Can I convert multi-page documents?',
    answer: 'Process each page individually, then combine the extracted text in Word. Use the History feature (H key) to access previous extractions while working through pages.',
  },
];

/**
 * JPG to Word page
 * SEO-optimized route for /jpg-to-word
 */
export default function JpgToWord() {
  const isPreview = import.meta.env.MODE === "preview";
  const allowPreview = import.meta.env.VITE_ENABLE_ADS_IN_PREVIEW === "true";
  const slotsEnabled = (isPreview && allowPreview) || import.meta.env.VITE_ADS_SLOTS_ENABLED === "true";
  const consent = { ad_storage: 'denied' as const, ad_user_data: 'denied' as const, ad_personalization: 'denied' as const };
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalPath = '/jpg-to-word';
  const canonicalAbsolute = new URL(canonicalPath, SITE_URL).toString();

  useSEO({
    title: "JPG to Word Converter - Extract Text to DOCX Format",
    description: "Convert JPG images to Word documents instantly. Extract text from photos and save as editable DOCX files. Free online JPG to Word converter with OCR.",
    canonical: canonicalPath,
  });

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: 'JPG to Word', item: canonicalAbsolute },
    ],
  };

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'JPG to Word Converter - Extract Text to DOCX Format',
    description: 'Convert JPG images to Word documents instantly using OCR technology.',
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
        title="JPG to Word Converter - Extract Text to DOCX Format"
        description="Convert JPG images to Word documents instantly. Extract text from photos and save as editable DOCX files. Free online JPG to Word converter with OCR."
        canonical={canonicalAbsolute}
        jsonLd={pageJsonLd}
      />
      <FAQSchema faqs={faqs} />
      <GuideLayout
        title="JPG to Word Converter"
        description="Transform JPG images into editable Word documents with OCR technology"
      >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Overview</h2>
        <p className="mb-4">
          Converting JPG images to Word documents transforms static visual content into editable, formatted, professional text files. Whether you've scanned a printed letter, photographed meeting notes, or received a document as an image file, our OCR-powered converter extracts the text and prepares it for import into Microsoft Word, Google Docs, or any word processor.
        </p>
        <p className="mb-4">
          Unlike simply viewing text in an image, converting to Word format enables full document editing—you can correct typos, adjust formatting, add comments, track changes, merge with other documents, and collaborate with colleagues. This capability is essential for modernizing legacy documents, creating editable versions of printed materials, or repurposing content from image-based sources.
        </p>
        <p>
          Our browser-based tool uses AI-powered OCR to recognize text from JPG (and PNG, WEBP, GIF, BMP) images, then outputs plain text that you can paste directly into Word or download as a .txt file for conversion to .docx. All processing happens locally in your browser—no uploads, no account required, and complete privacy.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Who Benefits from JPG to Word Conversion</h3>
        <ul className="space-y-3 ml-2">
          <li>
            <strong className="block mb-1">Office Professionals & Administrators:</strong>
            <span className="text-foreground/90">Digitize scanned contracts, agreements, memos, or forms received as images. Convert them to Word format for editing, signature insertion, or distribution to teams.</span>
          </li>
          <li>
            <strong className="block mb-1">Legal & Compliance Teams:</strong>
            <span className="text-foreground/90">Convert scanned legal documents, court filings, or regulatory notices into editable Word files. Extract clauses for revision, redlining, or comparison with other documents.</span>
          </li>
          <li>
            <strong className="block mb-1">Writers & Editors:</strong>
            <span className="text-foreground/90">Digitize printed manuscripts, book excerpts, or article drafts. Convert image-based submissions from authors into Word format for editing, formatting, and publication workflows.</span>
          </li>
          <li>
            <strong className="block mb-1">Students & Educators:</strong>
            <span className="text-foreground/90">Convert lecture slides, textbook pages, or study guides into Word documents for note-taking, annotation, or creating study materials. Transform handwritten class notes into typed documents for organization and sharing.</span>
          </li>
          <li>
            <strong className="block mb-1">Healthcare Professionals:</strong>
            <span className="text-foreground/90">Digitize patient records, medical forms, or printed reports. Convert them to Word for integration into electronic health record systems or for creating editable templates.</span>
          </li>
          <li>
            <strong className="block mb-1">Archivists & Records Managers:</strong>
            <span className="text-foreground/90">Modernize historical documents, organizational records, or legacy files available only as scanned images. Convert to Word for searchability, accessibility, and long-term digital preservation.</span>
          </li>
          <li>
            <strong className="block mb-1">Translators & Multilingual Teams:</strong>
            <span className="text-foreground/90">Extract text from foreign-language documents provided as images, then paste into Word for translation, localization, or side-by-side bilingual document creation.</span>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">How JPG to Word Conversion Works</h2>
        <p className="mb-4">
          Converting images to Word-ready documents involves OCR (Optical Character Recognition) to extract text, followed by formatting and export steps. Here's the complete process:
        </p>

        <h3 className="text-xl font-medium mb-2">Stage 1: OCR Text Extraction</h3>
        <p className="mb-3">
          The conversion begins with OCR to identify and extract text from the JPG image:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Image pre-processing:</strong> The system enhances image quality by reducing noise, adjusting contrast, and binarizing (converting to black-and-white). Skewed images are automatically straightened.</li>
          <li><strong>Text region detection:</strong> Computer vision algorithms identify all areas containing text—paragraphs, headings, captions, page numbers—and determine their reading order.</li>
          <li><strong>Character recognition:</strong> Tesseract OCR analyzes each detected character, comparing it against trained models of letter shapes. The engine recognizes letters, numbers, punctuation, and special symbols.</li>
          <li><strong>AI fallback (optional):</strong> For challenging content (handwriting, unusual fonts, low quality), a vision-language model provides enhanced recognition with contextual understanding.</li>
        </ul>

        <h3 className="text-xl font-medium mb-2">Stage 2: Text Structure Preservation</h3>
        <p className="mb-3">
          Once text is extracted, the system attempts to preserve document structure:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Paragraph detection:</strong> Line breaks and paragraph separations are identified based on whitespace patterns in the original image.</li>
          <li><strong>Reading order:</strong> For documents with multiple columns or complex layouts (e.g., newspapers, brochures), the system determines logical reading order (typically left-to-right, top-to-bottom for English).</li>
          <li><strong>Whitespace preservation:</strong> Indentation, line spacing, and empty lines are maintained where possible to reflect the original document's structure.</li>
        </ul>
        <p className="mb-4">
          <em>Note:</em> Complex formatting (fonts, colors, bold/italic, tables, images) is not preserved in the OCR output. You'll need to reapply these in Word after importing the text.
        </p>

        <h3 className="text-xl font-medium mb-2">Stage 3: Plain Text Output</h3>
        <p className="mb-3">
          The extracted text is delivered as plain text (UTF-8 Unicode):
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Text format:</strong> All output is plain text—no fonts, colors, or styling. This ensures compatibility with any word processor.</li>
          <li><strong>Line breaks:</strong> Paragraphs are separated by double line breaks. Single line breaks within paragraphs are preserved.</li>
          <li><strong>Special characters:</strong> Unicode characters (accented letters, symbols, emoji, non-Latin scripts) are fully supported.</li>
        </ul>

        <h3 className="text-xl font-medium mb-2">Stage 4: Importing into Word</h3>
        <p className="mb-3">
          Once you have the extracted text, import it into Microsoft Word:
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Copy-paste method:</strong> Copy the text from our tool and paste (Ctrl+V / Cmd+V) directly into a new Word document. Word will preserve paragraph breaks.</li>
          <li><strong>Import .txt file:</strong> Download the extracted text as a .txt file, then open it in Word (<strong>File → Open</strong> → select .txt file). Word automatically converts it to a .docx document.</li>
          <li><strong>Save as .docx:</strong> After importing, save the document as .docx format (<strong>File → Save As → Word Document (.docx)</strong>) to enable full Word features (formatting, comments, track changes, etc.).</li>
        </ul>

        <p className="mt-4">
          For documents with tables or structured data, consider our <Link to="/jpg-to-excel" className="text-primary hover:text-primary/80">JPG to Excel</Link> guide, which preserves row/column relationships for spreadsheet import.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Step-by-Step: Converting JPG to Word</h2>
        <p className="mb-4">
          Follow these detailed instructions to convert a JPG image into an editable Word document:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Step 1: Prepare Your JPG Image</h3>
            <p className="mb-2">
              Before conversion, optimize your image for best OCR results:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Resolution:</strong> Use images with at least 1280×720 pixels (720p). For documents with small text (10pt or less), use 1920×1080 (1080p) or higher.</li>
              <li><strong>Scanned documents:</strong> Scan at 300 DPI or higher. Lower resolutions (150 DPI) often cause character recognition errors.</li>
              <li><strong>Orientation:</strong> Ensure the image is properly oriented (not upside down or sideways). Use your device's photo editor to rotate if necessary.</li>
              <li><strong>Crop to content:</strong> Remove unnecessary borders, headers, or backgrounds. Focus the OCR on the text content you want to convert.</li>
              <li><strong>Lighting:</strong> If photographing a document, ensure even lighting with no shadows or glare. Natural light or soft artificial light works best.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 2: Upload the JPG Image</h3>
            <p className="mb-2">
              Navigate to the homepage or the <Link to="/jpg-to-word" className="text-primary hover:text-primary/80">JPG to Word</Link> tool. Upload your image using one of these methods:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Drag and drop:</strong> Drag the JPG file from your desktop or file manager directly into the dropzone.</li>
              <li><strong>File browser:</strong> Click the dropzone or "Choose File" button to open your system's file picker and select the image.</li>
              <li><strong>Paste from clipboard:</strong> If you've taken a screenshot or copied an image (Ctrl+C / Cmd+C), click the dropzone and press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Ctrl+V</kbd> (Windows/Linux) or <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Cmd+V</kbd> (Mac) to paste it instantly.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 3: Preview and Verify</h3>
            <p>
              After uploading, a preview of your image appears. Inspect it to confirm the text is legible, properly oriented, and in focus. If you notice issues (blur, heavy shadows, incorrect orientation), edit the image and re-upload before proceeding.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 4: Extract Text with OCR</h3>
            <p className="mb-2">
              Click the <strong>"Extract Text"</strong> button (or press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Enter</kbd>). The OCR engine processes the image and extracts all text. A progress indicator shows:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Analyzing image...</strong> Detecting text regions and optimizing for OCR</li>
              <li><strong>Extracting text...</strong> Performing character-by-character recognition</li>
              <li><strong>Finalizing...</strong> Reconstructing paragraphs and formatting</li>
            </ul>
            <p className="mt-2">
              Processing typically takes 2–5 seconds for most documents. Large images or those with extensive text may take up to 10 seconds.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 5: Review Extracted Text</h3>
            <p className="mb-2">
              The extracted text appears in an editable text box below the image. Review it carefully:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Check accuracy:</strong> Look for common OCR errors like "O" (letter O) vs. "0" (zero), "l" (lowercase L) vs. "I" (capital i) vs. "1" (one).</li>
              <li><strong>Verify paragraph structure:</strong> Ensure paragraphs are properly separated and reading order is correct (especially for multi-column documents).</li>
              <li><strong>Edit errors:</strong> The text box is editable—correct any mistakes directly before importing into Word.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 6: Transfer Text to Word</h3>
            <p className="mb-2">
              You have two options for importing the text into Microsoft Word:
            </p>
            <div className="space-y-3">
              <div>
                <strong className="block mb-1">Option A: Copy and Paste</strong>
                <ol className="list-decimal ml-6 space-y-1">
                  <li>Click <strong>"Copy"</strong> (or press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">C</kbd>) to copy the text to your clipboard.</li>
                  <li>Open Microsoft Word and create a new document (<strong>File → New</strong>).</li>
                  <li>Paste the text (Ctrl+V / Cmd+V) into the Word document.</li>
                  <li>Word preserves paragraph breaks and basic structure. You can now format, edit, and save as .docx.</li>
                </ol>
              </div>
              <div>
                <strong className="block mb-1">Option B: Download and Import</strong>
                <ol className="list-decimal ml-6 space-y-1">
                  <li>Click <strong>"Download"</strong> (or press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">D</kbd>) to save the text as a .txt file on your computer.</li>
                  <li>Open Microsoft Word.</li>
                  <li>Go to <strong>File → Open</strong> and select the downloaded .txt file.</li>
                  <li>Word converts the plain text to a .docx document automatically. Save it (<strong>File → Save As → Word Document (.docx)</strong>).</li>
                </ol>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 7: Format and Finalize in Word</h3>
            <p className="mb-2">
              After importing, apply formatting to match your desired document style:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Font and size:</strong> Select all text (Ctrl+A / Cmd+A) and choose your preferred font (e.g., Times New Roman 12pt, Arial 11pt).</li>
              <li><strong>Headings and styles:</strong> Apply Word styles (Heading 1, Heading 2, etc.) to section titles for automatic table of contents generation.</li>
              <li><strong>Paragraph formatting:</strong> Adjust alignment (left, center, right, justified), line spacing (1.0, 1.5, double), and indentation.</li>
              <li><strong>Bold, italic, underline:</strong> Reapply emphasis formatting where needed (the OCR does not preserve these).</li>
              <li><strong>Insert images or tables:</strong> If the original document contained images or tables, you'll need to manually reinsert them in Word.</li>
              <li><strong>Page layout:</strong> Set margins, page size (Letter, A4, etc.), and orientation (portrait or landscape) via <strong>Layout → Margins/Size/Orientation</strong>.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 8: Save and Share</h3>
            <p className="mb-2">
              Once formatting is complete, save your document:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Save as .docx:</strong> <strong>File → Save As</strong> → choose <strong>Word Document (.docx)</strong> for full Word compatibility and editing features.</li>
              <li><strong>Save as PDF (optional):</strong> For distribution or archival, export as PDF: <strong>File → Export → Create PDF/XPS Document</strong>.</li>
              <li><strong>Share:</strong> Email the .docx file, upload to cloud storage (OneDrive, Google Drive), or share via collaboration platforms (Microsoft Teams, Slack).</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-primary/10 border-l-4 border-primary rounded">
          <p className="font-medium mb-1">Pro Tip: Multi-Page Documents</p>
          <p className="text-sm">
            For multi-page scanned documents, extract each page separately (page-01, page-02, etc.). Then, in Word, open the first page's .docx file and use <strong>Insert → Object → Text from File</strong> to append subsequent pages in order, creating a single cohesive document.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Maximizing OCR Accuracy for Word Conversion</h2>
        <p className="mb-4">
          Document conversion quality depends heavily on OCR accuracy. Follow these best practices for reliable results:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Scanning and Photography Guidelines</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Scan at high DPI:</strong> 300 DPI minimum for printed documents; 600 DPI for documents with small fonts (below 10pt).</li>
              <li><strong>Use flatbed scanners:</strong> Flatbed scanners produce better results than sheet-fed scanners, which may introduce skew or shadow artifacts.</li>
              <li><strong>Smartphone scanning apps:</strong> If using a phone, use dedicated scanning apps (Adobe Scan, Microsoft Office Lens, Google Drive Scan) which automatically correct perspective, lighting, and shadows.</li>
              <li><strong>Hold camera steady:</strong> When photographing documents, use a tripod or brace your phone/camera on a stable surface to avoid motion blur.</li>
              <li><strong>Parallel alignment:</strong> Hold the camera directly above the document (not at an angle) to prevent perspective distortion.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Lighting and Image Quality</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Even illumination:</strong> Use diffused natural light or overhead soft lighting. Avoid direct sunlight or harsh shadows across the page.</li>
              <li><strong>No glare:</strong> For glossy paper or laminated documents, angle the camera or light source to eliminate reflections.</li>
              <li><strong>High contrast:</strong> Ensure dark text on light backgrounds. If the original is faded, use photo editing software to increase contrast before uploading.</li>
              <li><strong>Avoid color casts:</strong> Yellow or blue tints from poor lighting reduce OCR accuracy. Correct white balance in a photo editor if needed.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Text and Font Considerations</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Printed text preferred:</strong> OCR performs best on typed or printed documents. Handwritten documents have lower accuracy—see our <Link to="/handwriting-to-text" className="text-primary hover:text-primary/80">Handwriting to Text</Link> guide for tips.</li>
              <li><strong>Font size:</strong> Text smaller than 9pt often causes errors. If possible, enlarge the original document or scan at higher DPI.</li>
              <li><strong>Standard fonts:</strong> Common fonts (Arial, Times New Roman, Calibri, Helvetica) yield best results. Highly decorative or stylized fonts may confuse the OCR.</li>
              <li><strong>Text weight:</strong> Normal and bold text are reliable. Very thin (hairline) or extra-bold fonts may be misread.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Handling Complex Document Layouts</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Multi-column text:</strong> OCR may merge or scramble column order. For best results, crop each column separately and extract individually, then reassemble in Word.</li>
              <li><strong>Tables and lists:</strong> Simple tables are recognized, but complex tables with merged cells or nested structures may lose formatting. Consider using our <Link to="/jpg-to-excel" className="text-primary hover:text-primary/80">JPG to Excel</Link> tool for table extraction, then paste into Word.</li>
              <li><strong>Headers, footers, and page numbers:</strong> These may be extracted along with body text. Remove or reposition them manually in Word after import.</li>
              <li><strong>Images and graphics:</strong> The OCR extracts only text; images, charts, and graphics are ignored. You'll need to manually insert these into your Word document after text import.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Post-OCR Editing in Word</h3>
            <p className="mb-2">
              Even with high-quality images, some OCR errors are inevitable. Budget time for post-processing:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Spell check:</strong> Run Word's spell checker (<strong>Review → Spelling & Grammar</strong>) to catch obvious OCR mistakes.</li>
              <li><strong>Find & replace common errors:</strong> Use <strong>Find & Replace (Ctrl+H / Cmd+H)</strong> to correct systematic errors (e.g., replace all instances of "tbe" with "the").</li>
              <li><strong>Manual proofreading:</strong> Read through the document to verify accuracy, especially for numbers, dates, names, and technical terms where errors have serious consequences.</li>
              <li><strong>Compare with original:</strong> Keep the original JPG image open in another window to reference while proofreading.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">When to Re-Scan or Re-Photograph</h3>
            <p className="mb-2">
              If your OCR results show significant errors (more than 10% of words incorrect or unreadable), it's faster to re-capture the document with better conditions than to manually fix extensive mistakes:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Blur or low resolution:</strong> Re-scan at higher DPI or re-photograph with better focus.</li>
              <li><strong>Poor lighting or glare:</strong> Adjust lighting conditions and re-capture.</li>
              <li><strong>Skew or perspective distortion:</strong> Use a flatbed scanner or smartphone scanning app with auto-correction features.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Privacy & Security</h2>
        <p className="mb-4">
          Converting business documents, contracts, or personal records requires strong privacy protections. Here's how our tool safeguards your data:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Client-side OCR processing:</strong> All text extraction occurs entirely in your web browser using WebAssembly. Your JPG images and extracted text never leave your device—no uploads to servers, no cloud storage.</li>
          <li><strong>No data retention:</strong> We do not log, store, or transmit any images or text. Once you close the browser tab, all data is permanently deleted from memory.</li>
          <li><strong>Anonymous usage:</strong> No account, login, or personal information is required. You can use the tool completely anonymously.</li>
          <li><strong>Local history only:</strong> The History feature stores past extractions in your browser's local storage (IndexedDB), which resides on your device. This data is not synced to servers and can be cleared at any time via your browser's privacy settings.</li>
          <li><strong>HTTPS encryption:</strong> All web traffic is encrypted via HTTPS, protecting against interception during transit.</li>
          <li><strong>No third-party tracking:</strong> We do not share your data with advertisers, analytics platforms, or other third parties.</li>
        </ul>
        <p className="mt-4">
          This client-side architecture makes our tool safe for converting confidential contracts, sensitive business documents, medical records, legal filings, or personal correspondence. You maintain complete control over your data at all times.
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
            <Link to="/jpg-to-excel" className="text-primary hover:text-primary/80">JPG to Excel</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/copy-text-from-image" className="text-primary hover:text-primary/80">Copy Text from Image</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/extract-text-from-image" className="text-primary hover:text-primary/80">Extract Text from Image</Link>
          </div>
        </nav>
      </section>
      </GuideLayout>
    </>
  );
}
