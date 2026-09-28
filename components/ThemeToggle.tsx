import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/src/theme/ThemeContext';
import type { Language } from '@/types';

interface ThemeToggleProps {
  lang: Language;
  variant?: 'icon' | 'menu';
}

export function ThemeToggle({ lang, variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // SSR and first client render: isHydrated=false, isDark=false
  // After mount: isHydrated=true, isDark reflects actual theme
  const isDark = isHydrated && theme === 'dark';

  // Neutral label before hydration for SSR consistency
  const ariaLabel = !isHydrated
    ? lang === 'en'
      ? 'Toggle color theme'
      : 'Переключить цветовую тему'
    : isDark
      ? lang === 'en'
        ? 'Switch to light mode'
        : 'Включить светлую тему'
      : lang === 'en'
        ? 'Switch to dark mode'
        : 'Включить тёмную тему';

  if (variant === 'menu') {
    return (
      <div className="flex items-center justify-between py-4 border-b border-white/10">
        <span className="text-white/90 font-medium">
          {lang === 'en' ? 'Appearance' : 'Оформление'}
        </span>
        <button
          type="button"
          onClick={toggleTheme}
          disabled={!isHydrated}
          aria-label={ariaLabel}
          aria-pressed={isHydrated ? isDark : false}
          className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-default"
        >
          <span
            aria-hidden="true"
            className={`relative flex h-5 w-5 items-center justify-center transition-opacity duration-150 ${
              isHydrated ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Sun
              className={`w-5 h-5 absolute transition-all duration-200 motion-reduce:transition-none ${
                isDark
                  ? 'opacity-100 rotate-0 scale-100'
                  : 'opacity-0 -rotate-90 scale-75'
              }`}
            />
            <Moon
              className={`w-5 h-5 absolute transition-all duration-200 motion-reduce:transition-none ${
                isDark
                  ? 'opacity-0 rotate-90 scale-75'
                  : 'opacity-100 rotate-0 scale-100'
              }`}
            />
          </span>
        </button>
      </div>
    );
  }

  // Icon-only variant for desktop header
  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!isHydrated}
      aria-label={ariaLabel}
      aria-pressed={isHydrated ? isDark : false}
      className="relative w-10 h-10 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-default"
    >
      <span
        aria-hidden="true"
        className={`relative flex h-5 w-5 items-center justify-center transition-opacity duration-150 ${
          isHydrated ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Sun
          className={`w-5 h-5 absolute transition-all duration-200 motion-reduce:transition-none ${
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-75'
          }`}
        />
        <Moon
          className={`w-5 h-5 absolute transition-all duration-200 motion-reduce:transition-none ${
            isDark
              ? 'opacity-0 rotate-90 scale-75'
              : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </span>
    </button>
  );
}
