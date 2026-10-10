import { LegalPage, LegalTable } from '../components/legal/LegalPage';
import { CONTACT_EMAIL } from '../src/config';

/**
 * Privacy Policy.
 * Every statement is something that can be checked in this repository:
 * - no cookies and no third-party requests: vercel.json (Content-Security-Policy), e2e/no-third-party.spec.ts
 * - browser storage: hooks/useTheme (theme), hooks/useLocalHistory (ocr_history), components/ChallengePlayer.tsx
 * - no upload during recognition: src/core/privacy/networkProof.ts and e2e/smoke.spec.ts
 * It has not been reviewed by a lawyer. Have it reviewed before relying on it for legal purposes.
 */
const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'images', label: 'Your images and text' },
  { id: 'storage', label: 'What stays in your browser' },
  { id: 'cookies', label: 'Cookies and tracking' },
  { id: 'hosting', label: 'Hosting and third parties' },
  { id: 'email', label: 'If you email us' },
  { id: 'rights', label: 'Your rights' },
  { id: 'changes', label: 'Changes' },
];

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How RenderCheck and the free image-to-text tool handle data: images are read in your browser and are not uploaded, and the site sets no cookies."
      path="/privacy-policy"
      docRef="RC-PRIVACY"
      version="2.0"
      effective="10 October 2026"
      toc={TOC}
    >
      <h2 id="overview">Overview</h2>
      <p>
        This policy covers getrendercheck.com, including the free image-to-text and redact tools. It is
        operated by Parthiban Rajasekaran, an individual based in the United Kingdom. The RenderCheck SDK
        on npm runs entirely on your own machine and is not covered by anything below, because it sends
        nothing to us.
      </p>
      <p>
        In short: your images are read in your browser and are not uploaded, the site sets no cookies, and
        it loads no analytics or advertising scripts.
      </p>

      <h2 id="images">Your images and text</h2>
      <p>
        Text recognition runs in your browser, using Tesseract.js compiled to WebAssembly, inside a Web
        Worker. The image and the text read from it are held in your browser&apos;s memory while you use
        the page. They are not sent to our servers or to anyone else.
      </p>
      <p>
        You can check this yourself. The tools show a live count of network requests and bytes sent while
        an image is read, and an automated test in the project repository fails if recognition makes any
        request to another address. The site&apos;s Content Security Policy also limits network
        connections to this site. See the <a href="/security">Security page</a> for how to verify it in
        your own browser.
      </p>

      <h2 id="storage">What stays in your browser</h2>
      <p>
        The site stores a few small items in your browser&apos;s local storage. They never leave your
        device and we cannot see them.
      </p>
      <LegalTable
        head={['Key', 'What it holds', 'Why']}
        rows={[
          [<code key="a">theme</code>, 'Light or dark mode', 'To remember your choice'],
          [
            <code key="b">ocr_history</code>,
            'The text of up to 20 recent results, when a tool offers history',
            'So you can find a previous result',
          ],
          [
            <code key="c">rendercheck-challenge-best-v1</code>,
            'Your best score in the challenge',
            'To show your best score',
          ],
        ]}
      />
      <p>
        You can clear these at any time in your browser&apos;s site data settings, or with a tool&apos;s
        history controls where it has them.
      </p>

      <h2 id="cookies">Cookies and tracking</h2>
      <p>
        The site does not set cookies. It does not load analytics, advertising or social media scripts,
        and its Content Security Policy blocks scripts and connections to other addresses. It does not use
        tracking pixels.
      </p>

      <h2 id="hosting">Hosting and third parties</h2>
      <p>
        The site is hosted by Vercel. Like any web host, Vercel handles technical request data, such as IP
        address, browser type and the page requested, to deliver the pages and keep them secure. We do not
        use that data to identify you. Vercel&apos;s own privacy notice applies to it.
      </p>
      <LegalTable
        head={['Service', 'Purpose', 'Data involved']}
        rows={[
          ['Vercel Inc.', 'Hosting and content delivery for getrendercheck.com', 'Standard request data (IP address, user agent, URL)'],
          ['GitHub', 'Hosts the open-source code; only used if you follow a link to it', "Nothing from this site. GitHub's own terms apply once you leave"],
          ['npm', 'Distributes the SDK; only used if you install it', "Nothing from this site. npm's own terms apply once you leave"],
        ]}
      />

      <h2 id="email">If you email us</h2>
      <p>
        If you write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, we receive your email
        address and your message. We use them only to reply, and keep the thread only as long as needed to deal
        with your message.
      </p>

      <h2 id="rights">Your rights</h2>
      <p>
        Under UK data protection law you can ask what personal data we hold about you, ask for it to be
        corrected or deleted, and object to how it is used. Because the tools do not send us your images or
        text, the only personal data we are likely to hold is an email you sent us. To make a request, email
        us. If you are unhappy with how we handle it, you can complain to the Information
        Commissioner&apos;s Office at <a href="https://ico.org.uk">ico.org.uk</a>.
      </p>

      <h2 id="changes">Changes</h2>
      <p>
        If this policy changes, the version number and effective date at the top will change with it. The
        full history is in the project&apos;s public repository.
      </p>
    </LegalPage>
  );
}
