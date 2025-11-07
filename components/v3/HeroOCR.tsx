import React, { useState, useCallback, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AuroraBackground } from '../AuroraBackground';
import { GlassDropzone } from './GlassDropzone';
import { ThemeToggle } from '../ThemeToggle';
import { extractTextWithDetails } from '../../services/hybridService';

type Theme = 'light' | 'dark';

/**
 * Futuristic Hero + Tool UI (UX V3)
 * Feature-gated with VITE_UX_V2 === '1'
 * 
 * Premium features:
 * - Aurora background with animated gradients
 * - Glass-morphism cards with glow effects
 * - Trust chips (No signup, HTTPS, Fast)
 * - Centered hero layout
 * - Zero CLS: reserved heights
 * - < 200ms interactions
 */
export function HeroOCR() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme | null;
      if (storedTheme) return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldReduceMotion = useReducedMotion();

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Handle file upload
  const handleFileSelect = useCallback(async (file: File) => {
    setImageFile(file);
    setExtractedText('');
    setError(null);
    setIsProcessing(true);

    try {
      const result = await extractTextWithDetails(file, {
        minConfidence: 60,
        minTextLength: 3,
      });

      setExtractedText(result.text);
    } catch (err: any) {
      setError(err.message || 'Failed to extract text');
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <AuroraBackground>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
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

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero text */}
          <motion.div
            className="text-center mb-12 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Image → <span className="bg-gradient-to-r from-accent via-accent-2 to-primary bg-clip-text text-transparent">Text</span>, instantly.
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered OCR that respects your privacy. Extract text from images in seconds, no signup required.
            </p>
          </motion.div>

          {/* Glass card with Dropzone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative rounded-2xl bg-surface/40 backdrop-blur-xl border border-white/10 shadow-glow p-6 sm:p-8">
              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/10 via-transparent to-accent-2/10 pointer-events-none" />
              
              <div className="relative">
                <GlassDropzone
                  onFileSelect={handleFileSelect}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </motion.div>

          {/* Trust chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {[
              { icon: '🔒', text: 'No signup required' },
              { icon: '⚡', text: 'Lightning fast' },
              { icon: '🛡️', text: 'HTTPS secure' },
              { icon: '🎯', text: 'AI-powered' },
            ].map((chip, index) => (
              <motion.div
                key={chip.text}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface/60 backdrop-blur border border-border/50 text-sm text-muted-foreground"
              >
                <span className="text-base">{chip.icon}</span>
                <span className="font-medium">{chip.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Processing state */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 p-6 rounded-xl bg-surface/60 backdrop-blur border border-border/50"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Extracting text...</p>
              </div>
            </motion.div>
          )}

          {/* Result */}
          {extractedText && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-xl bg-surface/60 backdrop-blur border border-border/50 shadow-glow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Extracted Text</h3>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-background/50 p-4 rounded-lg border border-border/50 max-h-96 overflow-y-auto">
                {extractedText}
              </pre>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 rounded-xl bg-destructive/10 border border-destructive/50 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}
        </div>
      </main>
    </AuroraBackground>
  );
}
