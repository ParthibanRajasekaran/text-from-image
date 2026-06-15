import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '../src/seo';
import { useTheme } from '../hooks/useTheme';
import { AuroraBackground } from '../components/AuroraBackground';
import { Glass } from '../components/ui/Glass';
import { trackToolStarted, trackToolCompleted } from '../lib/analytics';

type RiskLevel = 'low' | 'medium' | 'high';

interface Question {
  id: string;
  text: string;
  options: { label: string; points: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'ai-tools',
    text: 'Do your teams use AI coding tools (GitHub Copilot, Claude Code, etc.)?',
    options: [
      { label: 'Yes, extensively', points: 0 },
      { label: 'Yes, sometimes', points: 2 },
      { label: 'No', points: 5 },
    ],
  },
  {
    id: 'rendered-ui',
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
    text: 'Do you verify generated PDFs, reports, or documents?',
    options: [
      { label: 'Yes, with automated checks', points: 0 },
      { label: 'Yes, manual review only', points: 3 },
      { label: 'No, we trust the generator', points: 8 },
    ],
  },
  {
    id: 'legal-copy',
    text: 'Do you verify that legal, regulatory, or compliance copy is correct?',
    options: [
      { label: 'Yes, every deployment', points: 0 },
      { label: 'Yes, sometimes', points: 3 },
      { label: 'No, we assume it is', points: 7 },
    ],
  },
  {
    id: 'assertions',
    text: 'Do you use Playwright/Cypress visual text assertions?',
    options: [
      { label: 'Yes, extensively', points: 0 },
      { label: 'Yes, sometimes', points: 2 },
      { label: 'No, only DOM assertions', points: 5 },
    ],
  },
  {
    id: 'cfr',
    text: 'Do you monitor change failure rate (CFR) after AI-assisted changes?',
    options: [
      { label: 'Yes, closely', points: 0 },
      { label: 'Yes, loosely', points: 2 },
      { label: 'No, we trust the tests', points: 6 },
    ],
  },
];

function calculateScore(answers: Record<string, number>): number {
  return Object.values(answers).reduce((sum, points) => sum + points, 0);
}

function getRiskLevel(score: number): RiskLevel {
  if (score <= 15) return 'low';
  if (score <= 30) return 'medium';
  return 'high';
}

function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return 'bg-green-500/20 border-green-500/30 text-green-300';
    case 'medium':
      return 'bg-amber-500/20 border-amber-500/30 text-amber-300';
    case 'high':
      return 'bg-red-500/20 border-red-500/30 text-red-300';
  }
}

function getRiskLabel(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return '✓ Low Risk';
    case 'medium':
      return '⚠ Medium Risk';
    case 'high':
      return '✗ High Risk';
  }
}

