/**
 * ThemeProvider - Theme system with dark/light mode
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { persistMode } from './mode/persistMode';
import { resolveMode } from './mode/resolveMode';
import { darkTheme } from './themes/dark';
import { lightTheme } from './themes/light';
import type { Theme, ThemeMode } from './types';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'system' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      return resolveMode() || defaultMode;
    }
    return defaultMode;
  });

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    persistMode(newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Apply theme CSS variables to document
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });
      Object.entries(theme.typography).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--typography-${key}`, value);
        }
      });
    }
  }, [theme]);

  const value: ThemeContextValue = {
    theme,
    mode,
    setMode,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
