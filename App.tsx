import React, { useState, useEffect, useCallback } from 'react';
import { FileInput } from './components/FileInput';
import { ResultDisplay } from './components/ResultDisplay';
import { Toast } from './components/Toast';
import { ThemeToggle } from './components/ThemeToggle';
import { extractTextFromImage } from './services/geminiService';
import { ProgressBar } from './components/ProgressBar';

type Theme = 'light' | 'dark';

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);

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
    setHasProcessed(false);

    if (file) {
      setIsLoading(true);
      try {
        const result = await extractTextFromImage(file);
        setExtractedText(result);
      } catch (e: any) {
        setError(e.message || 'An unknown error occurred during text extraction.');
      } finally {
        setIsLoading(false);
        setHasProcessed(true);
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
      {error && <Toast message={error} onClose={() => setError(null)} />}
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
              Select an image file (PNG, JPG, WEBP) to extract text. The model will analyze the image and return any visible text.
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
                  <p className="text-muted-foreground">Analyzing your image...</p>
                  <ProgressBar />
                </div>
              ) : !hasProcessed ? (
                <p className="text-muted-foreground text-center">Extracted text will appear here once an image is processed.</p>
              ) : extractedText ? (
                <ResultDisplay text={extractedText} originalFilename={imageFile?.name || 'extracted-text.txt'} />
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