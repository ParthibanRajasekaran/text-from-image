import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSEO } from '../../src/seo';
import { GlassDropzone } from '../v3/GlassDropzone';
import { GlassResultCard } from '../v3/GlassResultCard';
import { GlassProgressBar } from '../v3/GlassProgressBar';
import { HistoryDrawer } from '../v3/HistoryDrawer';
import { reveal } from '../ui/reveal';
import { HeroStage } from './HeroStage';
import { LegibilitySlider } from './LegibilitySlider';
import { BentoGrid, FactsStrip, SectionHeading, WorkflowSteps } from './HomeSections';
import { useOCRProcessor } from '../../hooks/useOCRProcessor';
import { useLocalHistory, type HistoryItem } from '../../hooks/useLocalHistory';
import { useLiveRegion } from '../../hooks/useLiveRegion';

/**
 * RenderCheck homepage.
 * - Hero: product thesis plus an animated, clearly synthetic demo of a failed text assertion
 * - Facts strip and bento grid: only statements the repo can prove (see scripts/check-claims.mjs)
 * - Browser OCR tool stays on the page so visitors can try the product without leaving
 */
export function HomepageMinimalPremium() {
  const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://getrendercheck.com';
  const canonicalAbsolute = new URL('/', SITE_URL).toString();

  useSEO({
    title: 'RenderCheck: Verify AI-Generated UI Output',
    description:
      'RenderCheck uses privacy-first OCR to test screenshots, documents, and rendered interfaces, helping teams catch visible text failures that DOM checks and code reviews can miss.',
    canonical: canonicalAbsolute,
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
        <HeroStage />
        <FactsStrip />
        <LegibilitySlider />
        <BentoGrid />
        <WorkflowSteps />

        {/* BROWSER OCR TOOL */}
        <section id="ocr-tool" className="container mx-auto scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Try it now"
            title="Browser OCR, no signup"
            lead="Drop a screenshot. It is read by a WASM engine in your browser and never uploaded."
          />
          <motion.div {...reveal} className="mx-auto max-w-3xl space-y-8">
            <div className="rounded-2xl border border-border/70 bg-surface/70 p-6 shadow-elevation-3 backdrop-blur sm:p-10">
              <GlassDropzone
                onFileSelect={handleFileSelect}
                isLoading={isProcessing}
                disabled={isProcessing}
                onError={(message) => setError(message)}
              />
            </div>

            {isProcessing && <GlassProgressBar ref={progressRef} stage={progressStage} />}

            {extractedText && !isProcessing && (
              <GlassResultCard
                text={extractedText}
                filename={imageFile?.name.replace(/\.[^/.]+$/, '') + '-extracted.txt' || 'extracted-text.txt'}
              />
            )}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}
          </motion.div>
        </section>

        {/* HONEST STATUS + CTA */}
        <section className="container mx-auto px-4 pb-28 sm:px-6 lg:px-8">
          <motion.div
            {...reveal}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border/70 bg-surface/80 p-8 text-center backdrop-blur sm:p-14"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-2/10"
            />
            <div className="relative space-y-6">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Early, open and honest about it
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                RenderCheck is in developer beta. The npm package is published, the browser tool is live, and
                there are no case studies yet. This site claims only what the repository can prove.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <a
                  href="/developers"
                  className="rounded-2xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-glow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Read the docs
                </a>
                <a
                  href="https://github.com/ParthibanRajasekaran/text-from-image"
                  className="rounded-2xl border border-border px-8 py-4 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60"
                >
                  Star on GitHub
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
