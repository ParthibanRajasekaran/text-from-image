import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSEO } from '../../src/seo';
import { GlassDropzone } from '../v3/GlassDropzone';
import { GlassResultCard } from '../v3/GlassResultCard';
import { GlassProgressBar } from '../v3/GlassProgressBar';
import { HistoryDrawer } from '../v3/HistoryDrawer';
import { StatusBadge } from '../ui/StatusBadge';
import type { StatusVariant } from '../ui/StatusBadge';
import { ROUTES } from '../../router';
import { useOCRProcessor } from '../../hooks/useOCRProcessor';
import { useLocalHistory, type HistoryItem } from '../../hooks/useLocalHistory';
import { useLiveRegion } from '../../hooks/useLiveRegion';

/**
 * HomepageMinimalPremium: Minimal-premium RenderCheck homepage
 *
 * Design philosophy:
 * - 45-55% whitespace in hero and sections
 * - Headline via size, not weight
 * - Product thesis: "Verify what AI-generated UI actually shows"
 * - RenderCheck is the brand, browser OCR is a capability
 * - Premium through restraint, not decoration
 */
export function HomepageMinimalPremium() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://freetextfromimage.com';
  const canonicalAbsolute = new URL('/', SITE_URL).toString();

  useSEO({
    title: 'RenderCheck — Verify AI-Generated UI Output',
    description:
      'RenderCheck uses privacy-first OCR to test screenshots, documents, and rendered interfaces, helping teams catch visible text failures that DOM checks and code reviews can miss.',
    canonical: canonicalAbsolute,
    keywords: 'AI verification, OCR testing, Playwright, Cypress, rendered output verification',
  });

  // OCR state
  const {
    imageFile,
    extractedText,
    isProcessing,
    error,
    progressStage,
    progressRef,
    handleFileSelect,
    setExtractedText,
    setError,
    clear: handleClear,
  } = useOCRProcessor();
  const { history, removeFromHistory, clearHistory } = useLocalHistory();

  // UI state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const announceStatus = useLiveRegion('polite');

  useEffect(() => {
    if (isProcessing) {
      announceStatus('Processing image, please wait...');
    } else if (extractedText && !error) {
      const wordCount = extractedText.trim().split(/\s+/).filter(Boolean).length;
      announceStatus(`Text extraction complete. ${wordCount} words extracted.`);
    } else if (error) {
      announceStatus(`Error: ${error}`);
    } else {
      announceStatus('Ready for image upload');
    }
  }, [isProcessing, extractedText, error, announceStatus]);

  const handleRestore = useCallback((item: HistoryItem) => {
    if (extractedText !== item.text) {
      setExtractedText(item.text);
    }
  }, [extractedText, setExtractedText]);

  return (
    <div className="min-h-screen bg-background">
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={handleRestore}
        onClearHistory={clearHistory}
        onRemoveItem={removeFromHistory}
      />

      <div id="main-content" role="main" className="bg-background">
        {/* HERO SECTION */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-36 pb-20 sm:pb-28 lg:pb-36">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-block"
            >
              <StatusBadge variant="developer-beta" label="Developer Beta" size="md" pulse={true} />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
            >
              Verify what AI-generated UI actually shows
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              RenderCheck uses privacy-first OCR to test screenshots, documents, and rendered
              interfaces, helping teams catch visible text failures that DOM checks and code
              reviews can miss.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <a
                href={`#ocr-tool`}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold hover:shadow-elevation-2 transition-all duration-200"
              >
                Try RenderCheck
              </a>
              <a
                href={ROUTES.VERIFY_DEBT_SCORE}
                className="px-8 py-4 border-2 border-primary text-primary rounded-2xl font-semibold hover:bg-primary/5 transition-all duration-200"
              >
                Take Verification Debt Score
              </a>
            </motion.div>
          </div>
        </section>

        {/* PRODUCT PROOF SECTION */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-surface rounded-2xl border border-border/50 p-8 sm:p-12 space-y-8">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  How RenderCheck Works
                </p>
              </div>

              {/* Product Proof Panel */}
              <div className="space-y-6">
                {/* Row 1: Expected vs Detected */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Expected Visible Text
                    </p>
                    <code className="block bg-code-bg border border-code-border rounded p-4 text-code-text text-sm font-mono">
                      "Payment successful"
                    </code>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      OCR Detected
                    </p>
                    <code className="block bg-code-bg border border-code-border rounded p-4 text-code-text text-sm font-mono">
                      "Payment succesful"
                    </code>
                  </div>
                </div>

                {/* Result */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Result
                  </p>
                  <div className="bg-status-evidence-pending/10 border border-status-evidence-pending/30 rounded p-4">
                    <p className="font-semibold text-status-evidence-pending">FAIL</p>
                    <p className="text-sm text-foreground/80 mt-1">Expected text missing (typo in confirmation)</p>
                  </div>
                </div>

                {/* Suggested Test */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Suggested Playwright Test
                  </p>
                  <code className="block bg-code-bg border border-code-border rounded p-4 text-code-text text-sm font-mono overflow-x-auto">
                    {`await expect(page).toShowText('Payment successful');`}
                  </code>
                </div>

                <p className="text-xs text-muted-foreground italic">
                  Synthetic example for illustration only
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* WHY THIS MATTERS SECTION */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">Why This Matters</h2>
            <div className="space-y-4 text-lg text-foreground/90 leading-relaxed">
              <p>
                AI-powered coding tools generate UI fast. But your DOM tests pass while users
                see wrong text:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• Wrong currency ($ vs £)</li>
                <li>• Broken confirmations (missing order numbers)</li>
                <li>• Invisible text (white on white)</li>
                <li>• Truncated messages</li>
                <li>• Localisation failures (date formats, translated text)</li>
              </ul>
              <p className="pt-4">
                <strong>DOM tests pass. DOM is correct. Logic is correct. But visible text is wrong.</strong>
              </p>
              <p>
                Verification debt is the gap between what your code says and what users actually see.
              </p>
            </div>
          </motion.div>
        </section>

        {/* RENDERCHECK WORKFLOW SECTION */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">RenderCheck Workflow</h2>

            <div className="space-y-6">
              {[
                { num: '1', label: 'Import expect', desc: "From '@freetextfromimage/rendercheck/playwright'" },
                { num: '2', label: 'Assert what users see', desc: 'await expect(page).toShowText("Total: $14.00")' },
                { num: '3', label: 'OCR runs on your machine', desc: 'The screenshot is read locally. Nothing is uploaded' },
                { num: '4', label: 'Get a clear failure', desc: 'Expected vs read text, OCR confidence and a diff' },
              ].map((step) => (
                <div key={step.num} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                    {step.num}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold text-lg">{step.label}</h3>
                    <p className="text-foreground/80 text-sm mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* RENDERCHECK LABS SECTION */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">RenderCheck Labs</h2>
            <p className="text-lg text-foreground/90">
              Public experiments and educational tools for AI-era verification debt.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  title: 'Verification Debt Score',
                  desc: 'Self-assess your team\'s AI verification maturity',
                  href: ROUTES.VERIFY_DEBT_SCORE,
                },
                {
                  title: 'AI UI Bug Gallery',
                  desc: 'Learn from 50+ patterns of AI-generated UI failures',
                  href: ROUTES.AI_UI_BUG_GALLERY,
                },
                {
                  title: 'OCR Challenge Lab',
                  desc: 'Test your verification skills with weekly challenges',
                  href: ROUTES.OCR_CHALLENGE_LAB,
                },
              ].map((lab) => (
                <a
                  key={lab.title}
                  href={lab.href}
                  className="border border-border rounded-2xl p-6 hover:border-primary/50 hover:bg-muted/30 transition-all space-y-4 group"
                >
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {lab.title}
                  </h3>
                  <p className="text-sm text-foreground/80">{lab.desc}</p>
                </a>
              ))}
            </div>
          </motion.div>
        </section>

        {/* DEVELOPER PRIMITIVES SECTION */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">Developer Primitives</h2>

            <div className="space-y-4">
              {[
                { feature: 'Browser OCR', status: 'live' as const, desc: 'Free, no signup, runs locally' },
                { feature: 'RenderCheck SDK', status: 'developer-beta' as const, desc: 'Local-only Playwright/Cypress assertions. No API key' },
                { feature: 'CLI Tool', status: 'planned' as const, desc: 'Coming soon' },
              ].map((item) => (
                <div key={item.feature} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{item.feature}</h3>
                    <p className="text-sm text-foreground/80 mt-1">{item.desc}</p>
                  </div>
                  <StatusBadge variant={item.status === 'live' ? 'live' : item.status === 'developer-beta' ? 'developer-beta' : 'planned'} size="sm" pulse={false} />
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* PRIVACY ARCHITECTURE SECTION */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">Privacy Architecture</h2>

            <div className="space-y-4 text-lg text-foreground/90 leading-relaxed">
              <p>RenderCheck keeps your data safe through privacy-first design:</p>
              <ul className="space-y-3 ml-4">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    <strong>Browser OCR runs locally</strong> — Tesseract.js WASM, no upload
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    <strong>No upload from the SDK</strong> — screenshots are read in your test
                    process and never sent anywhere
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    <strong>No network calls</strong> — the engine and language data ship with the package
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    <strong>No signup for browser OCR</strong> — Use the tool without account
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </section>

        {/* OCR TOOL SECTION */}
        <section id="ocr-tool" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">Browser OCR Tool</h2>
            <p className="text-lg text-foreground/90">
              Try RenderCheck's browser-based OCR. No signup, entirely local.
            </p>

            {/* Dropzone */}
            <div className="bg-surface rounded-2xl border border-border p-8 sm:p-12">
              <GlassDropzone
                onFileSelect={handleFileSelect}
                isLoading={isProcessing}
                disabled={isProcessing}
                onError={(message) => setError(message)}
              />
            </div>

            {/* Progress */}
            {isProcessing && (
              <GlassProgressBar ref={progressRef} stage={progressStage} />
            )}

            {/* Results */}
            {extractedText && !isProcessing && (
              <GlassResultCard
                text={extractedText}
                filename={imageFile?.name.replace(/\.[^/.]+$/, '') + '-extracted.txt' || 'extracted-text.txt'}
              />
            )}

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
                {error}
              </div>
            )}
          </motion.div>
        </section>

        {/* PROOF, NOT CLAIMS SECTION */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-6 bg-surface border border-border rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold">Proof, Not Claims</h2>
            <p className="text-foreground/90">
              RenderCheck is in developer beta. Case studies are in preparation. This site claims
              only what is verifiable:
            </p>
            <ul className="space-y-2 text-sm text-foreground/80 ml-4">
              <li>• Browser OCR is live (try it above)</li>
              <li>• API is in developer beta (request access below)</li>
              <li>• npm package @freetextfromimage/rendercheck is published</li>
              <li>• Doctor4Africa case study in preparation (evidence pending)</li>
              <li>• 0 public npm installs (early access phase)</li>
              <li>• No fake GDPR, WCAG, enterprise, or pricing claims</li>
            </ul>
          </motion.div>
        </section>

        {/* ACCESS SECTION */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">Get Started</h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {([
                {
                  title: 'Browser OCR',
                  status: 'live' as const,
                  points: ['Free', 'No signup', 'Runs locally'],
                  cta: 'Try Above',
                  href: '#ocr-tool',
                },
                {
                  title: 'RenderCheck SDK',
                  status: 'developer-beta' as const,
                  points: ['Free', 'No API key or account', 'Runs inside your tests'],
                  cta: 'Read the docs',
                  href: ROUTES.DEVELOPERS,
                },
              ] as const).map((tier) => (
                <div key={tier.title} className="border border-border rounded-2xl p-6 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{tier.title}</h3>
                    <StatusBadge variant={tier.status} size="sm" pulse={false} />
                  </div>

                  <ul className="space-y-2 text-sm text-foreground/80">
                    {tier.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="text-primary">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={tier.href}
                    className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors text-sm"
                  >
                    {tier.cta}
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
