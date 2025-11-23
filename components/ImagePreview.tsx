import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ImagePreviewProps {
  src: string;
  alt: string;
  onRemove: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, onRemove }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 group">
      <img src={src} alt={alt} className="w-full h-auto object-contain" />
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/90 rounded-full text-white transition-opacity opacity-0 group-hover:opacity-100"
        title="Remove image"
        aria-label="Remove image"
      >
        <CloseIcon />
      </button>
    </div>
  );
};
