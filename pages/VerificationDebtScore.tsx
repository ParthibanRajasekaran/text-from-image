import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '../src/seo';
import { AuroraBackground } from '../components/AuroraBackground';
import { Glass } from '../components/ui/Glass';
import { trackToolStarted, trackToolCompleted } from '../lib/analytics';
import { DebtRadar } from '../components/DebtRadar';
import {
  QUESTIONS,
  bandOf,
  biggestRisk,
  decodeAnswers,
  encodeAnswers,
  score100,
  type RiskBand,
} from '../src/core/debt/model';
import { BAND_LABEL, renderShareImage } from '../src/core/debt/shareImage';

function getScoreBandColor(band: RiskBand): string {
  switch (band) {
    case 'low':
      return 'bg-green-500/20 border-green-500/30 text-green-800 dark:text-green-300';
    case 'moderate':
      return 'bg-blue-500/20 border-blue-500/30 text-blue-800 dark:text-blue-300';
    case 'high':
      return 'bg-amber-500/20 border-amber-500/30 text-amber-800 dark:text-amber-300';
    case 'critical':
      return 'bg-red-500/20 border-red-500/30 text-red-800 dark:text-red-300';
  }
}

function getScoreBandLabel(band: RiskBand): string {
  switch (band) {
    case 'low':
      return '✓ Low (0-25)';
    case 'moderate':
      return '~ Moderate (26-50)';
    case 'high':
      return '⚠ High (51-75)';
    case 'critical':
      return '✗ Critical (76-100)';
  }
}

function getScoreBandAdvice(band: RiskBand): string {
  switch (band) {
    case 'low':
      return 'Your workflow is verification-aware. Continue focusing on visual assertions alongside DOM tests.';
    case 'moderate':
      return 'AI delivery is creating gaps. Start with RenderCheck in one Playwright test to catch visible text bugs.';
    case 'high':
      return 'Rendered output is largely unverified. Multiple failure points exist. Prioritize visual assertions in CI.';
    case 'critical':
      return 'AI-generated UI is shipping without rendered-output checks. This is a high-risk workflow. Implement OCR assertions immediately.';
  }
}

const shareButton =
  'w-full min-h-[44px] px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded transition-all';

export default function VerificationDebtScore() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/verify-debt-score', SITE_URL).toString();

  // A shared link (#r=...) restores a finished result.
  const restored = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const m = /^#r=(.+)$/.exec(window.location.hash);
    return m ? decodeAnswers(m[1]) : null;
  }, []);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<number | undefined>>(restored ?? []);
  const [showResult, setShowResult] = useState(restored !== null);
  const [notice, setNotice] = useState('');

  useSEO({
    title: 'Verification Debt Score — AI UI Testing',
    description: 'Assess your team\'s AI-generated UI verification maturity. Calculate your verification debt score and get RenderCheck recommendations.',
    canonical: canonicalAbsolute,
  });

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const finalBand = bandOf(score100(newAnswers));
      trackToolStarted({ toolName: 'verification-debt-score' });
      trackToolCompleted({ toolName: 'verification-debt-score', riskLevel: finalBand, duration: 0 });
      setShowResult(true);
      try {
        window.history.replaceState(null, '', `#r=${encodeAnswers(newAnswers)}`);
      } catch {
        /* the link is a convenience */
      }
    }
  };

  const score = score100(answers);
  const band = bandOf(score);
  const risk = biggestRisk(answers);
  const riskText = risk ? risk.label : 'none, keep visual assertions strong';
  const shareLink = `${SITE_URL}/verify-debt-score#r=${encodeAnswers(answers)}`;

  const say = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  };
  const copyText = async (text: string, done: string) => {
    try {
      await navigator.clipboard.writeText(text);
      say(done);
    } catch {
      say('Copy is not available in this browser.');
    }
  };
  const downloadImage = async () => {
    try {
      const blob = await renderShareImage(answers, new URL(SITE_URL).host);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verification-debt-score-${score}.png`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      say('Image downloaded.');
    } catch {
      say('Could not create the image.');
    }
  };
  const copyImage = async () => {
    try {
      const blob = await renderShareImage(answers, new URL(SITE_URL).host);
      if (!navigator.clipboard || typeof ClipboardItem === 'undefined') throw new Error('unsupported');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      say('Image copied.');
    } catch {
      say('Copying images is not supported here. Use Download image.');
    }
  };
  const progress = ((currentQuestion + (showResult ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <AuroraBackground>
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

              {/* Live radar: the shape grows with every answer */}
              <DebtRadar answers={answers} className="max-w-sm mx-auto" />

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
                        onClick={() => handleAnswer(idx)}
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
                <div className={`p-8 space-y-4 border-l-4 ${getScoreBandColor(band)}`}>
                  <div className="text-5xl font-bold">{score}<span className="text-2xl text-muted-foreground"> / 100</span></div>
                  <div className="text-2xl font-semibold">{getScoreBandLabel(band)}</div>
                  <p className="text-sm text-muted-foreground">
                    {getScoreBandAdvice(band)}
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
                      <span>Start verifying visible text with <code className="text-xs bg-muted text-foreground px-2 py-1 rounded">OCR assertions</code></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-accent">→</span>
                      <span>Use <a href="https://www.npmjs.com/package/@freetextfromimage/rendercheck" className="text-accent underline">RenderCheck</a> for Playwright/Cypress tests</span>
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

              {/* Radar of the result */}
              <Glass>
                <div className="p-8">
                  <DebtRadar answers={answers} className="max-w-sm mx-auto" />
                </div>
              </Glass>

              {/* Share Card */}
              <Glass>
                <div className="p-8 space-y-4">
                  <h3 className="font-semibold text-white">Share your score</h3>
                  <div className="bg-muted/60 p-4 rounded border border-border/50 text-sm text-foreground">
                    <p>My Verification Debt Score: {BAND_LABEL[band].toLowerCase()} ({score}/100)</p>
                    <p className="text-xs mt-2">Biggest gap: {riskText}</p>
                    <p className="text-xs mt-2 break-all">{shareLink}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button type="button" onClick={downloadImage} className={shareButton}>Download image</button>
                    <button type="button" onClick={copyImage} className={shareButton}>Copy image</button>
                    <button type="button" onClick={() => copyText(shareLink, 'Link copied.')} className={shareButton}>Copy link</button>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          `My Verification Debt Score: ${BAND_LABEL[band].toLowerCase()} (${score}/100)\nBiggest gap: ${riskText}\n\n${shareLink}`,
                          'Result copied.'
                        )
                      }
                      className={shareButton}
                    >
                      Copy result
                    </button>
                  </div>
                  <p role="status" aria-live="polite" className="text-sm text-muted-foreground min-h-[1.25rem]">{notice}</p>
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
                  setAnswers([]);
                  setShowResult(false);
                  try {
                    window.history.replaceState(null, '', window.location.pathname);
                  } catch {
                    /* ignore */
                  }
                }}
                className="w-full min-h-[44px] px-4 py-2 text-sm text-muted-foreground hover:text-white border border-border/50 rounded transition-all"
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
