import React, { useMemo, useState } from 'react';
import { BUG_KINDS, BUG_LABEL, type BugKind, type Challenge } from '../src/core/challenge/challenges';
import { grade as gradeAnswer, type Grade } from '../src/core/challenge/grade';
import { renderChallengeImage } from '../src/core/challenge/shareImage';

const STORE = 'rendercheck-challenge-best-v1';

function readBest(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(STORE);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}
function saveBest(id: string, score: number): number {
  const best = readBest();
  const next = Math.max(best[id] ?? 0, score);
  try {
    window.localStorage.setItem(STORE, JSON.stringify({ ...best, [id]: next }));
  } catch {
    /* private mode: the score still shows for this visit */
  }
  return next;
}

const button =
  'inline-flex min-h-[44px] items-center justify-center rounded-md border border-border bg-muted/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50';
const primary =
  'inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export interface ChallengePlayerProps {
  challenge: Challenge;
  siteUrl?: string;
}

/** Mount it with `key={challenge.id}` so a new challenge starts clean. */
export function ChallengePlayer({ challenge, siteUrl = 'https://freetextfromimage.com' }: ChallengePlayerProps) {
  const [picked, setPicked] = useState<Set<BugKind>>(new Set());
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<Grade | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [best, setBest] = useState<number | null>(() => readBest()[challenge.id] ?? null);
  const [notice, setNotice] = useState('');

  const hasRewrite = useMemo(() => challenge.bugs.some((b) => b.fix?.length), [challenge]);

  const toggle = (k: BugKind) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const check = () => {
    const g = gradeAnswer(challenge, picked, answer);
    setResult(g);
    setBest(saveBest(challenge.id, g.score));
  };

  const say = (m: string) => {
    setNotice(m);
    window.setTimeout(() => setNotice(''), 4000);
  };

  const summary = (g: Grade) => {
    const found = g.results.filter((r) => r.found).length;
    return { found, total: g.results.length };
  };

  const shareText = (g: Grade) => {
    const { found, total } = summary(g);
    return `I scored ${g.score}/100 on this week's RenderCheck challenge "${challenge.title}" (found ${found} of ${total} bug${total === 1 ? '' : 's'}).\n${siteUrl}/ocr-challenge-lab`;
  };

  const download = async (g: Grade) => {
    try {
      const blob = await renderChallengeImage({ title: challenge.title, difficulty: challenge.difficulty, grade: { ...g, ...summary(g) } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rendercheck-challenge-${challenge.id}.png`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      say('Could not create the image.');
    }
  };

  const copy = async (g: Grade) => {
    try {
      await navigator.clipboard.writeText(shareText(g));
      say('Copied.');
    } catch {
      say('Copying is not available here.');
    }
  };

  return (
    <div className="space-y-6" data-testid="challenge-player">
      <img
        src={challenge.imageUrl}
        alt={challenge.imageAlt}
        className="w-full max-w-2xl rounded-lg border border-border bg-muted"
        width={600}
        height={400}
      />
      <p className="text-foreground/90">{challenge.brief}</p>

      {!result && (
        <>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-base font-semibold text-foreground">What is wrong? Tick every problem you can see.</legend>
            {BUG_KINDS.map((k) => (
              <label key={k} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border border-border px-3 text-sm text-foreground hover:bg-muted/50">
                <input
                  type="checkbox"
                  data-testid={`challenge-pick-${k}`}
                  checked={picked.has(k)}
                  onChange={() => toggle(k)}
                  className="h-5 w-5"
                />
                <span>{BUG_LABEL[k]}</span>
              </label>
            ))}
          </fieldset>

          {hasRewrite && (
            <div className="space-y-2">
              <label htmlFor="challenge-answer" className="block text-base font-semibold text-foreground">
                Rewrite the wrong parts as they should read
              </label>
              <textarea
                id="challenge-answer"
                data-testid="challenge-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="One line per fix is fine"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="button" data-testid="challenge-check" className={primary} onClick={check}>
              Check my answer
            </button>
            {challenge.hint && (
              <button type="button" className={button} aria-expanded={showHint} onClick={() => setShowHint((s) => !s)}>
                {showHint ? 'Hide hint' : 'Show a hint'}
              </button>
            )}
          </div>
          {showHint && challenge.hint && <p className="text-sm text-muted-foreground">{challenge.hint}</p>}
        </>
      )}

      {result && (
        <section aria-labelledby="challenge-result-heading" className="space-y-5" data-testid="challenge-result">
          <div>
            <h3 id="challenge-result-heading" className="text-2xl font-bold text-foreground">
              <span data-testid="challenge-score">{result.score}</span>
              <span className="text-muted-foreground"> / 100</span> · {result.label}
            </h3>
            {best !== null && <p className="text-sm text-muted-foreground">Your best on this challenge: {best}</p>}
            <p className="text-sm text-muted-foreground">Graded in your browser. Nothing was sent anywhere.</p>
          </div>

          {result.falsePositives.length > 0 && (
            <p className="text-sm text-foreground">
              Not a bug here: {result.falsePositives.map((k) => BUG_LABEL[k]).join('; ')}.
            </p>
          )}

          <ul className="space-y-4">
            {result.results.map((r) => (
              <li key={r.bug.kind} data-testid={`challenge-result-${r.bug.kind}`} className="rounded-lg border border-border p-4">
                <p className="font-semibold text-foreground">
                  {r.found ? 'Found: ' : 'Missed: '}
                  {BUG_LABEL[r.bug.kind]}
                </p>
                <p className="mt-1 text-sm text-foreground/90">
                  On screen: <code className="rounded bg-muted/60 px-1 py-0.5 text-foreground" dir="auto">{r.bug.shows}</code>
                </p>
                <p className="mt-1 text-sm text-foreground/90">{r.bug.why}</p>
                {r.fixed !== null && (
                  <p className="mt-2 text-sm text-foreground">
                    Your rewrite: {r.fixed === 1 ? 'correct' : r.fixed > 0 ? 'close' : 'not right'}.
                    {r.fixed < 1 && r.bug.fix && (
                      <>
                        {' '}Should read{' '}
                        <code className="rounded bg-muted/60 px-1 py-0.5 text-foreground">{r.bug.fix[0]}</code>
                        {r.bug.fix.length > 1 && <> (or {r.bug.fix.slice(1).join(', ')})</>}.
                      </>
                    )}
                  </p>
                )}
                {r.diff && (
                  <p className="mt-1 font-mono text-xs text-foreground/90" data-testid="challenge-diff">
                    {r.diff.expected} → {r.diff.actual}
                  </p>
                )}
                <p className="mt-3 text-xs font-medium text-muted-foreground">RenderCheck catches it with</p>
                {/* Scrollable, so it must be reachable by keyboard. */}
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
                <pre className="mt-1 overflow-x-auto rounded bg-muted/60 p-2 text-xs text-foreground" tabIndex={0}>
                  <code>{r.bug.catch}</code>
                </pre>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <button type="button" className={primary} onClick={() => download(result)}>
              Download result image
            </button>
            <button type="button" className={button} onClick={() => copy(result)}>
              Copy result text
            </button>
            <button
              type="button"
              className={button}
              onClick={() => {
                setResult(null);
                setPicked(new Set());
                setAnswer('');
              }}
            >
              Try again
            </button>
          </div>
          <p role="status" aria-live="polite" className="min-h-[1.25rem] text-sm text-muted-foreground">
            {notice}
          </p>
        </section>
      )}
    </div>
  );
}
