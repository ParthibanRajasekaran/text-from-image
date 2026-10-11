import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../router';

/**
 * Footer: Global footer with trust signals and navigation
 * - Trust row with privacy/security claims (honest, verified)
 * - 4-column link grid (Product, Developers, Trust, About), driven by getColumns()
 * - Copyright + commit SHA + Developer Beta disclaimer
 */
const REPO = 'https://github.com/ParthibanRajasekaran/text-from-image';

type FooterLink = { label: string; to: string } | { label: string; href: string };

// A function, not a constant: router.tsx imports this file, so ROUTES is not defined yet at import time.
const getColumns = (): { title: string; links: FooterLink[] }[] => [
  {
    title: 'Product',
    links: [
      { label: 'Image to Text', to: ROUTES.IMAGE_TO_TEXT },
      { label: 'Redact an image', to: ROUTES.REDACT_IMAGE },
      { label: 'RenderCheck', to: ROUTES.RENDERCHECK },
      { label: 'Labs', to: ROUTES.LABS },
      { label: 'Access', to: ROUTES.ACCESS },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', to: ROUTES.DEVELOPERS },
      { label: 'Playwright', to: ROUTES.PLAYWRIGHT_OCR_TESTING },
      { label: 'Cypress', to: ROUTES.CYPRESS_OCR_TESTING },
      { label: 'Verification debt', to: ROUTES.WHAT_IS_VERIFICATION_DEBT },
      { label: 'Changelog', to: ROUTES.CHANGELOG },
      { label: 'GitHub', href: REPO },
      { label: 'npm', href: 'https://www.npmjs.com/package/@rendercheck/sdk' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { label: 'Security', to: ROUTES.SECURITY },
      { label: 'Privacy Policy', to: ROUTES.PRIVACY_POLICY },
      { label: 'Terms of Service', to: ROUTES.TERMS },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About RenderCheck', to: ROUTES.ABOUT },
      { label: 'Contact', to: ROUTES.CONTACT },
      { label: 'Evidence and research', href: `${REPO}/tree/main/docs/evidence` },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background">
      {/* Trust signals: each is a claim the Security page explains and a test checks */}
      <div className="border-b border-border/30 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground justify-center">
            <Link to={ROUTES.SECURITY} className="hover:text-foreground transition-colors">
              Images are read in your browser and never uploaded
            </Link>
            <span>No cookies</span>
            <span>No third-party scripts</span>
            <span>No signup required</span>
          </div>
        </div>
      </div>

      {/* Navigation grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {getColumns().map((col) => (
            <div key={col.title}>
              <h3 className="font-semibold text-foreground mb-4">{col.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {'to' in l ? (
                      <Link to={l.to} className="hover:text-foreground transition-colors">
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/30 py-4 text-xs text-muted-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {currentYear} RenderCheck • <span className="text-foreground/60">Developer Beta</span>
          </div>
          <div className="flex items-center gap-4 text-foreground/60">
            <a href="https://github.com/ParthibanRajasekaran/text-from-image" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/parthibanrajasekaran" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
