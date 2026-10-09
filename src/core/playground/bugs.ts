export type BugId = 'currency' | 'invisible' | 'truncated' | 'covered';

export interface BugDef {
  id: BugId;
  label: string;
  /** What the code still believes. */
  domSays: string;
}

export const EXPECTED_TOTAL = 'Total: $14.00';

export const BUGS: readonly BugDef[] = [
  { id: 'currency', label: 'Wrong currency', domSays: 'The "$" is still in the DOM; CSS paints "€" over it.' },
  { id: 'invisible', label: 'Invisible text', domSays: 'The text is in the DOM, in near-white on white.' },
  { id: 'truncated', label: 'Truncated total', domSays: 'The full text is in the DOM; a narrow box clips it.' },
  { id: 'covered', label: 'Covered by an overlay', domSays: 'The element is "visible"; a white layer sits on top.' },
];

export interface DomSnapshot {
  text: string;
  displayed: boolean;
  hasSize: boolean;
}

export interface DomVerdict {
  pass: boolean;
  headline: string;
}

/** What `toHaveText` + `toBeVisible` would conclude. None of them look at the pixels. */
export function domVerdict(s: DomSnapshot, expected: string = EXPECTED_TOTAL): DomVerdict {
  const textOk = s.text.replace(/\s+/g, ' ').trim().includes(expected);
  const visibleOk = s.displayed && s.hasSize;
  if (textOk && visibleOk) return { pass: true, headline: 'The element exists, is visible and has the right text.' };
  return { pass: false, headline: !textOk ? 'The DOM text differs.' : 'The element is hidden.' };
}
