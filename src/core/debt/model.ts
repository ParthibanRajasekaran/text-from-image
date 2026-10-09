export type RiskBand = 'low' | 'moderate' | 'high' | 'critical';

export interface Option {
  label: string;
  points: number;
}

export interface Question {
  id: string;
  /** Short axis label for the radar. */
  axis: string;
  text: string;
  options: Option[];
}

export const QUESTIONS: Question[] = [
  {
    id: 'ai-tools',
    axis: 'AI usage',
    text: 'Do your teams use AI coding tools (GitHub Copilot, Claude Code, etc.)?',
    options: [
      { label: 'Yes, extensively', points: 0 },
      { label: 'Yes, sometimes', points: 2 },
      { label: 'No', points: 5 },
    ],
  },
  {
    id: 'rendered-ui',
    axis: 'Rendered UI',
    text: 'How do you verify that rendered UI shows the correct visible text?',
    options: [
      { label: 'OCR/visual assertions in tests', points: 0 },
      { label: 'Manual QA only', points: 4 },
      { label: 'DOM/code tests only (no visual check)', points: 8 },
      { label: "Don't verify visible text", points: 10 },
    ],
  },
  {
    id: 'pdfs',
    axis: 'Documents',
    text: 'Do you verify generated PDFs, reports, or documents before sending to users?',
    options: [
      { label: 'Yes, with automated checks', points: 0 },
      { label: 'Yes, manual review only', points: 3 },
      { label: 'No, we trust the generator', points: 8 },
    ],
  },
  {
    id: 'legal-copy',
    axis: 'Legal copy',
    text: 'Do you verify that legal, regulatory, or compliance copy is correct?',
    options: [
      { label: 'Yes, every deployment', points: 0 },
      { label: 'Yes, sometimes', points: 3 },
      { label: 'No, we assume it is', points: 7 },
    ],
  },
  {
    id: 'assertions',
    axis: 'Visual asserts',
    text: 'Do you use Playwright/Cypress visual text assertions?',
    options: [
      { label: 'Yes, extensively', points: 0 },
      { label: 'Yes, sometimes', points: 2 },
      { label: 'No, only DOM assertions', points: 5 },
    ],
  },
  {
    id: 'cfr',
    axis: 'Change failures',
    text: 'Do you monitor change failure rate (CFR) after AI-assisted changes?',
    options: [
      { label: 'Yes, closely', points: 0 },
      { label: 'Yes, loosely', points: 2 },
      { label: 'No, we trust the tests', points: 6 },
    ],
  },
  {
    id: 'locale',
    axis: 'Locale text',
    text: 'Do your AI coding tools generate locale-specific text (dates, currency, addresses)?',
    options: [
      { label: 'Yes, and we verify it', points: 0 },
      { label: 'Yes, but minimal testing', points: 3 },
      { label: 'Yes, and we often miss it', points: 7 },
      { label: 'No, single locale only', points: 2 },
    ],
  },
  {
    id: 'shipped-wrong',
    axis: 'Escaped bugs',
    text: 'Have you ever shipped wrong visible text that all tests passed?',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Once or twice', points: 4 },
      { label: 'Yes, multiple times', points: 8 },
      { label: 'Not sure / just started', points: 3 },
    ],
  },
  {
    id: 'truncation',
    axis: 'Truncation',
    text: 'How often do you find truncated or wrapped text in shipped features?',
    options: [
      { label: 'Never, we test thoroughly', points: 0 },
      { label: 'Occasionally (1-2 per quarter)', points: 3 },
      { label: 'Regularly (monthly or more)', points: 6 },
    ],
  },
];

/** Index of the chosen option per question, in QUESTIONS order. */
export type Answers = ReadonlyArray<number | undefined>;

export const maxPoints = (q: Question): number => Math.max(...q.options.map((o) => o.points));
export const MAX_TOTAL = QUESTIONS.reduce((sum, q) => sum + maxPoints(q), 0);

/** Raw points over the questions answered so far. */
export function rawScore(answers: Answers): number {
  return QUESTIONS.reduce((sum, q, i) => {
    const a = answers[i];
    return sum + (a === undefined ? 0 : q.options[a]?.points ?? 0);
  }, 0);
}

/**
 * The score on the 0 to 100 scale the bands use. It is the raw points over the most the questions can
 * award, so a team that gives the riskiest answer to every question scores exactly 100.
 */
export function score100(answers: Answers): number {
  return Math.round((rawScore(answers) / MAX_TOTAL) * 100);
}

export function bandOf(score: number): RiskBand {
  if (score <= 25) return 'low';
  if (score <= 50) return 'moderate';
  if (score <= 75) return 'high';
  return 'critical';
}

export interface AxisValue {
  id: string;
  label: string;
  /** 0 (no debt) to 1 (the riskiest answer). null while the question is unanswered. */
  value: number | null;
}

export function axisValues(answers: Answers): AxisValue[] {
  return QUESTIONS.map((q, i) => {
    const a = answers[i];
    return {
      id: q.id,
      label: q.axis,
      value: a === undefined ? null : (q.options[a]?.points ?? 0) / maxPoints(q),
    };
  });
}

/** The axis with the most debt, for the "main risk" line. Null when nothing is above zero. */
export function biggestRisk(answers: Answers): AxisValue | null {
  const worst = axisValues(answers).reduce<AxisValue | null>(
    (best, v) => (v.value !== null && v.value > 0 && (!best || v.value > (best.value ?? 0)) ? v : best),
    null
  );
  return worst;
}

/** Answers as a short URL-safe string: one digit per question, "-" for unanswered. */
export function encodeAnswers(answers: Answers): string {
  return QUESTIONS.map((_, i) => (answers[i] === undefined ? '-' : String(answers[i]))).join('');
}

/** The inverse of encodeAnswers. Returns null for anything that is not a valid, complete result. */
export function decodeAnswers(text: string): number[] | null {
  if (text.length !== QUESTIONS.length) return null;
  const out: number[] = [];
  for (let i = 0; i < QUESTIONS.length; i++) {
    const n = Number(text[i]);
    if (!/^[0-9]$/.test(text[i]) || n >= QUESTIONS[i].options.length) return null;
    out.push(n);
  }
  return out;
}
