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
    }, 8000); // Auto-dismiss after 8 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-50 w-full max-w-sm animate-slide-in">
      <div className="bg-destructive text-destructive-foreground rounded-lg shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="w-6 h-6 text-destructive-foreground" />
        </div>
        <div className="flex-grow">
          <p className="font-bold">Extraction Failed</p>
          <p className="text-sm">{message}</p>
        </div>
        <div className="flex-shrink-0">
          <button onClick={onClose} aria-label="Close notification" className="p-1 rounded-full hover:bg-destructive/80 transition-colors">
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
