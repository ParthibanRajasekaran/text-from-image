import React from 'react';

/**
 * Inline SVG of the system in docs/ARCHITECTURE.md. Every box is a real module; the list under the
 * figure is the text alternative and is checked against the repository by a test.
 */
export const ARCHITECTURE_NODES = [
  { id: 'page', label: 'React app', file: 'src/core/ocr/engineClient.ts' },
  { id: 'worker', label: 'OCR Web Worker', file: 'src/core/ocr/engine.worker.ts' },
  { id: 'proof', label: 'Network proof', file: 'src/core/privacy/networkProof.ts' },
  { id: 'matcher', label: 'toShowText matcher', file: 'packages/rendercheck/src/playwright/matcher.ts' },
  { id: 'verify', label: 'verifyText', file: 'packages/rendercheck/src/core/verify.ts' },
  { id: 'report', label: 'Failure report', file: 'packages/rendercheck/src/core/failures.ts' },
] as const;

const box = 'fill-card stroke-border';
const text = 'fill-foreground';
const sub = 'fill-muted-foreground';

function Node({ x, y, w = 150, h = 54, title, note }: { x: number; y: number; w?: number; h?: number; title: string; note: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} className={box} strokeWidth={1.25} />
      <text x={x + w / 2} y={y + 22} textAnchor="middle" fontSize={13} fontWeight={600} className={text}>{title}</text>
      <text x={x + w / 2} y={y + 40} textAnchor="middle" fontSize={11} className={sub}>{note}</text>
    </g>
  );
}

export function ArchitectureDiagram() {
  return (
    <figure className="my-6 not-prose">
      <svg
        viewBox="0 0 880 400"
        role="img"
        aria-labelledby="arch-title arch-desc"
        className="w-full h-auto rounded-lg border border-border bg-background"
      >
        <title id="arch-title">RenderCheck architecture</title>
        <desc id="arch-desc">
          In the browser, the page sends the image to a Web Worker that runs Tesseract in WebAssembly. A network proof
          counts requests. In a test runner, the matcher calls verifyText, which runs Tesseract in Node and writes a failure
          report. The host serves static files only, and the Content Security Policy blocks requests to any other server.
        </desc>
        <defs>
          <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-muted-foreground" />
          </marker>
        </defs>

        {/* Browser */}
        <rect x={20} y={20} width={470} height={250} rx={12} className="fill-none stroke-primary" strokeWidth={1.5} />
        <text x={36} y={46} fontSize={12} fontWeight={600} className="fill-primary">YOUR BROWSER</text>
        <Node x={40} y={70} title="React app" note="pages and tools" />
        <Node x={300} y={70} title="OCR Web Worker" note="same-origin module" />
        <Node x={300} y={170} title="Tesseract (WASM)" note="self-hosted at /ocr" />
        <Node x={40} y={170} title="Network proof" note="requests and bytes out" />
        <path d="M190 97 H300" className="stroke-muted-foreground" strokeWidth={1.5} fill="none" markerEnd="url(#arch-arrow)" />
        <path d="M375 124 V170" className="stroke-muted-foreground" strokeWidth={1.5} fill="none" markerEnd="url(#arch-arrow)" />
        <path d="M115 124 V170" className="stroke-muted-foreground" strokeWidth={1.5} fill="none" markerEnd="url(#arch-arrow)" />
        <text x={245} y={91} textAnchor="middle" fontSize={10} className={sub}>image</text>
        <text x={40} y={256} fontSize={11} className={sub}>Pixels never leave this box. connect-src &apos;self&apos; blocks every other destination.</text>

        {/* Test runner */}
        <rect x={520} y={20} width={340} height={340} rx={12} className="fill-none stroke-primary" strokeWidth={1.5} strokeDasharray="6 4" />
        <text x={536} y={46} fontSize={12} fontWeight={600} className="fill-primary">TEST RUNNER (PLAYWRIGHT OR CYPRESS)</text>
        <Node x={615} y={66} w={150} title="toShowText" note="matcher" />
        <Node x={615} y={150} w={150} title="verifyText" note="core" />
        <Node x={615} y={234} w={150} title="Tesseract (Node)" note="English model bundled" />
        <Node x={615} y={298} w={150} h={50} title="Failure report" note="JSON and outlined PNG" />
        <path d="M690 120 V150" className="stroke-muted-foreground" strokeWidth={1.5} fill="none" markerEnd="url(#arch-arrow)" />
        <path d="M690 204 V234" className="stroke-muted-foreground" strokeWidth={1.5} fill="none" markerEnd="url(#arch-arrow)" />
        <path d="M770 177 H800 V323 H765" className="stroke-muted-foreground" strokeWidth={1.5} fill="none" markerEnd="url(#arch-arrow)" />

        {/* Host */}
        <rect x={20} y={300} width={470} height={60} rx={12} className={box} strokeWidth={1.25} />
        <text x={255} y={326} textAnchor="middle" fontSize={13} fontWeight={600} className={text}>Static host (Vercel): files only</text>
        <text x={255} y={346} textAnchor="middle" fontSize={11} className={sub}>HTML, JS, WASM and the English model. No upload endpoint.</text>
        <path d="M255 300 V274" className="stroke-muted-foreground" strokeWidth={1.5} fill="none" markerEnd="url(#arch-arrow)" />
        <text x={262} y={290} fontSize={10} className={sub}>served</text>
      </svg>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        The Content Security Policy (<code>connect-src &apos;self&apos;</code>) is what blocks requests to other servers.
        Source: <code>docs/ARCHITECTURE.md</code>.
      </figcaption>
      <ul className="sr-only">
        {ARCHITECTURE_NODES.map((n) => (
          <li key={n.id}>{n.label}: {n.file}</li>
        ))}
      </ul>
    </figure>
  );
}
