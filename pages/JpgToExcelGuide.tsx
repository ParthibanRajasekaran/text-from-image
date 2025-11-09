import React from "react";
import { SEO } from "../components/SEO";
import { FAQSchema } from "../components/FAQSchema";
import { Link } from "react-router-dom";

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
  return (
  <section className="bg-background text-foreground px-4 py-8 max-w-3xl mx-auto" aria-label="Guide content">
      <SEO
        title="JPG to Excel – Free Online OCR Guide"
        description="Convert JPG images to editable Excel spreadsheets using our secure, client-side OCR tool. Step-by-step instructions, tips, and FAQs."
        canonical="/jpg-to-excel"
      />
      <FAQSchema faqs={faqs} />
  <h2 className="text-3xl font-bold mb-4">JPG to Excel</h2>
      <section className="mb-6">
        <p>
          Converting JPG images to Excel spreadsheets lets you edit, analyze, and repurpose tabular data from photos, scans, or screenshots. Our tool makes it easy, private, and fast—no registration required.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">How it works</h2>
        <p>
          The app uses browser-based OCR to detect and extract tables or text from JPG images. You can then copy the data or export it as an Excel (.xlsx) file. All operations are performed locally for maximum privacy.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Step-by-step: JPG to Excel</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Go to the <Link to="/jpg-to-excel" className="text-link">JPG to Excel</Link> page.</li>
          <li>Drop, paste, or upload your JPG image.</li>
          <li>Preview the image and confirm selection.</li>
          <li>Click “Extract” to process the image.</li>
          <li>Review the extracted table or text. Click “Export” to download as an Excel file, or copy to clipboard.</li>
        </ol>
        <p className="mt-2">
          For document conversion, see our <Link to="/jpg-to-word" className="text-link">JPG to Word</Link> guide. For simple text, see <Link to="/extract-text-from-image" className="text-link">Extract Text from Image</Link>.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Tips for best accuracy</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Use clear, high-resolution images.</li>
          <li>Good lighting and minimal glare help.</li>
          <li>Printed tables are most reliable; handwriting varies.</li>
          <li>Crop unnecessary borders for better results.</li>
          <li>Check for blurry or distorted text before uploading.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Privacy note</h2>
        <p>
          All OCR is performed in your browser. No images or text are uploaded, stored, or shared. No account needed.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Online vs Native OCR</h2>
        <table className="w-full border border-border text-sm mb-4">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-2 py-1">Feature</th>
              <th className="border border-border px-2 py-1">Online OCR (Our App)</th>
              <th className="border border-border px-2 py-1">Native OCR (Desktop)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border px-2 py-1">Privacy</td>
              <td className="border border-border px-2 py-1">Client-side, no upload</td>
              <td className="border border-border px-2 py-1">Depends on app</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">Setup</td>
              <td className="border border-border px-2 py-1">No install, instant</td>
              <td className="border border-border px-2 py-1">Requires installation</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">Accuracy</td>
              <td className="border border-border px-2 py-1">High (good images)</td>
              <td className="border border-border px-2 py-1">High (pro tools)</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">Handwriting</td>
              <td className="border border-border px-2 py-1">Supported, variable</td>
              <td className="border border-border px-2 py-1">Supported, variable</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">Export options</td>
              <td className="border border-border px-2 py-1">Excel (.xlsx), copy</td>
              <td className="border border-border px-2 py-1">Excel, CSV, etc.</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">FAQs</h2>
        <ul className="list-disc ml-6 space-y-2">
          {faqs.map((faq, idx) => (
            <li key={idx}>
              <strong>{faq.question}</strong>
              <div>{faq.answer}</div>
            </li>
          ))}
        </ul>
      </section>
      <nav className="mt-8 text-link">
        <Link to="/extract-text-from-image">Extract Text from Image Guide</Link> | <Link to="/copy-text-from-image">Copy Text from Image Guide</Link> | <Link to="/jpg-to-word">JPG to Word Guide</Link>
      </nav>
  </section>
  );
}
