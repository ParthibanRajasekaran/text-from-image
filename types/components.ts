/**
 * Unified component prop interfaces
 * 
 * Centralizes interfaces for all result display components
 * Ensures Liskov Substitution compliance (components are interchangeable)
 */

import type React from 'react';

/**
 * Universal result display component props
 * All result components (ResultDisplay, GlassResultCard, etc.) should implement this
 * 
 * Enables:
 * - Easy swapping between v1/v2/v3 components
 * - Consistent API across versions
 * - Type-safe component composition
 */
export interface ResultComponentProps {
  /** Extracted text to display */
  text: string;
  
  /** Optional filename for download (defaults to 'extracted-text.txt') */
  filename?: string;
  
  /** Optional callback when user clicks copy */
  onCopy?: () => void;
  
  /** Optional callback when user clicks download */
  onDownload?: () => void;
  
  /** Optional CSS class for styling */
  className?: string;
}

/**
 * Dropzone component props interface
 * Unified for GlassDropzone, Dropzone, FileInput
 */
export interface DropzoneComponentProps {
  /** Callback fired when user selects file(s) */
  onFileSelect: (file: File) => void;
  
  /** Callback fired when user selects multiple files */
  onFileSelectMultiple?: (files: File[]) => void;
  
  /** Whether component is currently processing */
  isLoading?: boolean;
  
  /** Whether component is disabled */
  disabled?: boolean;
  
  /** MIME types to accept */
  accept?: string;
  
  /** Maximum number of files allowed */
  maxFiles?: number;
  
  /** Callback for error messages */
  onError?: (message: string) => void;
  
  /** Optional CSS class */
  className?: string;
}

/**
 * Progress bar component props
 * Unified for ProgressBar, ProgressBarV2, GlassProgressBar
 */
export interface ProgressBarComponentProps {
  /** Current processing stage */
  stage: 'idle' | 'upload' | 'ocr' | 'render' | 'complete' | 'error';
  
  /** Progress percentage (0-100) */
  percent?: number;
  
  /** Status message to display */
  message?: string;
  
  /** Custom stage progress overrides */
  stageProgress?: Partial<Record<'idle' | 'upload' | 'ocr' | 'render' | 'complete' | 'error', number>>;
  
  /** Optional CSS class */
  className?: string;
}

/**
 * Theme toggle component props
 */
export interface ThemeToggleProps {
  /** Current theme value */
  theme: 'light' | 'dark';
  
  /** Callback to toggle theme */
  toggleTheme: () => void;
  
  /** Optional CSS class */
  className?: string;
}

/**
 * History drawer component props
 */
export interface HistoryDrawerProps {
  /** Whether drawer is open */
  isOpen: boolean;
  
  /** Callback when drawer should close */
  onClose: () => void;
  
  /** History items to display */
  history: HistoryItem[];
  
  /** Callback when user selects history item */
  onSelectEntry?: (entry: HistoryItem) => void;
  
  /** Callback to restore item */
  onRestore?: (entry: HistoryItem) => void;
  
  /** Callback to remove item */
  onRemoveItem?: (id: string) => void;
  
  /** Callback to clear all history */
  onClearHistory?: () => void;
  
  /** Optional CSS class */
  className?: string;
}

/**
 * History item in storage
 */
export interface HistoryItem {
  id?: string;
  filename: string;
  text: string;
  timestamp?: number;
  method?: 'tesseract' | 'transformers';
  confidence?: number;
}

/**
 * Toast notification props
 */
export interface ToastProps {
  /** Toast message */
  message: string;
  
  /** Toast type */
  type?: 'success' | 'error' | 'info' | 'warning';
  
  /** Auto-close duration in ms (0 = no auto-close) */
  duration?: number;
  
  /** Callback when toast closes */
  onClose?: () => void;
  
  /** Optional CSS class */
  className?: string;
}

/**
 * Modal/Dialog component props
 */
export interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  
  /** Modal title */
  title: string;
  
  /** Modal content */
  content: React.ReactNode | string;
  
  /** Modal actions (buttons) */
  actions?: ModalAction[];
  
  /** Callback when modal closes */
  onClose: () => void;
  
  /** Optional CSS class */
  className?: string;
}

/**
 * Modal action (button)
 */
export interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}
