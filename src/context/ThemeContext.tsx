'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ThemeResponse } from '@/types/api';
import { useAuth } from '@/context/AuthContext';

interface ThemeLoaderProps {
  children: React.ReactNode;
}

export const ThemeLoader: React.FC<ThemeLoaderProps> = ({ children }) => {
  const { mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  mounted: boolean;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Возвращаем дефолтные значения вместо ошибки
    return {
      theme: 'light' as Theme,
      toggleTheme: async () => {},
      setTheme: async () => {},
      mounted: false,
      loading: false
    };
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Проверяем авторизацию и загружаем тему
  useEffect(() => {
    // Ждем завершения проверки аутентификации
    if (authLoading) return;

    const loadTheme = async () => {
      let themeToApply: Theme = 'light';
      let source: 'database' | 'localStorage' | 'default' = 'default';

      if (isAuthenticated) {
        // Сначала пытаемся получить настройки пользователя, включая тему
        try {
          setLoading(true);
          const settingsResponse = await api.auth.settings();
          if (settingsResponse.data && (settingsResponse.data as any).theme) {
            themeToApply = (settingsResponse.data as any).theme;
            source = 'database';
            console.log('Theme loaded from user settings:', themeToApply);
          } else {
            // Если темы нет в настройках, используем localStorage
            const savedTheme = localStorage.getItem('theme') as Theme;
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
              themeToApply = savedTheme;
              source = 'localStorage';
            }
          }
        } catch (error) {
          console.warn('Не удалось загрузить тему из настроек пользователя:', error);
          // Если не удалось получить из настроек, используем localStorage
          const savedTheme = localStorage.getItem('theme') as Theme;
          if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            themeToApply = savedTheme;
            source = 'localStorage';
          }
        } finally {
          setLoading(false);
        }
      } else {
        // Для неавторизованных пользователей используем localStorage
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          themeToApply = savedTheme;
          source = 'localStorage';
        }
      }

      setTheme(themeToApply);
      applyTheme(themeToApply);

      // Сохраняем в localStorage для быстрого доступа
      localStorage.setItem('theme', themeToApply);

      setMounted(true);
    };

    loadTheme();
  }, [isAuthenticated, authLoading]);

  const applyTheme = (themeToApply: Theme) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(themeToApply);
  };

  const setThemeDirect = async (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);

    // Сохраняем в localStorage
    localStorage.setItem('theme', newTheme);

    // Если пользователь авторизован, сохраняем в настройках пользователя
    if (isAuthenticated) {
      try {
        // Сохраняем тему в настройках пользователя
        await api.auth.updateSettings({ theme: newTheme });
        console.log('Theme saved to user settings:', newTheme);
      } catch (error) {
        console.warn('Не удалось сохранить тему в настройках пользователя:', error);
        // Попробуем сохранить через старый API тем
        try {
          await api.theme.update(newTheme);
        } catch (themeError) {
          console.warn('Не удалось сохранить тему через theme API:', themeError);
        }
        // Тема все равно сохранена в localStorage
      }
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await setThemeDirect(newTheme);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setTheme: setThemeDirect,
      mounted,
      loading
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
