import React, { useState, useCallback } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { downloadDoc, downloadPdf } from '../utils/fileUtils';

interface ResultDisplayProps {
  text: string;
  originalFilename: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ text, originalFilename }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState<null | 'doc' | 'pdf'>(null);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [text]);

  const handleDownload = (format: 'doc' | 'pdf') => {
    setIsDownloading(format);
    const baseFilename = originalFilename.split('.').slice(0, -1).join('.') || originalFilename;
    try {
      if (format === 'doc') {
        downloadDoc(text, `${baseFilename}.doc`);
      } else {
        downloadPdf(text, `${baseFilename}.pdf`);
      }
    } catch(e) {
      console.error("Download failed", e);
    } finally {
        setTimeout(() => setIsDownloading(null), 1000);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 flex items-center justify-between mb-2 pb-2 border-b border-border">
        <h3 className="font-semibold text-lg">Extracted Text</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-70"
            disabled={isCopied}
          >
            <CopyIcon className="w-4 h-4" />
            {isCopied ? 'Copied!' : 'Copy Text'}
          </button>
          <button
            onClick={() => handleDownload('doc')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-70"
            disabled={!!isDownloading}
          >
            <DownloadIcon className="w-4 h-4" />
            {isDownloading === 'doc' ? 'Downloading...' : 'Download .doc'}
          </button>
           <button
            onClick={() => handleDownload('pdf')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-70"
            disabled={!!isDownloading}
          >
            <DownloadIcon className="w-4 h-4" />
            {isDownloading === 'pdf' ? 'Downloading...' : 'Download .pdf'}
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-auto bg-muted/50 p-3 rounded-md min-h-[300px]">
        <pre className="text-sm whitespace-pre-wrap break-words font-sans">{text}</pre>
      </div>
    </div>
  );
};
