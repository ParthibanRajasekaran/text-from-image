import React from 'react';
import { highlightDiff } from '../packages/rendercheck/src/core/text';

export interface DiffSegment {
  text: string;
  /** true when this stretch differs from the other string */
  diff: boolean;
}

/**
 * Parse the `[...]` markup from highlightDiff into segments. An empty `[]` (a character the other
 * string has and this one lacks) becomes a diff segment with empty text.
 */
export function parseDiff(markup: string): DiffSegment[] {
  const out: DiffSegment[] = [];
  let buf = '';
  let inDiff = false;
  for (const ch of markup) {
    if (ch === '[' && !inDiff) {
      if (buf) out.push({ text: buf, diff: false });
      buf = '';
      inDiff = true;
    } else if (ch === ']' && inDiff) {
      out.push({ text: buf, diff: true });
      buf = '';
      inDiff = false;
    } else buf += ch;
  }
  if (buf) out.push({ text: buf, diff: inDiff });
  return out;
}

function Row({ label, segments }: { label: string; segments: DiffSegment[] }) {
  return (
    <div>
      <dt className="text-xs text-zinc-400">{label}</dt>
      <dd className="mt-0.5 break-words font-mono text-sm">
        {segments.map((s, i) =>
          s.diff ? (
            <mark
              key={i}
              data-testid="diff-mark"
              className="rounded-sm bg-rose-400/25 px-0.5 font-bold text-rose-200 underline decoration-rose-300 decoration-2 underline-offset-2"
            >
              {s.text === '' ? <span aria-label="missing character">∅</span> : s.text}
            </mark>
          ) : (
            <span key={i}>{s.text}</span>
          )
        )}
      </dd>
    </div>
  );
}

/**
 * What the code expects against what is on screen. The differing characters are marked with colour,
 * weight and an underline, so the difference does not depend on colour alone.
 */
export function DiffView({
  expected,
  read,
  className = '',
}: {
  expected: string;
  read: string;
  className?: string;
}) {
  const same = expected.trim() === read.trim();
  const d = same ? null : highlightDiff(expected.trim(), read.trim());
  return (
    <div data-testid="diff-view" className={className}>
      {same ? (
        <p className="text-sm text-emerald-300">The pixels match the expected text exactly.</p>
      ) : (
        <dl className="space-y-2">
          <Row label="Expected (what the DOM or your test says)" segments={parseDiff(d!.expected)} />
          <Row label="On screen (what OCR read)" segments={parseDiff(d!.actual)} />
        </dl>
      )}
    </div>
  );
}

export default DiffView;
