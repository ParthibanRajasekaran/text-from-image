import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AdGate } from '../../components/AdGate';
import { AdSlotLazy } from '../../components/AdSlotLazy';
import { FAQSchema, type FAQItem } from '../../components/FAQSchema';
import { GlassDropzone } from '../../components/v3/GlassDropzone';
import { GlassProgressBar, type ProgressStage, type GlassProgressBarHandle } from '../../components/v3/GlassProgressBar';
import { GlassResultCard } from '../../components/v3/GlassResultCard';
import { ThemeToggle } from '../../components/ThemeToggle';
import { AuroraBackground } from '../../components/AuroraBackground';
import { extractTextWithCustomPreprocessing } from '../../services/tesseractService';
import { trackFileAdded, trackExtractionStarted, trackExtractionCompleted, trackExtractionFailed, trackFAQOpened } from '../../lib/analytics';

/**
 * Page Builder Configuration
 * 
 * Complete config for generating SEO-optimized niche tool pages
 */
export interface NichePageConfig {
  /** URL slug (e.g., 'handwriting-to-text') */
  slug: string;
  
  /** Page title for SEO (include brand) */
  title: string;
  
  /** Meta description 150-160 chars */
  description: string;
  
  /** Hero section */
  hero: {
    heading: string;
    subheading: string;
  };
  
  /** How it works section (3 steps) */
  howItWorks: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  
  /** Supported inputs section */
  supported: {
    title: string;
    items: string[];
    caveats?: string[];
  };
  
  /** Privacy section */
  privacy: {
    title: string;
    description: string;
    features: string[];
  };
  
  /** Example images with captions */
  examples: Array<{
    src: string;
    alt: string;
    caption: string;
  }>;
  
  /** FAQ items for SEO */
  faq: FAQItem[];
  
  /** Related tools for cross-linking */
  relatedPages?: Array<{
    title: string;
    href: string;
    description: string;
  }>;
  
  /** Ad placement positions */
  adPositions: {
    afterExplainer1?: boolean; // After "How it works"
    afterExplainer2?: boolean; // After "Supported"
    afterExplainer3?: boolean; // After "Privacy"
    afterExamples?: boolean;
    afterResult?: boolean;
  };
  
  /** Tool-specific defaults */
  toolDefaults?: {
    preprocessing?: {
      grayscale?: boolean;
      contrast?: number;
      brightness?: number;
      sharpen?: boolean;
      binarize?: boolean;
      denoise?: boolean;
      upscale?: number;
    };
    postProcessing?: {
      wordJoiner?: boolean;
      trimWhitespace?: boolean;
    };
  };
}

/**
 * Calculate word count from visible text
 * Used for AdGate content requirements
 */
