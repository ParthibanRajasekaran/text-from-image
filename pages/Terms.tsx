import { LegalPage } from '../components/legal/LegalPage';
import { CONTACT_EMAIL } from '../src/config';

/**
 * Terms of Service.
 * The wording is carried over unchanged from public/terms.html so that the /terms
 * route and the static file say the same thing. It has not been reviewed by a lawyer.
 */
export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms for using Free Text From Image."
      path="/terms"
    >
      <h2>Acceptance of Terms</h2>
      <p>By using Free Text From Image, you agree to these terms.</p>
      <h2>Use of Service</h2>
      <p>This service is provided as-is, without warranty. Do not use for illegal purposes.</p>
      <h2>Intellectual Property</h2>
      <p>All content and code are the property of their respective owners.</p>
      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
