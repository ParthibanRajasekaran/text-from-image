/**
 * Text comparison helpers shared by the matchers and the website demo.
 */

/** Collapse whitespace; lower-case unless `ignoreCase` is false. Punctuation and symbols are kept. */
export function normalizeText(s: string, ignoreCase = true): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return ignoreCase ? t.toLowerCase() : t;
}

type Op = 'eq' | 'sub' | 'del' | 'ins';

/** Levenshtein edit script from `a` to `b`. */
function editScript(a: string, b: string): Op[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, (_, i) => [i, ...Array(m).fill(0)]);
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  const ops: Op[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      ops.push('eq');
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.push('sub');
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push('del');
      i--;
    } else {
      ops.push('ins');
      j--;
    }
  }
  return ops.reverse();
}

/** 1 - editDistance / longerLength, after normalising. 1 means identical. */
export function similarity(a: string, b: string, ignoreCase = true): number {
  const x = normalizeText(a, ignoreCase);
  const y = normalizeText(b, ignoreCase);
  if (x === y) return 1;
  if (!x.length || !y.length) return 0;
  const edits = editScript(x, y).filter((o) => o !== 'eq').length;
  return 1 - edits / Math.max(x.length, y.length);
}

/**
 * Show exactly where two strings differ by wrapping the differing characters in [ ].
 *   highlightDiff('Total: $14.00', 'Total: €14.00') -> { expected: 'Total: [$]14.00', actual: 'Total: [€]14.00' }
 * An empty [] marks a character the other string has and this one lacks.
 */
export function highlightDiff(expected: string, actual: string): { expected: string; actual: string } {
  const a = expected;
  const b = actual;
  const ops = editScript(a, b);
  let ea = '';
  let eb = '';
  let i = 0;
  let j = 0;
  let openA = false;
  let openB = false;
  const close = () => {
    if (openA) ea += ']';
    if (openB) eb += ']';
    openA = openB = false;
  };
  let inDiff = false;
  for (const op of ops) {
    if (op === 'eq') {
      if (inDiff) {
        close();
        inDiff = false;
      }
      ea += a[i++];
      eb += b[j++];
      continue;
    }
    if (!inDiff) {
      ea += '[';
      eb += '[';
      openA = openB = true;
      inDiff = true;
    }
    if (op === 'sub') {
      ea += a[i++];
      eb += b[j++];
    } else if (op === 'del') {
      ea += a[i++];
    } else {
      eb += b[j++];
    }
  }
  if (inDiff) close();
  return { expected: ea, actual: eb };
}
