import React from "react";
import { SEO } from "../components/SEO";
import { FAQSchema } from "../components/FAQSchema";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What is image text extraction?",
    answer: "Image text extraction is the process of converting text within images into editable digital text using OCR (Optical Character Recognition) technology.",
  },
  {
    question: "Do I need to sign up to use this tool?",
    answer: "No signup is required. All processing happens client-side for privacy.",
  },
  {
    question: "What image formats are supported?",
    answer: "Most common formats like JPG, PNG, and BMP are supported.",
  },
  {
    question: "How accurate is the extraction?",
    answer: "Accuracy depends on image quality, lighting, and font clarity. See our tips below for best results.",
  },
  {
    question: "Can I extract handwritten text?",
    answer: "Handwritten text can be extracted, but results may vary based on legibility and style.",
  },
  {
    question: "Is my data stored or shared?",
    answer: "No. All OCR is performed in your browser; your images and text are never uploaded or stored.",
  },
  {
    question: "Can I use this on mobile devices?",
    answer: "Yes, our app works on most modern mobile browsers." 
  }
];

// FAQSchema returns a <script> tag with FAQPage JSON-LD

export default function ExtractTextFromImageGuide() {
  return (
  <section className="bg-background text-foreground px-4 py-8 max-w-3xl mx-auto" aria-label="Guide content">
      <SEO
        title="Extract Text from Image – Free Online OCR Guide"
        description="Learn how to extract text from images using our free, private, client-side OCR tool. Step-by-step instructions, tips, and FAQs."
        canonical="/extract-text-from-image"
      />
      <FAQSchema faqs={faqs} />
  <h2 className="text-3xl font-bold mb-4">Extract Text from Image</h2>
      <section className="mb-6">
        <p>
          Extracting text from images is a powerful way to digitize printed or handwritten content. Whether you’re converting scanned documents, photos of notes, or screenshots, our online tool makes it fast, private, and easy—no signup required.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">How it works</h2>
        <p>
          Our app uses advanced client-side OCR (Optical Character Recognition) technology. When you drop, paste, or upload an image, the text is detected and extracted directly in your browser. No data leaves your device, ensuring privacy and speed.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Step-by-step: Extracting text</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Open the <Link to="/extract-text-from-image" className="text-link">Extract Text from Image</Link> page.</li>
          <li>Drop, paste, or upload your image file.</li>
          <li>Preview the image and adjust if needed.</li>
          <li>Click “Extract” to process the image.</li>
          <li>Review the extracted text. Use the “Copy” button to copy it, or export as needed.</li>
        </ol>
        <p className="mt-2">
          For related tasks, see our <Link to="/copy-text-from-image" className="text-link">Copy Text from Image</Link> and <Link to="/jpg-to-word" className="text-link">JPG to Word</Link> guides.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Tips for best accuracy</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Use high-resolution images for clearer text detection.</li>
          <li>Ensure good lighting and minimal shadows.</li>
          <li>Prefer printed text over cursive or stylized fonts.</li>
          <li>Handwriting is supported, but legibility matters.</li>
          <li>Avoid blurry or compressed images.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Privacy note</h2>
        <p>
          All OCR processing is performed client-side in your browser. Your images and extracted text are never uploaded, stored, or shared. No account or signup is required.
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
              <td className="border border-border px-2 py-1">Copy, export text</td>
              <td className="border border-border px-2 py-1">Copy, save file</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">FAQs</h2>
        {/* Render FAQ list visually if needed, but JSON-LD is handled above */}
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
        <Link to="/copy-text-from-image">Copy Text from Image Guide</Link> | <Link to="/jpg-to-word">JPG to Word Guide</Link> | <Link to="/jpg-to-excel">JPG to Excel Guide</Link>
      </nav>
  </section>
  );
}