export default function VerificationDebtScore() {
  const { theme } = useTheme();
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/verify-debt-score', SITE_URL).toString();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  useSEO({
    title: 'Verification Debt Score — AI UI Testing',
    description: 'Assess your team\'s AI-generated UI verification maturity. Calculate your verification debt score and get RenderCheck recommendations.',
    canonical: canonicalAbsolute,
  });

  const handleAnswer = (points: number) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestion].id]: points };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      trackToolStarted({ toolName: 'verification-debt-score' });
      trackToolCompleted({ toolName: 'verification-debt-score', durationMs: 0 });
      setShowResult(true);
    }
  };

  const score = calculateScore(answers);
  const risk = getRiskLevel(score);
  const progress = ((currentQuestion + (showResult ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <AuroraBackground>
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="text-lg font-bold bg-gradient-to-r from-accent via-primary to-accent-2 bg-clip-text text-transparent">
            FreeTextFromImage
          </a>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-16 sm:py-24 max-w-2xl mx-auto text-center space-y-6"
        >
          <h1 className="text-4xl sm:text-5xl font-bold">
            <span className="bg-gradient-to-r from-accent via-accent-2 to-primary bg-clip-text text-transparent">
              Verification Debt Score
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Assess how well your team verifies AI-generated UI output
          </p>
        </motion.section>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.section
              key="survey"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="py-12 max-w-2xl mx-auto space-y-8"
            >
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
                  <span className="text-accent">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-accent to-primary"
                  />
                </div>
              </div>

              {/* Question */}
              <Glass>
                <div className="p-8 space-y-6">
                  <h2 className="text-xl font-semibold">{QUESTIONS[currentQuestion].text}</h2>
                  <div className="space-y-3">
                    {QUESTIONS[currentQuestion].options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleAnswer(option.points)}
                        className="w-full p-4 text-left border border-border/50 rounded-lg hover:bg-white/5 hover:border-accent/50 transition-all text-white font-medium"
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </Glass>
            </motion.section>
          ) : (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 max-w-2xl mx-auto space-y-8"
            >
              {/* Score Card */}
              <Glass>
                <div className={`p-8 space-y-4 border-l-4 ${getRiskColor(risk)}`}>
                  <div className="text-5xl font-bold">{score}</div>
                  <div className="text-2xl font-semibold">{getRiskLabel(risk)}</div>
                  <p className="text-sm text-muted-foreground">
                    {risk === 'low' && 'Your team has strong verification practices. Keep it up!'}
                    {risk === 'medium' && 'Your team has moderate verification gaps. Visual text assertions are missing.'}
                    {risk === 'high' && 'Your team has significant verification debt. AI-generated UI tests are incomplete.'}
                  </p>
                </div>
              </Glass>

              {/* Recommendations */}
              <Glass>
                <div className="p-8 space-y-4">
                  <h3 className="font-semibold text-white text-lg">What to do next</h3>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li className="flex gap-3">
                      <span className="text-accent">→</span>
                      <span>Start verifying visible text with <code className="text-xs bg-black/40 px-2 py-1 rounded">OCR assertions</code></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-accent">→</span>
                      <span>Use <a href="https://www.npmjs.com/package/@freetextfromimage/rendercheck" className="text-accent hover:underline">RenderCheck</a> for Playwright/Cypress tests</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-accent">→</span>
                      <span>Add visual assertions to your CI/CD pipeline</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-accent">→</span>
                      <span>Track verification debt like you track code coverage</span>
                    </li>
                  </ul>
                </div>
              </Glass>

              {/* Share Card */}
              <Glass>
                <div className="p-8 space-y-4">
                  <h3 className="font-semibold text-white">Share your score</h3>
                  <div className="bg-black/40 p-4 rounded border border-border/50 text-sm text-muted-foreground">
                    <p>My Verification Debt Score: {score}/50 ({getRiskLabel(risk)})</p>
                    <p className="text-xs mt-2">Assessed at: {new Date().toLocaleDateString()}</p>
                    <p className="text-xs text-accent mt-2 hover:underline cursor-pointer">
                      {SITE_URL}/verify-debt-score
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `My Verification Debt Score: ${score}/50 (${getRiskLabel(risk)})\n\n${SITE_URL}/verify-debt-score`
                      );
                    }}
                    className="w-full px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded transition-all"
                  >
                    Copy to share
                  </button>
                </div>
              </Glass>

              {/* CTA */}
              <Glass>
                <a href="/rendercheck" className="p-8 block hover:bg-white/5 transition-colors">
                  <h3 className="font-semibold text-white mb-2">Ready to reduce verification debt?</h3>
                  <p className="text-sm text-muted-foreground">
                    RenderCheck helps teams catch AI-generated UI bugs in their test suite. Try it with your Playwright or Cypress tests.
                  </p>
                </a>
              </Glass>

              {/* Reset */}
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers({});
                  setShowResult(false);
                }}
                className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-white border border-border/50 rounded transition-all"
              >
                Take again
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </AuroraBackground>
  );
}
