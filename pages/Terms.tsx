import { LegalPage } from '../components/legal/LegalPage';
import { CONTACT_EMAIL } from '../src/config';

/**
 * Terms of Service.
 * Plain-language terms written by the operator. They have not been reviewed by a lawyer.
 * Have them reviewed before relying on them, in particular the liability and governing law sections.
 */
const TOC = [
  { id: 'acceptance', label: 'Acceptance' },
  { id: 'service', label: 'The service' },
  { id: 'use', label: 'Acceptable use' },
  { id: 'accuracy', label: 'Accuracy of results' },
  { id: 'ip', label: 'Ownership and licence' },
  { id: 'liability', label: 'Liability' },
  { id: 'law', label: 'Governing law' },
  { id: 'changes', label: 'Changes and contact' },
];

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms for using RenderCheck, the free image-to-text tools and the open-source SDK."
      path="/terms"
      docRef="RC-TERMS"
      version="2.0"
      effective="10 October 2026"
      toc={TOC}
    >
      <h2 id="acceptance">Acceptance</h2>
      <p>
        By using getrendercheck.com or its tools you agree to these terms. If you do not agree, please do
        not use the site. The site is operated by Parthiban Rajasekaran, an individual based in the United
        Kingdom.
      </p>

      <h2 id="service">The service</h2>
      <p>
        The site offers free tools that read text from images in your browser, and documentation for the
        RenderCheck SDK, an open-source package for Playwright and Cypress tests. RenderCheck and its
        tools are in beta. Features may change, and the service may be unavailable from time to time.
      </p>

      <h2 id="use">Acceptable use</h2>
      <ul>
        <li>Do not use the site to break the law or to process images you have no right to use.</li>
        <li>Do not try to disrupt the site, or to bypass its security measures.</li>
        <li>Do not use automated means to place a heavy load on the site.</li>
      </ul>

      <h2 id="accuracy">Accuracy of results</h2>
      <p>
        Text recognition is probabilistic. Results can contain mistakes, particularly with handwriting,
        small text, low-resolution images and unusual fonts. Check the output before you rely on it, and do
        not use it as the only check for anything where a mistake could cause harm, such as legal, medical
        or financial decisions.
      </p>

      <h2 id="ip">Ownership and licence</h2>
      <p>
        The RenderCheck SDK and the source code of this site are published under the MIT licence in the{' '}
        <a href="https://github.com/ParthibanRajasekaran/text-from-image">project repository</a>, and that
        licence governs your use of the code. You keep all rights to the images you process and the text you
        extract. We do not receive them.
      </p>

      <h2 id="liability">Liability</h2>
      <p>
        The site and tools are provided as they are, without warranties of any kind. To the extent the law
        allows, the operator is not liable for loss arising from your use of the site or from errors in its
        results. Nothing in these terms limits liability that cannot be limited by law, including for death
        or personal injury caused by negligence, or for fraud.
      </p>

      <h2 id="law">Governing law</h2>
      <p>These terms are governed by the laws of England and Wales. The courts of England and Wales have jurisdiction, unless the law of where you live gives you the right to bring a claim elsewhere.</p>

      <h2 id="changes">Changes and contact</h2>
      <p>
        If these terms change, the version number and effective date at the top change with them. Questions:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
