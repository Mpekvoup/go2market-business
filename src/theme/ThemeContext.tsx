import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'g2m-theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialThemeFromDOM(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function applyTheme(isDark: boolean): void {
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

function hasExplicitChoice(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark';
  } catch {
    return false;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe: start with 'light', sync from DOM after mount
  const [theme, setTheme] = useState<Theme>('light');
  const [hasMounted, setHasMounted] = useState(false);
  // Track if user made explicit choice (for system preference listener)
  const [isExplicit, setIsExplicit] = useState(false);

  // Sync React state with DOM on mount (anti-flash script already set the class)
  useEffect(() => {
    setTheme(getInitialThemeFromDOM());
    setIsExplicit(hasExplicitChoice());
    setHasMounted(true);
  }, []);

  // Listen for system preference changes when no explicit choice saved
  useEffect(() => {
    if (!hasMounted || isExplicit) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme: Theme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      applyTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [hasMounted, isExplicit]);

  // Sync between tabs via storage event
  useEffect(() => {
    if (!hasMounted) return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;

      if (e.newValue === 'dark' || e.newValue === 'light') {
        const newTheme: Theme = e.newValue;
        setTheme(newTheme);
        setIsExplicit(true);
        applyTheme(newTheme === 'dark');
      } else if (e.newValue === null) {
        // Storage cleared - use system preference and start listening again
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const newTheme: Theme = isDark ? 'dark' : 'light';
        setTheme(newTheme);
        setIsExplicit(false); // Re-enable system preference listener
        applyTheme(isDark);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [hasMounted]);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    setTheme(nextTheme);
    setIsExplicit(true);
    applyTheme(nextTheme === 'dark');

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Theme still works for the current session.
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
