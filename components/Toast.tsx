import React, { useEffect } from 'react';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000); // Auto-dismiss after 10 seconds (increased for more time to read)

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-50 w-full max-w-md animate-slide-in">
      <div className="bg-destructive text-destructive-foreground rounded-lg shadow-xl border-2 border-destructive-foreground/20 p-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <ExclamationTriangleIcon className="w-6 h-6 text-destructive-foreground" />
        </div>
        <div className="flex-grow min-w-0">
          <p className="font-bold text-base mb-1">⚠️ Extraction Failed</p>
          <p className="text-sm leading-relaxed">{message}</p>
          <p className="text-xs mt-2 opacity-90 italic">Both fast and AI methods were attempted</p>
        </div>
        <div className="flex-shrink-0">
          <button 
            onClick={onClose} 
            aria-label="Close notification" 
            className="p-1 rounded-full hover:bg-destructive/80 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive-foreground/50"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
