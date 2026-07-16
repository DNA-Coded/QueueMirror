import React from 'react';
import { useTheme } from '../contexts/ThemeContext.js';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="text-on-surface-variant hover:bg-surface-container-low p-sm rounded-full transition-all duration-300 focus:outline-none flex items-center justify-center active:scale-95 cursor-pointer relative"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      <span className="material-symbols-outlined text-[20px] transition-transform duration-500 rotate-0 dark:rotate-[360deg]">
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
};
