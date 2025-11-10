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
    question: "What is JPG to Excel conversion?",
    answer: "It’s the process of turning tables or text in JPG images into editable Excel spreadsheets using OCR.",
  },
  {
    question: "Do I need Microsoft Excel to use this?",
    answer: "No, you can export as .xlsx or copy the data to use in any spreadsheet editor.",
  },
  {
    question: "Is my image data private?",
    answer: "Yes. All processing is done in your browser; nothing is uploaded or stored.",
  },
  {
    question: "Can I convert handwritten tables?",
    answer: "Handwritten tables are supported, but results depend on clarity and structure.",
  },
  {
    question: "Are formatting and images preserved?",
    answer: "Text and table structure are extracted; formatting and embedded images are not preserved.",
  },
  {
    question: "What file types are supported?",
    answer: "JPG, PNG, and other common image formats are supported.",
  },
  {
    question: "Can I use this on mobile?",
    answer: "Yes, our app works on most mobile browsers."
  }
];

// FAQSchema returns a <script> tag with FAQPage JSON-LD

export default function JpgToExcelGuide() {
  const isPreview = import.meta.env.MODE === "preview";
  const allowPreview = import.meta.env.VITE_ENABLE_ADS_IN_PREVIEW === "true";
  const slotsEnabled = (isPreview && allowPreview) || import.meta.env.VITE_ADS_SLOTS_ENABLED === "true";
  const consent = { ad_storage: 'denied' as const, ad_user_data: 'denied' as const, ad_personalization: 'denied' as const };
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalPath = '/jpg-to-excel';
  const canonicalAbsolute = new URL(canonicalPath, SITE_URL).toString();

  useSEO({
    title: 'JPG to Excel – Free OCR Guide',
    description: 'Convert JPG images containing tables into editable Excel spreadsheets. Tips, best practices, and examples.',
    canonical: canonicalPath,
  });

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: 'JPG to Excel', item: canonicalAbsolute },
    ],
  };

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'JPG to Excel – Free OCR Guide',
    description: 'Convert JPG images containing tables into editable Excel spreadsheets. Tips, best practices, and examples.',
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
        title="JPG to Excel – Free Online OCR Guide"
        description="Convert JPG images to editable Excel spreadsheets using our secure, client-side OCR tool. Step-by-step instructions, tips, and FAQs."
        canonical={canonicalAbsolute}
        jsonLd={pageJsonLd}
      />
      <FAQSchema faqs={faqs} />
      <GuideLayout
        title="JPG to Excel"
        description="Convert JPG images to editable Excel spreadsheets using secure, browser-based OCR"
      >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Overview</h2>
        <p className="mb-4">
          Converting JPG images to Excel spreadsheets transforms static tabular data into editable, analyzable formats. Whether you've photographed a printed report, received a screenshot of financial data, or scanned an invoice, our browser-based OCR tool extracts table structures and cell contents so you can manipulate the data in Excel, Google Sheets, or any spreadsheet application.
        </p>
        <p className="mb-4">
          Unlike generic image-to-text converters that dump all content into a single text block, our table-aware OCR engine preserves row and column relationships, making it ideal for structured data like price lists, inventory tables, financial statements, research data, and meeting schedules.
        </p>
        <p>
          Everything runs in your browser—no uploads, no accounts, no waiting. Simply drag in your image, extract the data, and export an .xlsx file or copy cells directly into your existing spreadsheet.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Who Should Use This Tool</h3>
        <ul className="space-y-3 ml-2">
          <li>
            <strong className="block mb-1">Data Analysts & Researchers:</strong>
            <span className="text-foreground/90">Digitize printed survey results, published research tables, or legacy reports that only exist on paper. Eliminate manual data entry errors and start analysis faster.</span>
          </li>
          <li>
            <strong className="block mb-1">Finance & Accounting Professionals:</strong>
            <span className="text-foreground/90">Convert bank statement screenshots, expense reports from receipts, or partner-provided price lists into Excel for reconciliation, budgeting, or forecasting.</span>
          </li>
          <li>
            <strong className="block mb-1">Small Business Owners:</strong>
            <span className="text-foreground/90">Digitize supplier invoices with line-item tables, inventory lists from product catalogs, or event schedules from printed materials—then import into your accounting or inventory system.</span>
          </li>
          <li>
            <strong className="block mb-1">Educators & Students:</strong>
            <span className="text-foreground/90">Convert grade tables from screenshots, extract experimental data from textbooks, or digitize class schedules for easy manipulation and sharing.</span>
          </li>
          <li>
            <strong className="block mb-1">Project Managers:</strong>
            <span className="text-foreground/90">Capture task lists or Gantt chart details from whiteboards or printed project plans, then import into Excel for tracking and reporting.</span>
          </li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">How Our Table OCR Technology Works</h2>
        <p className="mb-4">
          Extracting structured tables from images requires more than simple character recognition—it must understand row and column boundaries, cell relationships, and data types. Our system employs a two-stage approach optimized for table extraction:
        </p>

        <h3 className="text-xl font-medium mb-2">1. Table Structure Detection</h3>
        <p className="mb-3">
          Before performing OCR, our engine analyzes the image layout to identify table boundaries, grid lines (when present), and cell regions. This pre-processing step uses computer vision techniques to detect:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Grid lines and borders:</strong> Visible table lines provide strong structure signals</li>
          <li><strong>Whitespace patterns:</strong> For borderless tables, consistent spacing between columns and rows indicates structure</li>
          <li><strong>Text alignment:</strong> Left-aligned labels vs. right-aligned numbers help distinguish column types</li>
          <li><strong>Font and size changes:</strong> Header rows often use bold or larger fonts</li>
        </ul>
        <p className="mb-4">
          This structural analysis creates a cell grid map that guides the OCR engine, ensuring text is assigned to the correct row and column position.
        </p>

        <h3 className="text-xl font-medium mb-2">2. Cell-by-Cell OCR Processing</h3>
        <p className="mb-3">
          Once the table structure is mapped, each cell is processed individually:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li><strong>Tesseract OCR Engine:</strong> Our primary engine handles printed text in cells. It's optimized for alphanumeric content, including numbers, currency symbols, percentages, and dates commonly found in spreadsheets.</li>
          <li><strong>Data Type Inference:</strong> The system identifies numeric cells, date formats, and text labels, preserving these distinctions in the Excel export (e.g., numbers align right, text aligns left).</li>
          <li><strong>AI-Powered Fallback:</strong> For challenging cells (low contrast, unusual fonts, or partial handwriting), a vision-language model provides a second opinion, improving overall accuracy.</li>
        </ul>

        <h3 className="text-xl font-medium mb-2">3. Excel Export Generation</h3>
        <p className="mb-3">
          Extracted data is formatted into an .xlsx file with preserved structure:
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Each row and column from the image maps to an Excel row and column</li>
          <li>Header rows are retained at the top of the sheet</li>
          <li>Numeric cells are formatted as numbers (not text), enabling formulas and calculations</li>
          <li>Empty cells remain empty in the Excel file</li>
        </ul>
        <p className="mt-4">
          This entire pipeline runs in your browser using WebAssembly and JavaScript, ensuring your data never leaves your device.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Step-by-Step: Converting JPG to Excel</h2>
        <p className="mb-4">
          Follow these detailed steps to extract table data from your JPG image and export it to an editable Excel spreadsheet:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Step 1: Upload Your Table Image</h3>
            <p className="mb-2">
              Navigate to the <Link to="/jpg-to-excel" className="text-primary hover:text-primary/80">JPG to Excel</Link> page. You have three convenient ways to load your image:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Drag and drop:</strong> Drag a JPG, PNG, or other image file from your desktop or file manager directly into the dropzone on the page.</li>
              <li><strong>Paste from clipboard:</strong> If you've taken a screenshot or copied an image (Ctrl+C / Cmd+C), click the dropzone and press Ctrl+V (Cmd+V on Mac) to paste it instantly.</li>
              <li><strong>Browse files:</strong> Click "Choose File" or the dropzone area to open your system's file picker, then select your image.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 2: Preview and Confirm</h3>
            <p>
              Once uploaded, a preview of your image appears. Review it to ensure the table is visible, properly oriented, and in focus. If the image is upside down or sideways, use your device's photo editor to rotate it before uploading. You can also crop out any non-table content (like headers, footers, or surrounding text) to improve accuracy and speed.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 3: Extract Table Data</h3>
            <p className="mb-2">
              Click the <strong>"Extract"</strong> button (or press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Enter</kbd>). The OCR engine analyzes the image, detects the table structure, and performs cell-by-cell text recognition. A progress indicator shows:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Analyzing layout...</strong> The system identifies rows, columns, and cell boundaries</li>
              <li><strong>Recognizing text...</strong> OCR processes each cell's content</li>
              <li><strong>Formatting results...</strong> Data is structured into a spreadsheet format</li>
            </ul>
            <p className="mt-2">
              Processing typically takes 2–5 seconds for most images. Complex tables with many cells or low-quality scans may take up to 10 seconds.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 4: Review Extracted Data</h3>
            <p>
              The extracted table appears in a preview grid below the image. Scroll through the cells to verify accuracy. Common issues to check:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Merged cells:</strong> Cells spanning multiple columns or rows may appear in the first column only</li>
              <li><strong>Numeric formatting:</strong> Currency symbols, commas, and decimal points should be preserved</li>
              <li><strong>Empty cells:</strong> Confirm that blank cells in the original table remain blank in the extraction</li>
            </ul>
            <p className="mt-2">
              If you notice significant errors (e.g., entire columns misaligned), the image quality may be too low—see the accuracy tips below for guidance.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 5: Export to Excel or Copy Data</h3>
            <p className="mb-2">
              Choose your preferred method to use the extracted data:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Download Excel file:</strong> Click <strong>"Export to Excel"</strong> to generate and download a .xlsx file. The file preserves row/column structure, numeric formatting, and empty cells. Open it in Microsoft Excel, Google Sheets, LibreOffice Calc, or any spreadsheet application.</li>
              <li><strong>Copy to clipboard:</strong> Click <strong>"Copy"</strong> (or press <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Ctrl+C</kbd> / <kbd className="px-2 py-1 bg-muted/60 rounded text-sm">Cmd+C</kbd>) to copy tab-delimited text. Then paste (Ctrl+V / Cmd+V) into an open Excel sheet, and Excel will automatically place each cell in the correct position.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Step 6: Edit and Analyze in Excel</h3>
            <p>
              Open the .xlsx file or paste the data into your existing spreadsheet. You can now:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Correct any OCR errors by editing cells directly</li>
              <li>Apply Excel formulas (SUM, AVERAGE, VLOOKUP, etc.) to the data</li>
              <li>Format cells, add charts, or create pivot tables for analysis</li>
              <li>Merge with other data sources or import into business intelligence tools</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-primary/10 border-l-4 border-primary rounded">
          <p className="font-medium mb-1">Pro Tip: Batch Processing</p>
          <p className="text-sm">
            Need to convert multiple images? Process them one at a time in separate browser tabs. Each tab runs independently, so you can work on one file while another is processing. For large-scale batch jobs (100+ images), consider desktop OCR software with folder-watching features.
          </p>
        </div>

        <p className="mt-4">
          For converting entire documents (not just tables), see our <Link to="/jpg-to-word" className="text-primary hover:text-primary/80">JPG to Word Guide</Link>. For extracting simple text without table structure, see <Link to="/extract-text-from-image" className="text-primary hover:text-primary/80">Extract Text from Image</Link>.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Maximizing Table OCR Accuracy</h2>
        <p className="mb-4">
          Table extraction is more sensitive to image quality and layout than simple text OCR. Follow these best practices to ensure reliable results:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Image Resolution for Tables</h3>
            <p className="mb-2">
              Tables contain dense information in small cells, so resolution is critical:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Scanned documents:</strong> Use 300 DPI or higher. Lower resolutions (150 DPI) often cause adjacent cells to blur together.</li>
              <li><strong>Screenshots:</strong> Capture at full resolution (don't downscale). If the table spans multiple screens, take multiple screenshots and process each section separately rather than zooming out and capturing a tiny image.</li>
              <li><strong>Photos of printed tables:</strong> Use at least 8-megapixel camera resolution. Hold the camera parallel to the page (not at an angle) and fill the frame with the table.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Table Borders and Grid Lines</h3>
            <p className="mb-2">
              Visible borders dramatically improve detection accuracy:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Best case:</strong> Tables with clear grid lines (all cells bordered) are easiest to process. The engine uses these lines to precisely define cell boundaries.</li>
              <li><strong>Borderless tables:</strong> If your table has no borders (common in spreadsheets or minimalist designs), ensure consistent column spacing and alignment. The OCR relies on whitespace patterns, which are less reliable if columns are too close together.</li>
              <li><strong>Partial borders:</strong> Tables with only header borders or outer borders can be tricky. If possible, add grid lines in your original spreadsheet (even light gray lines) before taking a screenshot or printing.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Alignment and Orientation</h3>
            <p className="mb-2">
              Proper alignment is essential for maintaining row/column relationships:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Straighten skewed tables:</strong> If you've photographed a printed table, ensure it's not tilted or rotated. Use your phone's scan mode or a photo editing app to deskew the image.</li>
              <li><strong>Avoid perspective distortion:</strong> When photographing tables, hold the camera directly above and parallel to the page. Angled shots create trapezoidal distortion that confuses the table detection algorithm.</li>
              <li><strong>Crop to table bounds:</strong> Remove surrounding text, images, or margins. The OCR performs better when the image contains only the table itself.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Lighting and Contrast for Tables</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Even illumination:</strong> Ensure all parts of the table are equally lit. Shadows can obscure cell boundaries and make text unreadable.</li>
              <li><strong>Avoid glare on grid lines:</strong> Glossy paper or laminated tables can create reflections that hide cell borders. Adjust your angle or lighting to eliminate glare.</li>
              <li><strong>High contrast:</strong> Dark text on a light background (or vice versa) works best. Faded printouts or low-contrast tables (light gray text on white) should be adjusted using photo editing software before upload.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Cell Content Considerations</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Font size:</strong> Text smaller than 9pt may cause errors. If your table has tiny text, scale up the image or increase the font size in the source spreadsheet before capturing.</li>
              <li><strong>Numeric formatting:</strong> The OCR handles numbers, currency symbols ($, €, £), percentages (%), and decimal points. However, thousands separators (commas) may be misread as periods if the image is blurry—verify these after extraction.</li>
              <li><strong>Merged cells:</strong> Cells spanning multiple columns or rows are detected, but the content typically appears in the top-left cell of the merge. You may need to manually adjust merged cell formatting in Excel after export.</li>
              <li><strong>Empty cells:</strong> Blank cells remain blank in the output. If your table uses dashes (—) or "N/A" to indicate missing data, these will be extracted as text.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Handling Complex Tables</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Multi-line cells:</strong> Cells containing line breaks or paragraphs are supported, but the line breaks may not be preserved in the Excel export. Consider simplifying multi-line content before conversion if possible.</li>
              <li><strong>Nested tables:</strong> If your image contains multiple separate tables, the OCR may attempt to merge them. Process each table individually by cropping separate images.</li>
              <li><strong>Color-coded cells:</strong> Background colors and cell shading are not preserved in the Excel export. Only text content and structure are extracted.</li>
            </ul>
          </div>
        </div>

        <p className="mt-4 p-4 bg-muted/40 rounded-lg">
          <strong>When to re-scan:</strong> If your extracted table shows entire rows or columns misaligned, or if many numbers contain errors, it's faster to re-scan or re-photograph with better alignment and lighting than to manually fix the data in Excel.
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
              <td className="px-4 py-3">Excel (.xlsx), copy</td>
              <td className="px-4 py-3">Excel, CSV, etc.</td>
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
            <Link to="/copy-text-from-image" className="text-primary hover:text-primary/80">Copy Text from Image Guide</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/jpg-to-word" className="text-primary hover:text-primary/80">JPG to Word Guide</Link>
          </div>
        </nav>
      </section>
      </GuideLayout>
    </>
  );
}
