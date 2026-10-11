import { LegalPage } from '../components/legal/LegalPage';
import { CONTACT_EMAIL } from '../src/config';
import { ArchitectureDiagram } from '../components/security/ArchitectureDiagram';

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
  { id: 'architecture', label: 'Architecture' },
  { id: 'verify', label: 'Verify it yourself' },
  { id: 'headers', label: 'Security headers' },
  { id: 'sdk', label: 'SDK, command line and agents' },
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
      effective="11 October 2026"
      toc={TOC}
    >
      <h2 id="scope">Scope</h2>
      <p>
        RenderCheck and the free image-to-text tool are in developer beta, built and maintained by one
        independent author. This page lists what is in place today and how to check it. There is no
        security certification, such as SOC 2 or ISO 27001, and no third-party penetration test.
      </p>
      <p>
        Known limits: <code>npm audit</code> reports advisories in build and development tooling
        (checked 11 October 2026; none in the production dependencies of the site). They do not ship in
        the pages you load. There is no bug bounty and no response-time guarantee.
      </p>

      <h2 id="images">How images are handled</h2>
      <p>
        Text recognition runs in your browser, using Tesseract.js and WebAssembly. The recognition
        engine and the English language data are served from this site&apos;s own address, under
        /ocr/, and not from a third party.
      </p>
      <p>
        An automated test in the project repository runs recognition on a sample image. It fails if
        the browser makes any request to another address, or any request that is not a plain GET,
        while recognition runs.
      </p>

      <h2 id="architecture">Architecture</h2>
      <p>
        Two surfaces share one rule: an image is read on the machine that holds it. The full
        write-up, with a table linking each claim to its test, is in{' '}
        <a href="https://github.com/ParthibanRajasekaran/text-from-image/blob/main/docs/ARCHITECTURE.md">
          docs/ARCHITECTURE.md
        </a>.
      </p>
      <ArchitectureDiagram />

      <h2 id="verify">Verify it yourself</h2>
      <ol>
        <li>Open the image-to-text tool and open your browser&apos;s developer tools on the Network tab.</li>
        <li>Choose an image. The tool shows a live count of requests and bytes sent while it reads the image.</li>
        <li>In the Network tab, check that no request carries your image. Only the page&apos;s own files load.</li>
      </ol>
      <p>
        The count in the tool covers requests from the page and the worker it starts. The Content
        Security Policy below is the control that blocks connections to other addresses.
      </p>

      <h2 id="headers">Security headers</h2>
      <p>The site sets these response headers (see vercel.json in the repository):</p>
      <ul>
        <li>
          A Content Security Policy. Scripts, fonts and network connections (fetch, XHR, WebSocket) are
          limited to this site, and scripts may also compile WebAssembly. Workers are limited to this
          site and blob: URLs, and images to this site, data: and blob: URLs. Inline styles are
          allowed. Plugins (object) are blocked, and other sites cannot frame these pages.
        </li>
        <li>Strict-Transport-Security, so browsers use HTTPS.</li>
        <li>X-Frame-Options: DENY, so other sites cannot embed these pages.</li>
        <li>X-Content-Type-Options: nosniff.</li>
        <li>A Permissions-Policy that turns off camera, microphone, location and payment access.</li>
        <li>Referrer-Policy: strict-origin-when-cross-origin, and Cross-Origin-Opener-Policy: same-origin-allow-popups.</li>
      </ul>

      <h2 id="sdk">SDK, command line and agents</h2>
      <p>
        The SDK (<code>@rendercheck/sdk</code>) runs OCR inside your test process. The English language
        data and the engine come from packages installed with it, and Tesseract&apos;s cache is switched off.
        The SDK, command line and MCP server make no network requests. The test is{' '}
        <code>packages/rendercheck/__tests__/offline.spec.ts</code>. By default it blocks network calls on
        the main thread; <code>npm run test:offline</code> runs it with no network at all on Linux, which
        also covers the OCR worker thread. Installing the package from npm needs the network, as usual,
        and your own tests still load your own application.
      </p>
      <p>
        The command line and the MCP server (which talks to your agent over standard input and output, not
        a port) write a usage log on your machine only, at <code>~/.rendercheck/usage.jsonl</code>. Each line
        holds the time, whether it came from the command line or MCP, the tool name, pass or fail, a failure
        type and the duration. It holds no image and no text. It is never sent anywhere; <code>rendercheck stats</code>{' '}
        reads it back. Set <code>RENDERCHECK_NO_USAGE_LOG=1</code> to turn it off, or delete the file.
      </p>
      <p>
        <code>rendercheck init</code> writes files into the current project: agent instructions
        (CLAUDE.md, AGENTS.md, Cursor and Copilot rules) and MCP configuration files. Run it with{' '}
        <code>--dry-run</code> to see what it would write first. The command line and MCP server are in
        0.6.0 and later.
      </p>

      <h2 id="third-party">Third-party requests</h2>
      <p>
        The pages request nothing from other addresses: fonts, scripts and the OCR engine are served from
        this site, and an automated test checks every route for this. Links you choose to follow, such as
        GitHub or npm, are ordinary navigation. As with any hosted site, the hosting provider (Vercel)
        handles the requests for the page files.
      </p>

      <h2 id="report">Reporting a vulnerability</h2>
      <p>
        Please email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the steps to
        reproduce the problem, or use GitHub&apos;s private vulnerability reporting on the repository if it
        is enabled. Please do not open a public issue for a security problem.
      </p>
    </LegalPage>
  );
}
