import React, { useState } from 'react';
import { trackCodeBlockCopied } from '../../lib/analytics';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

/**
 * CodeBlock: Dark monospace code display
 * Always renders in dark mode regardless of theme preference
 * Includes copy button and optional filename header
 * Matches Linear/Stripe/Vercel aesthetic
 */
export function CodeBlock({
  code,
  language,
  filename,
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      trackCodeBlockCopied({ filename: filename || language || 'code' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden border border-code-border bg-code-bg ${className}`}>
      {/* Header */}
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-code-border bg-code-bg/50">
          <div className="flex items-center gap-2">
            {filename && <span className="text-code-text/70 text-sm">{filename}</span>}
            {language && (
              <span className="text-code-text/70 text-xs uppercase">{language}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            aria-label={copied ? 'Copied!' : 'Copy code'}
            className={`text-sm px-3 py-1.5 rounded transition-all duration-200 font-medium ${
              copied
                ? 'text-status-live bg-status-live/10'
                : 'text-code-text/60 hover:text-code-text hover:bg-code-border/50'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* Code */}
      <pre
        className="overflow-x-auto p-4 m-0"
        tabIndex={0}
        aria-label={`${language || 'code'} code example${filename ? ': ' + filename : ''}`}
      >
        <code className="font-mono text-sm text-code-text">{code}</code>
      </pre>
    </div>
  );
}
