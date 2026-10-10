import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../router';

/**
 * Footer: Global footer with trust signals and navigation
 * - Trust row with privacy/security claims (honest, verified)
 * - 4-column link grid (Platform, Developers, Privacy, Impact)
 * - Copyright + commit SHA + Developer Beta disclaimer
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background">
      {/* Trust signals */}
      <div className="border-b border-border/30 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center">
            <span>• Browser OCR runs locally</span>
            <span>• No image or text persistence</span>
            <span>• HTTPS only</span>
            <span>• No signup required</span>
            <span>• Keyboard accessible</span>
          </div>
        </div>
      </div>

      {/* Navigation grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Platform */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to={ROUTES.HOME} className="hover:text-foreground transition-colors">
                  Browser OCR
                </Link>
              </li>
              <li>
                <Link to={ROUTES.RENDERCHECK} className="hover:text-foreground transition-colors">
                  RenderCheck
                </Link>
              </li>
              <li>
                <Link to={ROUTES.LABS} className="hover:text-foreground transition-colors">
                  Labs
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ACCESS} className="hover:text-foreground transition-colors">
                  Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Developers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to={ROUTES.DEVELOPERS} className="hover:text-foreground transition-colors">
                  API Docs
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/ParthibanRajasekaran/text-from-image"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/@freetextfromimage/rendercheck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  npm Package
                </a>
              </li>
              <li>
                <Link to={ROUTES.RENDERCHECK} className="hover:text-foreground transition-colors">
                  SDK Docs
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Security */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Privacy & Security</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/privacy-policy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/security" className="hover:text-foreground transition-colors">
                  Security Architecture
                </a>
              </li>
              <li>
                <span className="text-foreground/60">No data persistence by default</span>
              </li>
            </ul>
          </div>

          {/* Impact & Evidence */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Evidence & Impact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to={ROUTES.CASE_STUDIES} className="hover:text-foreground transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <a href="/docs/evidence" className="hover:text-foreground transition-colors">
                  Evidence Pack
                </a>
              </li>
              <li>
                <Link to={ROUTES.CHANGELOG} className="hover:text-foreground transition-colors">
                  Changelog
                </Link>
              </li>
              <li>
                <a href="https://github.com/ParthibanRajasekaran" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Author Profile
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/30 py-4 text-xs text-muted-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {currentYear} Free Text From Image • <span className="text-foreground/60">Developer Beta</span>
          </div>
          <div className="flex items-center gap-4 text-foreground/60">
            <a href="https://github.com/ParthibanRajasekaran/text-from-image" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/parthiban-rajasekaran" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
