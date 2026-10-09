import React from 'react';
import { CodeBlock } from './ui/CodeBlock';

export interface SnippetRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnippetOptions {
  expectedText: string;
  /** In image pixels. For a 1x screenshot of the page these are also page coordinates. */
  region: SnippetRegion;
  minConfidence?: number;
  minContrastRatio?: number;
}

/** Escape text for a single-quoted TypeScript string literal. */
export function quoteTs(text: string): string {
  return `'${text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, '\\n')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')}'`;
}

/** The copy-ready Playwright assertion for a region of the screenshot. */
export function buildPlaywrightSnippet({
  expectedText,
  region,
  minConfidence = 85,
  minContrastRatio = 4.5,
}: SnippetOptions): string {
  const r = (n: number) => Math.round(n);
  return [
    `await expect(page).toShowText(${quoteTs(expectedText)}, {`,
    `  region: { x: ${r(region.x)}, y: ${r(region.y)}, width: ${r(region.width)}, height: ${r(region.height)} },`,
    `  minConfidence: ${minConfidence},`,
    `  minContrastRatio: ${minContrastRatio},`,
    `});`,
  ].join('\n');
}

export interface SnippetExportProps extends SnippetOptions {
  className?: string;
}

export function SnippetExport({ className = '', ...options }: SnippetExportProps) {
  const code = buildPlaywrightSnippet(options);
  return (
    <div className={className} data-testid="snippet-export">
      <CodeBlock code={code} language="typescript" filename="checkout.spec.ts" />
      <p className="mt-2 text-xs text-muted-foreground">
        Coordinates are in screenshot pixels, taken from the image above. They match the page only for a 1x
        screenshot of the same viewport.
      </p>
    </div>
  );
}

export default SnippetExport;
