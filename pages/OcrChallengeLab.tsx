import React, { useState } from 'react';
import { useSEO } from '../src/seo';
import { EnterpriseLayout } from '../components/layouts/EnterpriseLayout';
import { ScrollNav } from '../components/ui/ScrollNav';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ROUTES } from '../router';

const sections = [
  { id: 'challenge-of-week', label: 'Challenge of the Week' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'past-challenges', label: 'Past Challenges' },
];

interface Challenge {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  teaches: string;
  expectedText: string;
  imageUrl: string;
  description: string;
}

// Current challenge (updated weekly/monthly)
const CURRENT_CHALLENGE: Challenge = {
  id: 'swiss-receipt-de',
  title: 'Swiss receipt with German locale',
  difficulty: 'hard',
  teaches: 'Locale-specific number and date formats, currency symbol placement',
  expectedText:
    'Gesamtbetrag CHF 89.50 Datum: 15.06.2026 19:45 Uhr MwSt 7.7% EUR 6.81',
  imageUrl: 'https://via.placeholder.com/600x400?text=Swiss+Receipt+Challenge',
  description:
    'A Swiss receipt rendered in German (de-CH locale). Verify that the date format (DD.MM.YYYY), currency format (CHF notation and number separator), and VAT calculation all match expected German/Swiss conventions.',
};

// Past challenges for reference
const PAST_CHALLENGES: Challenge[] = [
  {
    id: 'us-invoice-eur',
    title: 'US invoice with EUR currency',
    difficulty: 'medium',
    teaches: 'Currency symbol placement, decimal separator consistency',
    expectedText: '€1.234,56 (European format with comma)',
    imageUrl: 'https://via.placeholder.com/600x400?text=EUR+Invoice+Challenge',
    description:
      'Invoice generated for US user but rendered with EUR currency and European number formatting. Spot the mismatch.',
  },
  {
    id: 'rtl-truncation',
    title: 'Arabic text truncation',
    difficulty: 'hard',
    teaches: 'RTL text handling, overflow detection',
    expectedText: 'مرحبا بك في المتجر',
    imageUrl: 'https://via.placeholder.com/600x400?text=RTL+Challenge',
    description:
      'Product description in Arabic (RTL) is truncated because layout assumes LTR text width. Verify the full phrase appears.',
  },
];

export default function OcrChallengeLab() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/ocr-challenge-lab', SITE_URL).toString();

  useSEO({
    title: 'OCR Challenge Lab — Weekly Verification Challenges',
    description: 'Test your OCR and verification skills with weekly challenges. Verify rendered output under real-world conditions.',
    canonical: canonicalAbsolute,
  });

  const [shareCardVisible, setShareCardVisible] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  const handleChallengeComplete = (success: boolean) => {
    setChallengeCompleted(success);
    if (success) {
      setShareCardVisible(true);
    }
  };

  return (
    <EnterpriseLayout
      sidebar={<ScrollNav sections={sections} />}
      breadcrumb={[
        { label: 'Home', href: ROUTES.HOME },
        { label: 'Labs', href: ROUTES.LABS },
        { label: 'OCR Challenge Lab' },
      ]}
    >
      {/* Hero */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">OCR Challenge Lab</h1>
          <StatusBadge variant="live" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Test your OCR and visual verification skills with real-world challenges. A new challenge appears every week.
        </p>
      </section>

      {/* Challenge of the Week */}
      <section id="challenge-of-week" className="mb-12 border border-border rounded-lg p-8 bg-muted/30">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Challenge of the Week</h2>
              <p className="text-sm text-muted-foreground mt-1">Published: {new Date().toLocaleDateString()}</p>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded font-medium ${
                CURRENT_CHALLENGE.difficulty === 'easy'
                  ? 'bg-green-500/20 text-green-300'
                  : CURRENT_CHALLENGE.difficulty === 'medium'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-red-500/20 text-red-300'
              }`}
            >
              {CURRENT_CHALLENGE.difficulty.charAt(0).toUpperCase() + CURRENT_CHALLENGE.difficulty.slice(1)}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground">{CURRENT_CHALLENGE.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{CURRENT_CHALLENGE.teaches}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-foreground/80">
              <strong>Your task:</strong> {CURRENT_CHALLENGE.description}
            </p>
            <div className="bg-code-bg border border-code-border rounded p-3 mt-3">
              <p className="font-mono text-xs text-code-text break-all">{CURRENT_CHALLENGE.expectedText}</p>
            </div>
          </div>

          <img
            src={CURRENT_CHALLENGE.imageUrl}
            alt={CURRENT_CHALLENGE.title}
            className="rounded-lg border border-border max-h-96 w-full object-cover"
          />

          <div className="flex gap-3">
            <button
              onClick={() => handleChallengeComplete(true)}
              className="flex-1 px-4 py-3 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg font-medium hover:bg-green-500/30 transition-colors"
            >
              ✓ I found all the text
            </button>
            <button
              onClick={() => handleChallengeComplete(false)}
              className="flex-1 px-4 py-3 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-medium hover:bg-amber-500/30 transition-colors"
            >
              ✗ Text is missing or wrong
            </button>
          </div>

          {shareCardVisible && (
            <div className="bg-black/40 border border-border rounded-lg p-4 space-y-3">
              <p className="text-sm text-foreground">I passed this week's RenderCheck challenge!</p>
              <div className="bg-code-bg rounded p-3 border border-code-border">
                <p className="text-xs text-code-text font-mono">{CURRENT_CHALLENGE.title}</p>
                <p className="text-xs text-code-text/70 font-mono mt-1">Difficulty: {CURRENT_CHALLENGE.difficulty}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `I passed this week's RenderCheck challenge: ${CURRENT_CHALLENGE.title}\n${SITE_URL}/ocr-challenge-lab`
                  );
                }}
                className="w-full px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded transition-all text-sm"
              >
                Copy result to share
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mb-12 border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">How It Works</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-foreground">View the challenge image</h3>
              <p className="text-sm text-foreground/80 mt-1">
                A screenshot or document with rendered text. Your job: extract what you see.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Match the expected text</h3>
              <p className="text-sm text-foreground/80 mt-1">
                We show you what should appear on screen. If you found it all, you passed.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Learn from the gap</h3>
              <p className="text-sm text-foreground/80 mt-1">
                If you missed text, that's exactly what RenderCheck catches in CI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Past Challenges */}
      <section id="past-challenges" className="border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Past Challenges</h2>
        <div className="space-y-4">
          {PAST_CHALLENGES.map((challenge) => (
            <div key={challenge.id} className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                  <p className="text-sm text-foreground/80 mt-1">{challenge.teaches}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                    challenge.difficulty === 'easy'
                      ? 'bg-green-500/20 text-green-300'
                      : challenge.difficulty === 'medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {challenge.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t pt-8 mt-8 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Use RenderCheck in your tests</h3>
        <p className="text-foreground/80">
          These challenges are practice. In production, use RenderCheck to automate visual verification in Playwright and Cypress.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={ROUTES.RENDERCHECK}
            className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-[hsl(220_89%_35%)] transition-colors"
          >
            Learn RenderCheck
          </a>
          <a
            href={ROUTES.DEVELOPERS}
            className="inline-flex px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
          >
            Read the developer docs
          </a>
        </div>
      </section>
    </EnterpriseLayout>
  );
}
