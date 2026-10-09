import { LegalPage } from '../components/legal/LegalPage';
import { CONTACT_EMAIL } from '../src/config';

/**
 * Security page.
 * Every statement here must be something that can be checked in this repository:
 * - OCR assets and the same-origin rule: e2e/smoke.spec.ts
 * - Response headers: vercel.json
 * Do not add certifications, SLAs or guarantees that are not backed by evidence.
 */
export default function Security() {
  return (
    <LegalPage
      title="Security"
      description="What security measures Free Text From Image and RenderCheck have in place today, and how to report a problem."
      path="/security"
    >
      <p>
        Free Text From Image and RenderCheck are in beta. This page lists what is in place today.
        It does not claim any certification, such as SOC 2 or ISO 27001.
      </p>

      <h2>How images are handled</h2>
      <p>
        Text recognition runs in your browser, using Tesseract.js and WebAssembly. The recognition
        engine and the English language data are served from this site&apos;s own address, under
        /ocr/, and not from a third party.
      </p>
      <p>
        An automated test in the project repository runs recognition on a sample image. It fails if
        the browser makes any request to another address, or any request other than a plain page or
        file download, while recognition runs.
      </p>

      <h2>Security headers</h2>
      <p>The site sets these response headers (see vercel.json in the repository):</p>
      <ul>
        <li>
          A Content Security Policy that limits scripts, workers, images and network connections to
          this site, with the exceptions needed for web fonts.
        </li>
        <li>Strict-Transport-Security, so browsers use HTTPS.</li>
        <li>X-Frame-Options: DENY, so other sites cannot embed these pages.</li>
        <li>X-Content-Type-Options: nosniff.</li>
        <li>A Permissions-Policy that turns off camera, microphone and location access.</li>
      </ul>

      <h2>Third-party requests</h2>
      <p>
        Web fonts load from Google Fonts (fonts.googleapis.com and fonts.gstatic.com), so your
        browser contacts Google when a page loads. This is separate from image recognition.
      </p>

      <h2>Reporting a vulnerability</h2>
      <p>
        Please email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the steps to
        reproduce the problem. Please do not open a public issue for a security problem.
      </p>
    </LegalPage>
  );
}
