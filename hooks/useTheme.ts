import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

/**
 * Theme management hook
 * Handles:
 * - Theme state initialization (system preference fallback)
 * - localStorage persistence
 * - DOM class toggling for CSS
 * 
 * Extracted from HeroOCR.tsx to follow SRP
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme | null;
      if (storedTheme) return storedTheme;
      
      // Respect system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Persist to localStorage and update DOM
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}
