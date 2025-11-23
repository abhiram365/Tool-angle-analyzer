import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BotIcon } from './icons/BotIcon';
import { CloseIcon } from './icons/CloseIcon';

interface AIBotPopupProps {
  onClose: () => void;
}

export const AIBotPopup: React.FC<AIBotPopupProps> = ({ onClose }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!popupRef.current) return;
    setIsDragging(true);
    const rect = popupRef.current.getBoundingClientRect();
    dragStartOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStartOffset.current.x;
      const newY = e.clientY - dragStartOffset.current.y;
      setPosition({ x: newX, y: newY });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={popupRef}
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
      className={`fixed z-20 w-80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl shadow-black/30 transition-transform transform-gpu ${isDragging ? 'scale-105' : 'scale-100'}`}
    >
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between p-3 bg-zinc-100/50 dark:bg-black/50 rounded-t-xl cursor-move"
      >
        <div className="flex items-center gap-2">
          <BotIcon />
          <h3 className="font-semibold text-orange-500 dark:text-orange-400">AI Assistant</h3>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <CloseIcon />
        </button>
      </div>
      <div className="p-4">
        <p className="text-zinc-700 dark:text-zinc-300">
          Ready for an inspection? Upload a drawing or a photo of your cutting tool, and I'll analyze its geometry.
        </p>
      </div>
    </div>
  );
};
