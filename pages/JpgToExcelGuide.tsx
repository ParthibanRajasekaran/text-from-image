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
  const consent = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
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
        subtitle="Convert JPG images to editable Excel spreadsheets using secure, browser-based OCR"
      >
      <section className="mb-6">
        <p>
          Converting JPG images to Excel spreadsheets lets you edit, analyze, and repurpose tabular data from photos, scans, or screenshots. Our tool makes it easy, private, and fast—no registration required.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">How it works</h2>
        <p>
          The app uses browser-based OCR to detect and extract tables or text from JPG images. You can then copy the data or export it as an Excel (.xlsx) file. All operations are performed locally for maximum privacy.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Step-by-step: JPG to Excel</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Go to the <Link to="/jpg-to-excel" className="text-primary hover:text-primary/80">JPG to Excel</Link> page.</li>
          <li>Drop, paste, or upload your JPG image.</li>
          <li>Preview the image and confirm selection.</li>
          <li>Click “Extract” to process the image.</li>
          <li>Review the extracted table or text. Click “Export” to download as an Excel file, or copy to clipboard.</li>
        </ol>
        <p className="mt-2">
          For document conversion, see our <Link to="/jpg-to-word" className="text-primary hover:text-primary/80">JPG to Word</Link> guide. For simple text, see <Link to="/extract-text-from-image" className="text-primary hover:text-primary/80">Extract Text from Image</Link>.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Tips for best accuracy</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Use clear, high-resolution images.</li>
          <li>Good lighting and minimal glare help.</li>
          <li>Printed tables are most reliable; handwriting varies.</li>
          <li>Crop unnecessary borders for better results.</li>
          <li>Check for blurry or distorted text before uploading.</li>
        </ul>
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
      <nav className="mt-8 pt-6 border-t border-border/40">
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/extract-text-from-image" className="text-primary hover:text-primary/80">Extract Text from Image Guide</Link>
          <span className="text-muted-foreground">|</span>
          <Link to="/copy-text-from-image" className="text-primary hover:text-primary/80">Copy Text from Image Guide</Link>
          <span className="text-muted-foreground">|</span>
          <Link to="/jpg-to-word" className="text-primary hover:text-primary/80">JPG to Word Guide</Link>
        </div>
      </nav>
      </GuideLayout>
    </>
  );
}
