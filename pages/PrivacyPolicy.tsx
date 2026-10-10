import { LegalPage } from '../components/legal/LegalPage';
import { CONTACT_EMAIL } from '../src/config';

/**
 * Privacy Policy.
 * The wording is carried over unchanged from public/privacy-policy.html so that the
 * /privacy-policy route and the static file say the same thing. It has not been
 * reviewed by a lawyer; see the project notes before relying on it.
 */
export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How Free Text From Image handles your data."
      path="/privacy-policy"
    >
      <p>
        Your privacy is important to us. This policy explains what data we collect and how we use
        it.
      </p>
      <h2>Information We Collect</h2>
      <p>We do not store uploaded images. Text extraction is performed in-memory and not retained.</p>
      <h2>Cookies</h2>
      <p>
        We use cookies only for essential site functionality and analytics, never for tracking or
        advertising without consent.
      </p>
      <h2>Consent</h2>
      <p>Ad-related cookies and scripts are loaded only after you provide consent.</p>
      <h2>Contact</h2>
      <p>
        If you have questions, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
