'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Icon } from './Icon';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors duration-200"
      aria-label="Переключить тему"
    >
      <Icon
        icon={theme === 'light' ? Moon : Sun}
        size={20}
        className="text-foreground"
      />
    </button>
  );
};
