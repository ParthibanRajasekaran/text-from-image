import React from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { RedactTool } from '../components/RedactTool';
import { KINDS, KIND_LABEL } from '../src/core/redact/detect';
import { ROUTES } from '../router';

export default function RedactImage() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://getrendercheck.com';
  const canonicalAbsolute = new URL(ROUTES.REDACT_IMAGE, SITE_URL).toString();

  useSEO({
    title: 'Redact an Image Online: Hide Emails, Cards and Keys in Your Browser',
    description:
      'Cover emails, card numbers, IBANs, IDs, phone numbers and API keys in a screenshot. It runs in your browser: the image is never uploaded.',
    canonical: canonicalAbsolute,
  });

  return (
    <EnterpriseLayout breadcrumb={[{ label: 'Home', href: ROUTES.HOME }, { label: 'Labs', href: ROUTES.LABS }, { label: 'Redact an image' }]}>
      <section className="mb-10">
        <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">Redact an image, privately</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Cover emails, card numbers, IDs and API keys in a screenshot before you share it. The image is read and edited in your browser. It is never uploaded.
        </p>
      </section>

      <RedactTool />

      <section className="mt-16 grid gap-10 sm:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">What it looks for</h2>
          <ul className="list-disc space-y-1 pl-5 text-foreground/80">
            {KINDS.map((k) => (
              <li key={k}>{KIND_LABEL[k]}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Card numbers must pass the Luhn check and IBANs the mod-97 check, so ordinary numbers are left alone. You can tick off any finding, and draw a box over anything else.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">How it works</h2>
          <ol className="list-decimal space-y-2 pl-5 text-foreground/80">
            <li>OCR reads the text in your image, on your device.</li>
            <li>Patterns pick out the sensitive parts and the tool outlines them.</li>
            <li>You review, then download. The covered areas are painted black into a new PNG, so the original pixels are gone, and image metadata (such as location in a photo) is not carried over.</li>
          </ol>
          <p className="text-sm text-muted-foreground">
            OCR is not perfect, so always check the result by eye. See the <a className="underline" href={ROUTES.SECURITY}>security page</a> for how the site keeps your image on your device.
          </p>
        </div>
      </section>
    </EnterpriseLayout>
  );
}
