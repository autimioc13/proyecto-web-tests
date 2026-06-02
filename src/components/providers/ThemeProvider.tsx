'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be inside ThemeProvider');
  return context;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Detectar sistema
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setSystemTheme(dark ? 'dark' : 'light');

    // Cargar preferencia guardada
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) setThemeState(saved);
    else setThemeState('system');

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme, systemTheme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  return (
    <ThemeContext.Provider value={{ theme, systemTheme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
