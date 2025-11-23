
import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { LogoIcon } from './icons/LogoIcon';

interface HeaderProps {
  onShowHistory?: () => void;
  onShowArchitecture?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowHistory, onShowArchitecture, onGoHome }) => {
  return (
    <header className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={onGoHome}
          >
            <LogoIcon />
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Cutting Tool Inspector AI
            </h1>
          </div>
          <div className="flex items-center gap-3">
             {onShowArchitecture && (
                <button
                    onClick={onShowArchitecture}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors font-medium text-sm"
                    title="System Architecture"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                        <line x1="6" y1="6" x2="6.01" y2="6"></line>
                        <line x1="6" y1="18" x2="6.01" y2="18"></line>
                    </svg>
                    <span>Architecture</span>
                </button>
            )}
            {onShowHistory && (
                <button
                    onClick={onShowHistory}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-orange-600 dark:text-orange-400 transition-colors font-medium text-sm"
                >
                    <DatabaseIcon />
                    <span className="hidden sm:inline">History</span>
                </button>
            )}
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};
