import { LegalPage } from '../components/legal/LegalPage';
import { CONTACT_EMAIL } from '../src/config';

/**
 * Security page.
 * Every statement here must be something that can be checked in this repository:
 * - OCR assets and the same-origin rule: e2e/smoke.spec.ts
 * - Response headers: vercel.json
 * Do not add certifications, SLAs or guarantees that are not backed by evidence.
 */
const TOC = [
  { id: 'scope', label: 'Scope' },
  { id: 'images', label: 'How images are handled' },
  { id: 'verify', label: 'Verify it yourself' },
  { id: 'headers', label: 'Security headers' },
  { id: 'third-party', label: 'Third-party requests' },
  { id: 'report', label: 'Reporting a vulnerability' },
];

export default function Security() {
  return (
    <LegalPage
      title="Security"
      description="What security measures RenderCheck and the free image-to-text tool have in place today, how to verify them yourself, and how to report a problem."
      path="/security"
      docRef="RC-SECURITY"
      version="2.0"
      effective="10 October 2026"
      toc={TOC}
    >
      <h2 id="scope">Scope</h2>
      <p>
        RenderCheck and the free image-to-text tool are in beta. This page lists what is in place today.
        It does not claim any certification, such as SOC 2 or ISO 27001.
      </p>

      <h2 id="images">How images are handled</h2>
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

      <h2 id="verify">Verify it yourself</h2>
      <ol>
        <li>Open the image-to-text tool and open your browser&apos;s developer tools on the Network tab.</li>
        <li>Choose an image. The tool shows a live count of requests and bytes sent while it reads the image.</li>
        <li>In the Network tab, check that no request carries your image. Only the page&apos;s own files load.</li>
      </ol>
      <p>
        The count in the tool only covers the page itself. The Content Security Policy below is what stops
        the recognition worker from reaching any other address.
      </p>

      <h2 id="headers">Security headers</h2>
      <p>The site sets these response headers (see vercel.json in the repository):</p>
      <ul>
        <li>
          A Content Security Policy that limits scripts, workers, images and network connections to
          this site.
        </li>
        <li>Strict-Transport-Security, so browsers use HTTPS.</li>
        <li>X-Frame-Options: DENY, so other sites cannot embed these pages.</li>
        <li>X-Content-Type-Options: nosniff.</li>
        <li>A Permissions-Policy that turns off camera, microphone and location access.</li>
      </ul>

      <h2 id="third-party">Third-party requests</h2>
      <p>
        There are none. Fonts, scripts and the OCR engine are served from this site, and the
        Content-Security-Policy blocks requests to any other origin.
      </p>

      <h2 id="report">Reporting a vulnerability</h2>
      <p>
        Please email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the steps to
        reproduce the problem. Please do not open a public issue for a security problem.
      </p>
    </LegalPage>
  );
}
