import React from "react";
import { SEO } from "../components/SEO";
import { FAQSchema } from "../components/FAQSchema";
import { Link } from "react-router-dom";

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
  return (
  <section className="bg-background text-foreground px-4 py-8 max-w-3xl mx-auto" aria-label="Guide content">
      <SEO
        title="Copy Text from Image – Free OCR Guide"
        description="Quickly copy text from images using our secure, client-side OCR tool. Step-by-step instructions, tips, and FAQs."
        canonical="/copy-text-from-image"
      />
      <FAQSchema faqs={faqs} />
  <h2 className="text-3xl font-bold mb-4">Copy Text from Image</h2>
      <section className="mb-6">
        <p>
          Copying text from images lets you instantly reuse information from photos, scans, or screenshots. Our tool makes it simple, private, and fast—no registration required.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">How it works</h2>
        <p>
          The app uses browser-based OCR to detect and extract text from images. Once processed, you can copy the text to your clipboard with a single click. All operations are performed locally for maximum privacy.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Step-by-step: Copying text</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Go to the <Link to="/copy-text-from-image" className="text-link">Copy Text from Image</Link> page.</li>
          <li>Drop, paste, or upload your image file.</li>
          <li>Preview the image and confirm selection.</li>
          <li>Click “Extract” to process the image.</li>
          <li>Click “Copy” to send the extracted text to your clipboard.</li>
        </ol>
        <p className="mt-2">
          For exporting text, see our <Link to="/jpg-to-word" className="text-link">JPG to Word</Link> and <Link to="/jpg-to-excel" className="text-link">JPG to Excel</Link> guides.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Tips for best accuracy</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Use clear, high-resolution images.</li>
          <li>Good lighting and minimal glare help.</li>
          <li>Printed text is most reliable; handwriting varies.</li>
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
              <td className="border border-border px-2 py-1">Copy to clipboard</td>
              <td className="border border-border px-2 py-1">Copy, save file</td>
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
        <Link to="/extract-text-from-image">Extract Text from Image Guide</Link> | <Link to="/jpg-to-word">JPG to Word Guide</Link> | <Link to="/jpg-to-excel">JPG to Excel Guide</Link>
      </nav>
  </section>
  );
}
