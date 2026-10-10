import { highlightDiff, normalizeText, similarity } from '../../../packages/rendercheck/src/core/text';
import type { Bug, BugKind, Challenge } from './challenges';

/** The best similarity between `needle` and any stretch of `hay` about as long as it. 1 = it is in there. */
export function bestMatch(hay: string, needle: string): { sim: number; at: string } {
  const h = normalizeText(hay, false);
  const n = normalizeText(needle, false);
  if (!n || !h) return { sim: 0, at: '' };
  if (h.includes(n)) return { sim: 1, at: n };
  let best = { sim: 0, at: '' };
  for (let len = Math.max(1, n.length - 2); len <= n.length + 2; len++) {
    for (let i = 0; i + len <= h.length; i++) {
      const w = h.slice(i, i + len);
      const s = similarity(w, n, false);
      if (s > best.sim) best = { sim: s, at: w };
    }
  }
  return best;
}

export interface BugResult {
  bug: Bug;
  /** The player named this kind of bug. */
  found: boolean;
  /** 0..1 credit for the rewrite. null when this bug has nothing to rewrite. */
  fixed: number | null;
  /** The closest stretch of the player's text to the fix, for the diff. */
  attempt?: string;
  diff?: { expected: string; actual: string };
}

export interface Grade {
  /** 0..100 */
  score: number;
  detection: number;
  rewrite: number | null;
  results: BugResult[];
  /** Kinds the player named that are not bugs here. */
  falsePositives: BugKind[];
  label: 'Perfect' | 'Sharp' | 'Getting there' | 'Keep looking';
}

/** Credit for one rewrite: the fix must be closer to what they typed than the bug is. */
function fixCredit(answer: string, bug: Bug): { credit: number; attempt: string; target: string } {
  const fixes = bug.fix ?? [];
  const bugText = bestMatch(answer, bug.shows).sim;
  let best = { credit: -1, sim: -1, attempt: '', target: fixes[0] ?? '' };
  for (const fix of fixes) {
    const m = bestMatch(answer, fix);
    let credit = 0;
    if (m.sim === 1) credit = 1;
    else if (m.sim >= 0.75 && m.sim > bugText) credit = Math.min(0.9, (m.sim - 0.75) / 0.2);
    if (credit > best.credit || (credit === best.credit && m.sim > best.sim)) best = { credit, sim: m.sim, attempt: m.at, target: fix };
  }
  return { credit: Math.max(0, best.credit), attempt: best.attempt, target: best.target };
}

/**
 * Half the score is for naming the bugs (each wrong guess costs half a point), half is for rewriting
 * the text. A challenge whose bugs have no rewrite is scored on naming alone.
 */
export function grade(challenge: Challenge, picked: ReadonlySet<BugKind>, answer: string): Grade {
  const truth = new Set(challenge.bugs.map((b) => b.kind));
  const tp = [...picked].filter((k) => truth.has(k)).length;
  const falsePositives = [...picked].filter((k) => !truth.has(k));
  const detection = Math.max(0, (tp - 0.5 * falsePositives.length) / truth.size);

  const results: BugResult[] = challenge.bugs.map((bug) => {
    const found = picked.has(bug.kind);
    if (!bug.fix?.length) return { bug, found, fixed: null };
    const { credit, attempt, target } = fixCredit(answer, bug);
    const diff = attempt && credit < 1 ? highlightDiff(normalizeText(target, false), attempt) : undefined;
    return { bug, found, fixed: credit, attempt: attempt || undefined, diff };
  });

  const fixable = results.filter((r) => r.fixed !== null);
  const rewrite = fixable.length ? fixable.reduce((s, r) => s + (r.fixed as number), 0) / fixable.length : null;
  const score = Math.round((rewrite === null ? detection : detection * 0.5 + rewrite * 0.5) * 100);
  const label = score >= 100 ? 'Perfect' : score >= 75 ? 'Sharp' : score >= 40 ? 'Getting there' : 'Keep looking';
  return { score, detection, rewrite, results, falsePositives, label };
}
