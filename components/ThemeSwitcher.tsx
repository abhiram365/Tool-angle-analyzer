import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SystemIcon } from './icons/SystemIcon';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'light', icon: <SunIcon /> },
    { name: 'dark', icon: <MoonIcon /> },
    { name: 'system', icon: <SystemIcon /> },
  ];

  return (
    <div className="flex items-center p-1 rounded-lg bg-zinc-200 dark:bg-zinc-800">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name as 'light' | 'dark' | 'system')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            theme === t.name
              ? 'bg-white dark:bg-black text-orange-500'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
          aria-label={`Switch to ${t.name} theme`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
};
