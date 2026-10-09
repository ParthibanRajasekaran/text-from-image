import type { ReactNode } from 'react';
import { useSEO } from '../../src/seo';

interface LegalPageProps {
  title: string;
  description: string;
  /** Route path, e.g. "/privacy-policy". Used for the canonical URL. */
  path: string;
  children: ReactNode;
}

/**
 * Shared layout for the privacy, terms and security pages.
 * Plain Tailwind classes only (the project does not use the typography plugin).
 */
export function LegalPage({ title, description, path, children }: LegalPageProps) {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonical = new URL(path, SITE_URL).toString();

  useSEO({ title: `${title} | TextFromImage`, description, canonical });

  return (
    <article
      aria-labelledby="legal-title"
      className="mx-auto max-w-3xl px-6 py-16 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mb-4 [&_p]:leading-7 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 [&_a]:underline"
    >
      <h1 id="legal-title" className="text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <div className="mt-6 text-base text-foreground">{children}</div>
    </article>
  );
}

export default LegalPage;
