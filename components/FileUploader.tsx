import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploaderProps {
  onFilesSelect: (files: FileList) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelect(e.dataTransfer.files);
    }
  }, [onFilesSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(e.target.files);
    }
  };

  return (
    <label
      htmlFor="file-upload"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
        ${isDragging ? 'border-orange-500 dark:border-orange-400 bg-orange-200/50 dark:bg-zinc-800/50' : 'border-zinc-300 dark:border-zinc-700 hover:border-orange-600 dark:hover:border-orange-500 bg-orange-100/30 hover:bg-orange-100/60 dark:bg-transparent dark:hover:bg-zinc-800/30'}`}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <UploadIcon />
        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-orange-500 dark:text-orange-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Up to 3 images, or one 3D model (.obj, .stl)</p>
      </div>
      <input id="file-upload" type="file" className="hidden" accept="image/*,.obj,.stl" onChange={handleFileChange} multiple />
    </label>
  );
};