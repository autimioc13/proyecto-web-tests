'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

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

function applyTheme(theme: Theme, systemTheme: 'light' | 'dark') {
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  // Force apply dark class
  const html = document.documentElement;
  if (isDark) {
    html.classList.add('dark');
    html.style.colorScheme = 'dark';
  } else {
    html.classList.remove('dark');
    html.style.colorScheme = 'light';
  }

  // Save preference
  localStorage.setItem('theme', theme);

  // Debug
  console.log('Theme applied:', { theme, isDark, hasDarkClass: html.classList.contains('dark') });
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    // Detect system preference
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const detectedSystemTheme = dark ? 'dark' : 'light';
    setSystemTheme(detectedSystemTheme);

    // Load saved preference
    const saved = localStorage.getItem('theme') as Theme | null;
    const initialTheme = saved || 'system';
    setThemeState(initialTheme);

    // Apply immediately
    applyTheme(initialTheme, detectedSystemTheme);
    setMounted(true);
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme, systemTheme);
    }
  }, [theme, mounted]);

  // Listen to system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
      if (theme === 'system') {
        applyTheme('system', e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  return (
    <ThemeContext.Provider value={{ theme, systemTheme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
