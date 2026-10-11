import type { ReactNode } from 'react';
import { useSEO } from '../../src/seo';
import { PageBackdrop } from '../PageBackdrop';
import { ScrollNav, type ScrollNavSection } from '../ui/ScrollNav';

interface LegalPageProps {
  title: string;
  description: string;
  /** Route path, e.g. "/privacy-policy". Used for the canonical URL. */
  path: string;
  /** Short document reference shown above the title, e.g. "RC-PRIVACY". */
  docRef: string;
  version: string;
  /** Human-readable effective date, e.g. "10 October 2026". */
  effective: string;
  /** One entry per <h2 id>, in page order. Drives the sticky table of contents. */
  toc: ScrollNavSection[];
  children: ReactNode;
}

/**
 * Shared layout for the privacy, terms and security pages: a document header with version
 * and date, a sticky table of contents, and the text on a raised surface. Colours come from the
 * site's theme tokens so it works in light and dark mode. Plain Tailwind classes only (the
 * project does not use the typography plugin).
 */
export function LegalPage({ title, description, path, docRef, version, effective, toc, children }: LegalPageProps) {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://getrendercheck.com';
  const canonical = new URL(path, SITE_URL).toString();

  useSEO({ title: `${title} | RenderCheck`, description, canonical });

  return (
    <div className="relative isolate overflow-x-clip">
      <PageBackdrop />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-10">
        <aside className="hidden md:block sticky top-24 self-start" aria-label="On this page">
          <ScrollNav sections={toc} />
        </aside>

        <article
          aria-labelledby="legal-title"
          className="rounded-xl border border-border bg-surface p-6 sm:p-10 shadow-sm text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2:first-of-type]:mt-0 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_p]:leading-7 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:leading-7 [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-foreground"
        >
          <header className="border-b border-border pb-6 mb-8">
            <span className="font-mono text-xs text-foreground bg-primary/10 border border-primary/30 px-2.5 py-1 rounded">{docRef}</span>
            <h1 id="legal-title" className="mt-4 text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 font-mono text-xs sm:text-sm">
              Version {version} <span aria-hidden="true">·</span> Effective {effective}
            </p>
          </header>
          {children}
        </article>
      </div>
      </div>
    </div>
  );
}

/** A plain data table for legal pages. */
export function LegalTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div role="region" aria-label="Table, scrollable" tabIndex={0} className="mb-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border align-top">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-2 leading-6">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LegalPage;
