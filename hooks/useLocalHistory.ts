import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
  id: string;
  filename: string;
  text: string;
  timestamp: number;
  preview?: string; // Base64 thumbnail
  method?: string;
  confidence?: number;
}

const STORAGE_KEY = 'ocr_history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Generate a UUID v4-compatible string with fallback for older browsers
 * Uses crypto.randomUUID() if available, otherwise uses crypto.getRandomValues()
 * Falls back to Math.random() only if crypto is completely unavailable
 */
function generateUUID(): string {
  // Use native implementation if available (modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback using crypto.getRandomValues (Safari 6.1+, widely supported)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    // Generate UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    
    // Set version (4) and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
    
    // Convert to hex string with dashes
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  
  // Final fallback for very old browsers (non-cryptographic)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Custom hook for managing local OCR history
 * Stores results in localStorage with size limits
 */
export function useLocalHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save history:', error);
      }
    }
  }, [history, isLoading]);

  const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: generateUUID(),
      timestamp: Date.now(),
    };

    setHistory(prev => {
      const updated = [newItem, ...prev];
      // Keep only the most recent items
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });

    return newItem.id;
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, []);

  const getHistoryItem = useCallback((id: string): HistoryItem | undefined => {
    return history.find(item => item.id === id);
  }, [history]);

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryItem,
  };
}