export function countWords(text: string): number {
  return text
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Page Builder: Generate SEO-optimized niche tool pages
 * 
 * Features:
 * - AdGate-compliant ad placement (only after content)
 * - FAQ JSON-LD for rich snippets
 * - Respects prefers-reduced-motion
 * - Zero layout shifts (reserved heights)
 * - Word count calculation for publisher content
 * 
 * @param config - Complete page configuration
 */
export function makeNichePage(config: NichePageConfig) {
  return function NichePage() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (stored) return stored;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      }
      return 'light';
    });

    const [hasResult, setHasResult] = useState(false);
    const [extractedText, setExtractedText] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressStage, setProgressStage] = useState<ProgressStage>('idle');
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const progressRef = useRef<GlassProgressBarHandle>(null);
    const shouldReduceMotion = useReducedMotion();

    // Theme toggle
    const toggleTheme = useCallback(() => {
      setTheme((prev) => {
        const next = prev === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        localStorage.setItem('theme', next);
        return next;
      });
    }, []);

    // Calculate word count from all explainer sections
    const explainerWordCount = useMemo(() => {
      let totalText = '';
      
      // Hero
      totalText += config.hero.heading + ' ' + config.hero.subheading + ' ';
      
      // How it works
      config.howItWorks.forEach((step) => {
        totalText += step.title + ' ' + step.description + ' ';
      });
      
      // Supported
      totalText += config.supported.title + ' ';
      totalText += config.supported.items.join(' ') + ' ';
      if (config.supported.caveats) {
        totalText += config.supported.caveats.join(' ') + ' ';
      }
      
      // Privacy
      totalText += config.privacy.title + ' ' + config.privacy.description + ' ';
      totalText += config.privacy.features.join(' ') + ' ';
      
      // Examples
      config.examples.forEach((ex) => {
        totalText += ex.caption + ' ';
      });
      
      // FAQ
      config.faq.forEach((item) => {
        totalText += item.question + ' ' + item.answer + ' ';
      });
      
      return countWords(totalText);
    }, [config]);

    // Handle file upload with OCR processing
    const handleFileSelect = useCallback(async (file: File) => {
      // Track file addition
      trackFileAdded({
        fileType: file.type,
        fileSize: file.size,
      });

      setImageFile(file);
      setError(null);
      setIsProcessing(true);
      setProgressStage('upload');
      setHasResult(false);
      
      try {
        // Stage 1: Upload
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        // Stage 2: OCR with preprocessing
        setProgressStage('ocr');
        
        // Track extraction start
        const startTime = Date.now();
        trackExtractionStarted();
        
        // Apply preprocessing options from config
        const preprocessOptions = config.toolDefaults?.preprocessing || {
          grayscale: true,
          contrast: 1.2,
          binarize: true,
          denoise: true,
        };
        
        const result = await extractTextWithCustomPreprocessing(
          file,
          preprocessOptions,
          (progress) => {
            // Progress callback
            console.log(`OCR Progress: ${progress}%`);
          }
        );
        
        let finalText = result.text;
        
        // Apply post-processing
        if (config.toolDefaults?.postProcessing) {
          if (config.toolDefaults.postProcessing.wordJoiner) {
            // Join words that were incorrectly split
            finalText = finalText.replace(/(\w)-\s+(\w)/g, '$1$2');
          }
          if (config.toolDefaults.postProcessing.trimWhitespace) {
            finalText = finalText.trim();
          }
        }
        
        // Stage 3: Render
        setProgressStage('render');
        await new Promise((resolve) => setTimeout(resolve, 200));
        
        // Complete
        setProgressStage('complete');
        setExtractedText(finalText);
        setHasResult(true);
        
        // Track successful completion
        trackExtractionCompleted({
          duration: Date.now() - startTime,
          wordCount: finalText.split(/\s+/).filter(Boolean).length,
          confidence: result.confidence,
        });
        
        // Announce completion
        progressRef.current?.announce('Text extraction completed successfully');
      } catch (err: any) {
        // Track extraction failure
        trackExtractionFailed({
          error: err.message || 'Unknown error',
        });

        setError(err.message || 'Failed to process image');
        setProgressStage('idle');
        console.error('OCR Error:', err);
      } finally {
        setIsProcessing(false);
      }
    }, [config.toolDefaults]);

    // Set initial theme
    React.useEffect(() => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    return (
      <>
        {/* FAQ Schema for SEO */}
        <FAQSchema faqs={config.faq} />

        <AuroraBackground>
          {/* Skip to main content */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-white"
          >
            Skip to main content
          </a>

          {/* Header */}
          <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-xl font-bold bg-gradient-to-r from-accent via-primary to-accent-2 bg-clip-text text-transparent">
                    TextFromImage
                  </h1>
                </motion.div>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              </div>
            </div>
          </header>

          <section id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20" aria-label="Tool content">
            <div className="max-w-4xl mx-auto space-y-16">
              {/* Hero Section */}
              <motion.section
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-6"
              >
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  {config.hero.heading}
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                  {config.hero.subheading}
                </p>
              </motion.section>

              {/* Tool/Dropzone Section */}
              <motion.section
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="relative rounded-2xl bg-surface/40 backdrop-blur-xl border border-white/10 shadow-glow p-6 sm:p-8">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/10 via-transparent to-accent-2/10 pointer-events-none" />
                  <div className="relative">
                    <GlassDropzone
                      onFileSelect={handleFileSelect}
                      isLoading={isProcessing}
                      disabled={isProcessing}
                      onError={(msg) => setError(msg)}
                    />
                  </div>
                </div>
              </motion.section>

              {/* Progress Bar */}
              {isProcessing && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GlassProgressBar ref={progressRef} stage={progressStage} />
                </motion.div>
              )}

              {/* Result Display */}
              {hasResult && extractedText && !isProcessing && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ minHeight: '300px' }}
                >
                  <GlassResultCard
                    text={extractedText}
                    filename={imageFile?.name.replace(/\.[^/.]+$/, '') + '-extracted.txt' || 'extracted-text.txt'}
                  />
                </motion.div>
              )}

              {/* Ad Slot - After Result (if enabled and result exists) */}
              {config.adPositions.afterResult && hasResult && (
                <AdGate
                  content={{
                    wordCount: explainerWordCount,
                    hasResult: true,
                    hasExplainers: true,
                  }}
                  pathname={`/${config.slug}`}
                >
                  <AdSlotLazy slot="mid" />
                </AdGate>
              )}

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-destructive/10 border border-destructive/50 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Explainer 1: How It Works */}
              <section className="space-y-8">
                <h3 className="text-3xl font-bold text-foreground">How It Works</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  {config.howItWorks.map((step, idx) => (
                    <motion.div
                      key={step.step}
                      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative p-6 rounded-xl bg-surface/60 backdrop-blur border border-border/50 space-y-3"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 text-accent font-bold text-xl">
                        {step.step}
                      </div>
                      <h4 className="text-xl font-semibold text-foreground">{step.title}</h4>
                      <p className="text-muted-foreground">{step.description}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Ad Slot - After Explainer 1 */}
              {config.adPositions.afterExplainer1 && (
                <AdGate
                  content={{
                    wordCount: explainerWordCount,
                    hasResult: hasResult,
                    hasExplainers: true,
                  }}
                  pathname={`/${config.slug}`}
                >
                  <AdSlotLazy slot="top" />
                </AdGate>
              )}

              {/* Explainer 2: Supported Inputs */}
              <section className="space-y-6">
                <h3 className="text-3xl font-bold text-foreground">{config.supported.title}</h3>
                <div className="p-6 rounded-xl bg-surface/60 backdrop-blur border border-border/50 space-y-4">
                  <ul className="space-y-3">
                    {config.supported.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-foreground">
                        <span className="text-accent mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {config.supported.caveats && config.supported.caveats.length > 0 && (
                    <div className="pt-4 border-t border-border/50 space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Important Notes:</p>
                      <ul className="space-y-2">
                        {config.supported.caveats.map((caveat, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{caveat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              {/* Ad Slot - After Explainer 2 */}
              {config.adPositions.afterExplainer2 && (
                <AdGate
                  content={{
                    wordCount: explainerWordCount,
                    hasResult: hasResult,
                    hasExplainers: true,
                  }}
                  pathname={`/${config.slug}`}
                >
                  <AdSlotLazy slot="mid" />
                </AdGate>
              )}

              {/* Explainer 3: Privacy */}
              <section className="space-y-6">
                <h3 className="text-3xl font-bold text-foreground">{config.privacy.title}</h3>
                <div className="p-6 rounded-xl bg-surface/60 backdrop-blur border border-border/50 space-y-4">
                  <p className="text-foreground">{config.privacy.description}</p>
                  <ul className="space-y-3">
                    {config.privacy.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                        <span className="text-accent mt-1">🔒</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Ad Slot - After Explainer 3 */}
              {config.adPositions.afterExplainer3 && (
                <AdGate
                  content={{
                    wordCount: explainerWordCount,
                    hasResult: hasResult,
                    hasExplainers: true,
                  }}
                  pathname={`/${config.slug}`}
                >
                  <AdSlotLazy slot="bottom" />
                </AdGate>
              )}

              {/* Examples Gallery */}
              {config.examples.length > 0 && (
                <section className="space-y-6">
                  <h3 className="text-3xl font-bold text-foreground">Example Use Cases</h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {config.examples.map((example, idx) => (
                      <motion.div
                        key={idx}
                        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative rounded-xl overflow-hidden border border-border/50 bg-surface/60 backdrop-blur"
                      >
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <img
                            src={example.src}
                            alt={example.alt}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground">{example.caption}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Ad Slot - After Examples */}
              {config.adPositions.afterExamples && (
                <AdGate
                  content={{
                    wordCount: explainerWordCount,
                    hasResult: hasResult,
                    hasExplainers: true,
                  }}
                  pathname={`/${config.slug}`}
                >
                  <AdSlotLazy slot="bottom" />
                </AdGate>
              )}

              {/* FAQ Section */}
              {config.faq.length > 0 && (
                <section className="space-y-6">
                  <h3 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {config.faq.map((item, idx) => (
                      <details
                        key={idx}
                        className="group p-6 rounded-xl bg-surface/60 backdrop-blur border border-border/50 cursor-pointer"
                        onToggle={(e) => {
                          if ((e.target as HTMLDetailsElement).open) {
                            trackFAQOpened({
                              question: item.question,
                            });
                          }
                        }}
                      >
                        <summary className="font-semibold text-foreground list-none flex items-center justify-between">
                          <span>{item.question}</span>
                          <span className="text-accent transition-transform group-open:rotate-180">▼</span>
                        </summary>
                        <p className="mt-4 text-muted-foreground">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Tools Section */}
              {config.relatedPages && config.relatedPages.length > 0 && (
                <section className="space-y-6">
                  <h3 className="text-3xl font-bold text-foreground">Related Tools</h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {config.relatedPages.map((page, idx) => (
                      <motion.div
                        key={idx}
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <a
                          href={page.href}
                          className="block group p-6 rounded-xl bg-surface/60 backdrop-blur border border-border/50 hover:border-accent/50 hover:bg-surface/80 transition-all duration-200 h-full"
                        >
                          <h4 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                            {page.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">{page.description}</p>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </section>
        </AuroraBackground>
      </>
    );
  };
}
