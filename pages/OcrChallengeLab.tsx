import React, { useState } from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { ScrollNav } from '../components/ui/ScrollNav';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ChallengePlayer } from '../components/ChallengePlayer';
import { CHALLENGES, challengeForDate, weekStart } from '../src/core/challenge/challenges';
import { ROUTES } from '../router';

const sections = [
  { id: 'challenge-of-week', label: 'Challenge of the Week' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'past-challenges', label: 'Practice' },
];

const DIFFICULTY_STYLE = {
  easy: 'bg-green-500/20 text-green-800 dark:text-green-300',
  medium: 'bg-amber-500/20 text-amber-800 dark:text-amber-300',
  hard: 'bg-red-500/20 text-red-800 dark:text-red-300',
} as const;

export default function OcrChallengeLab() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://getrendercheck.com';
  const canonicalAbsolute = new URL('/ocr-challenge-lab', SITE_URL).toString();

  useSEO({
    title: 'OCR Challenge Lab: Spot the Bug in a Screenshot, Graded',
    description:
      'A new screenshot with hidden bugs every week: wrong currency, swapped dates, cut-off text. Find them, rewrite them, and get a real score. Graded in your browser.',
    canonical: canonicalAbsolute,
  });

  const thisWeek = challengeForDate(new Date());
  const [selectedId, setSelectedId] = useState(thisWeek.id);
  const selected = CHALLENGES.find((c) => c.id === selectedId) ?? thisWeek;
  const isThisWeek = selected.id === thisWeek.id;
  const started = weekStart(new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  return (
    <EnterpriseLayout
      sidebar={<ScrollNav sections={sections} />}
      breadcrumb={[
        { label: 'Home', href: ROUTES.HOME },
        { label: 'Labs', href: ROUTES.LABS },
        { label: 'OCR Challenge Lab' },
      ]}
    >
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">OCR Challenge Lab</h1>
          <StatusBadge variant="live" />
        </div>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Every week there is a screenshot with something wrong in it. Find the bugs, rewrite them, and get a real score. The kind of bug a DOM test lets through.
        </p>
      </section>

      <section id="challenge-of-week" className="mb-12 rounded-lg border border-border bg-muted/30 p-6 sm:p-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{isThisWeek ? 'Challenge of the Week' : 'Practice challenge'}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isThisWeek ? `Week of ${started}` : 'An earlier challenge'}
              </p>
            </div>
            <span className={`rounded px-3 py-1 text-xs font-medium ${DIFFICULTY_STYLE[selected.difficulty]}`}>
              {selected.difficulty.charAt(0).toUpperCase() + selected.difficulty.slice(1)}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">{selected.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">You will practise: {selected.teaches}</p>
          </div>
          <React.Fragment key={selected.id}>
            <ChallengePlayer challenge={selected} siteUrl={SITE_URL} />
          </React.Fragment>
        </div>
      </section>

      <section id="how-it-works" className="mb-12 border-t pt-8">
        <h2 className="mb-6 text-2xl font-bold text-foreground">How It Works</h2>
        <ol className="space-y-4">
          {[
            ['Look at the screenshot', 'Read it the way a customer would. Add up the numbers. Check the dates against the country.'],
            ['Name the bugs and rewrite them', 'Tick the kinds of bug you see, then type the text as it should read. Wrong guesses cost points.'],
            ['See what a test would catch', 'You get a score, the reason for each bug and the one-line RenderCheck assertion that fails on it.'],
          ].map(([title, text], i) => (
            <li key={title} className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/20 font-semibold text-primary">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-foreground/80">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          Grading runs in your browser and the answers are in the page, so this is practice, not a contest. Nothing you type is sent anywhere.
        </p>
      </section>

      <section id="past-challenges" className="border-t pt-8">
        <h2 className="mb-6 text-2xl font-bold text-foreground">Practice</h2>
        <ul className="space-y-3">
          {CHALLENGES.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">
                  {c.title}
                  {c.id === thisWeek.id && <span className="ml-2 text-xs font-medium text-primary">This week</span>}
                </h3>
                <p className="mt-1 text-sm text-foreground/80">{c.teaches}</p>
              </div>
              <span className={`rounded px-2 py-1 text-xs ${DIFFICULTY_STYLE[c.difficulty]}`}>{c.difficulty}</span>
              <button
                type="button"
                aria-pressed={c.id === selected.id}
                onClick={() => {
                  setSelectedId(c.id);
                  document.getElementById('challenge-of-week')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-border bg-muted/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {c.id === selected.id ? 'Playing' : 'Play'}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 space-y-4 border-t pt-8">
        <h3 className="text-xl font-semibold text-foreground">Use RenderCheck in your tests</h3>
        <p className="text-foreground/80">
          These challenges are practice. In production, RenderCheck runs the same checks in Playwright and Cypress, on your machine, with no upload.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={ROUTES.RENDERCHECK}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-[hsl(220_89%_35%)]"
          >
            Learn RenderCheck
          </a>
          <a
            href={ROUTES.DEVELOPERS}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-primary px-4 py-2 font-medium text-primary transition-colors hover:bg-primary/5"
          >
            Read the developer docs
          </a>
        </div>
      </section>
    </EnterpriseLayout>
  );
}
