import React, { useState, useEffect, useCallback } from 'react';
import { FileInput } from './components/FileInput';
import { ResultDisplay } from './components/ResultDisplay';
import { Toast } from './components/Toast';
import { ThemeToggle } from './components/ThemeToggle';
import { extractTextWithDetails } from './services/hybridService';
import { ProgressBar } from './components/ProgressBar';
import { OCRError } from './utils/errorHandling';

type Theme = 'light' | 'dark';

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSuggestions, setErrorSuggestions] = useState<string[]>([]);
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [methodUsed, setMethodUsed] = useState<string>('');

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleFileChange = useCallback(async (file: File | null) => {
    setImageFile(file);
    setExtractedText('');
    setError(null);
    setErrorSuggestions([]);
    setHasProcessed(false);
    setProcessingStatus('');
    setMethodUsed('');

    if (file) {
      setIsLoading(true);
      try {
        // Use hybrid service with automatic fallback
        const result = await extractTextWithDetails(file, {
          minConfidence: 60, // If Tesseract confidence < 60%, fallback to Transformers
          minTextLength: 3,  // Need at least 3 characters
          onProgress: (status, progress, method) => {
            setProcessingStatus(`${status} (${Math.round(progress)}%)`);
          },
        });

        setExtractedText(result.text);
        
        // Show which method was used
        const methodLabel = result.method === 'tesseract' ? 'Tesseract OCR' : 'AI Model (Transformers)';
        const fallbackNote = result.fallbackUsed ? ' (fallback)' : '';
        setMethodUsed(`Extracted using ${methodLabel}${fallbackNote}`);
        
        if (result.confidence) {
          setMethodUsed(prev => `${prev} - Confidence: ${Math.round(result.confidence!)}%`);
        }
      } catch (e: any) {
        // Handle OCRError with user-friendly messages and suggestions
        if (e instanceof OCRError) {
          setError(e.userMessage);
          setErrorSuggestions(e.suggestions);
          console.error('OCR Error:', {
            code: e.code,
            message: e.userMessage,
            technical: e.technicalDetails,
            recoverable: e.recoverable
          });
        } else {
          setError(e.message || 'An unknown error occurred during text extraction.');
          console.error('Unexpected error:', e);
        }
      } finally {
        setIsLoading(false);
        setHasProcessed(true);
        setProcessingStatus('');
      }
    }
  }, []);

  useEffect(() => {
    if (!imageFile) {
        setPreviewUrl(null);
        return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      {error && (
        <Toast 
          message={error} 
          onClose={() => {
            setError(null);
            setErrorSuggestions([]);
          }} 
        />
      )}
      {errorSuggestions.length > 0 && error && (
        <div className="fixed top-20 right-4 bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm z-50">
          <h3 className="font-semibold text-sm mb-2">💡 Suggestions:</h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            {errorSuggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      <header className="py-4 px-6 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="container mx-auto grid grid-cols-3 items-center">
          <div /> {/* Empty cell for spacing */}
          <h1 className="text-2xl font-bold text-primary text-center">Extract Text from Image for Free</h1>
          <div className="flex justify-end">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-center">1. Upload Image</h2>
            <p className="text-muted-foreground">
              Select an image file (PNG, JPG, WEBP) to extract text. We'll automatically use the best method for your image.
            </p>
            <FileInput 
              onFileChange={handleFileChange} 
              previewUrl={previewUrl}
              imageFile={imageFile}
              isLoading={isLoading}
            />
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-center">2. Extracted Text</h2>
            <div className="min-h-[400px] bg-card p-4 rounded-lg border border-border flex justify-center items-center">
              {isLoading ? (
                <div className="w-full max-w-sm flex flex-col items-center gap-4">
                  <p className="text-muted-foreground">{processingStatus || 'Analyzing your image...'}</p>
                  <ProgressBar />
                </div>
              ) : !hasProcessed ? (
                <p className="text-muted-foreground text-center">Extracted text will appear here once an image is processed.</p>
              ) : extractedText ? (
                <div className="w-full flex flex-col gap-4">
                  <ResultDisplay text={extractedText} originalFilename={imageFile?.name || 'extracted-text.txt'} />
                  {methodUsed && (
                    <p className="text-xs text-muted-foreground text-center italic">
                      {methodUsed}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">No text could be extracted from the image.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;