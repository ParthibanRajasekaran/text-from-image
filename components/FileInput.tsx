import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface FileInputProps {
  onFileChange: (file: File | null) => void;
  previewUrl: string | null;
  imageFile: File | null;
  isLoading: boolean;
}

const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB (matching backend limits)

export const FileInput: React.FC<FileInputProps> = ({ onFileChange, previewUrl, imageFile, isLoading }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFile = useCallback((file: File | null) => {
    if (!file) {
      setError('');
      onFileChange(null);
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a PNG, JPG, JPEG, or WEBP file.');
      onFileChange(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File too large (${fileSizeMB} MB). Max size is 20 MB.`);
      onFileChange(null);
      return;
    }

    setError('');
    onFileChange(file);

  }, [onFileChange]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    } else {
      handleFile(null);
    }
  };

  if (previewUrl && imageFile) {
    return (
      <div className="relative p-4 border border-border rounded-lg bg-card">
        <img 
            src={previewUrl} 
            alt="Image preview" 
            className={`max-h-60 w-full object-contain rounded-md mx-auto transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`} 
        />
        {isLoading && (
            <div className="absolute inset-4 flex items-center justify-center bg-black/20 animate-pulse rounded-md"></div>
        )}
        <div className="text-center mt-2 text-sm text-muted-foreground">
          <p className="font-semibold truncate px-8">{imageFile.name}</p>
          <p>{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={() => onFileChange(null)}
          className="absolute top-2 right-2 p-1 bg-muted/50 rounded-full text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remove image"
          disabled={isLoading}
        >
            <XCircleIcon className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-300 min-h-[200px] flex flex-col justify-center items-center ${
        isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-secondary'
      }`}
    >
      <input
        type="file"
        id="file-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept={ACCEPTED_FILE_TYPES.join(',')}
        onChange={handleChange}
        disabled={isLoading}
      />
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
        <UploadIcon className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground/80">PNG, JPG, JPEG, or WEBP (max 20MB)</p>
        {error && <p className="text-sm text-destructive mt-2 font-medium">{error}</p>}
      </label>
    </div>
  );
};