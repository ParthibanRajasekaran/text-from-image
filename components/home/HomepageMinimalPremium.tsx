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
import { ProofLedger } from './ProofLedger';
import { CopyButton, ScrollScanLine, SectionDivider } from './ScrollKit';
import { BentoGrid, FactsStrip, SectionHeading, TrustBadges, WorkflowSteps } from './HomeSections';
import { useOCRProcessor } from '../../hooks/useOCRProcessor';
import { useLocalHistory, type HistoryItem } from '../../hooks/useLocalHistory';
import { useLiveRegion } from '../../hooks/useLiveRegion';

/**
 * RenderCheck homepage.
 * - Hero: product thesis plus an animated, clearly synthetic demo of a failed text assertion
 * - Facts strip and bento grid: only statements the repo can prove (see scripts/check-claims.mjs)
 * - Browser OCR tool stays on the page so visitors can try the product without leaving
 */
const CI_YAML = `steps:
  - run: npm ci
  - run: npx playwright install --with-deps chromium
  - run: npx playwright test
  - uses: ParthibanRajasekaran/text-from-image/packages/rendercheck/action@<ref>
    if: always()`;

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
        <ScrollScanLine />
        <HeroStage />
        <FactsStrip />
        <TrustBadges />
        <LegibilitySlider />
        <SectionDivider />
        <ProofLedger />
        <BentoGrid />
        <SectionDivider />
        <WorkflowSteps />

        {/* BROWSER OCR TOOL */}
        <section id="ocr-tool" className="container mx-auto scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Try it now"
            title="Browser OCR, no signup"
            lead="Drop a screenshot. It is read by a WASM engine in your browser and never uploaded."
          />
          <motion.div {...reveal} className="mx-auto max-w-3xl space-y-8">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
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

        {/* CI */}
        <section aria-labelledby="ci-heading" className="container mx-auto px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 id="ci-heading" className="font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Runs in the CI you already have
            </h2>
            <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-border bg-border text-sm md:grid-cols-3">
              {[
                ['No service', 'No account, API key or upload. The check runs inside your test process.'],
                ['No download at test time', 'The OCR engine and English data are installed with npm, so a run makes no network request for them.'],
                ['Annotates the pull request', 'The GitHub Action marks the failing test line and attaches the screenshot with the text outlined.'],
              ].map(([h, b]) => (
                <li key={h} className="bg-surface p-6">
                  <p className="font-medium">{h}</p>
                  <p className="mt-2 text-muted-foreground">{b}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <p className="font-mono text-xs text-muted-foreground">.github/workflows/e2e.yml</p>
                <CopyButton text={CI_YAML} label="Copy workflow steps" />
              </div>
              <pre tabIndex={0} aria-label="GitHub Actions steps" className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">{CI_YAML}</pre>
            </div>
          </div>
        </section>

        {/* AUTHOR */}
        <section aria-labelledby="author-heading" className="container mx-auto px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[auto_1fr] md:items-center">
            <picture>
              <source type="image/webp" srcSet="/images/parthiban-480.webp 480w, /images/parthiban-960.webp 960w" sizes="144px" />
              <img
                src="/images/parthiban-480.jpg"
                alt="Parthiban Rajasekaran, author of RenderCheck"
                width={144}
                height={180}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] h-auto w-36 rounded-xl border border-border object-cover"
              />
            </picture>
            <div className="space-y-3">
              <h2 id="author-heading" className="font-display text-3xl font-semibold tracking-[-0.04em]">
                Built by Parthiban Rajasekaran
              </h2>
              <p className="text-muted-foreground">
                I designed and built RenderCheck. I am a Principal Dev Engineer working on reliability and
                AI-assisted delivery in regulated financial services, and I write and speak on the same:{' '}
                <a href="https://leaddev.com/community/parthiban-rajasekaran" target="_blank" rel="noopener noreferrer">LeadDev</a>,{' '}
                <a href="https://2026.platformcon.com/speakers/parthiban-rajasekaran" target="_blank" rel="noopener noreferrer">PlatformCon 2026</a>.
                RenderCheck is an independent project, not affiliated with my employer.
              </p>
              <p className="text-muted-foreground">
                The package is published with provenance on npm and listed in the MCP Registry, and the benchmark
                can be re-run. The evidence is listed on the About page.
              </p>
              <a href="/about" className="inline-flex min-h-11 items-center underline">
                About the author and track record
              </a>
            </div>
          </div>
        </section>

        {/* HONEST STATUS + CTA */}
        <section className="container mx-auto px-4 pb-28 sm:px-6 lg:px-8">
          <motion.div
            {...reveal}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface p-8 text-center sm:p-16"
          >
            <div className="relative space-y-6">
              <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Developer beta
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                The npm package is published and the browser tool is live. The next milestone is the first public
                write-up from a team running it in CI. This site claims only what the repository can prove.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <a
                  href="/developers"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-[15px] font-medium text-primary-foreground transition duration-150 hover:opacity-85 active:scale-[0.98]"
                >
                  Read the docs
                </a>
                <a
                  href="https://github.com/ParthibanRajasekaran/text-from-image"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-[15px] font-medium transition duration-150 hover:bg-foreground/[0.04] active:scale-[0.98]"
                >
                  Star on GitHub
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Using it in a project?{' '}
                <a href="/contact">Get in touch</a>{' '}
                about a case study.
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
