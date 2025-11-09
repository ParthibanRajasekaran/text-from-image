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
  const consent = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
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
        subtitle="Instantly extract and copy text from images using secure, browser-based OCR"
      >
      <section className="mb-6">
        <p>
          Copying text from images lets you instantly reuse information from photos, scans, or screenshots. Our tool makes it simple, private, and fast—no registration required.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">How it works</h2>
        <p>
          The app uses browser-based OCR to detect and extract text from images. Once processed, you can copy the text to your clipboard with a single click. All operations are performed locally for maximum privacy.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Step-by-step: Copying text</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Go to the <Link to="/copy-text-from-image" className="text-primary hover:text-primary/80">Copy Text from Image</Link> page.</li>
          <li>Drop, paste, or upload your image file.</li>
          <li>Preview the image and confirm selection.</li>
          <li>Click "Extract" to process the image.</li>
          <li>Click "Copy" to send the extracted text to your clipboard.</li>
        </ol>
        <p className="mt-2">
          For exporting text, see our <Link to="/jpg-to-word" className="text-primary hover:text-primary/80">JPG to Word</Link> and <Link to="/jpg-to-excel" className="text-primary hover:text-primary/80">JPG to Excel</Link> guides.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Tips for best accuracy</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Use clear, high-resolution images.</li>
          <li>Good lighting and minimal glare help.</li>
          <li>Printed text is most reliable; handwriting varies.</li>
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
      <nav className="mt-8 pt-6 border-t border-border/40">
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/extract-text-from-image" className="text-primary hover:text-primary/80">Extract Text from Image Guide</Link>
          <span className="text-muted-foreground">|</span>
          <Link to="/jpg-to-word" className="text-primary hover:text-primary/80">JPG to Word Guide</Link>
          <span className="text-muted-foreground">|</span>
          <Link to="/jpg-to-excel" className="text-primary hover:text-primary/80">JPG to Excel Guide</Link>
        </div>
      </nav>
      </GuideLayout>
    </>
  );
}
