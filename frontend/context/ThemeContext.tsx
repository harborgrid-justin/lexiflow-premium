
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { tokens, ThemeMode } from '../theme/tokens';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  theme: typeof tokens.colors.light;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Principle 35/38: Deterministic First Render
  // Start with a stable default (e.g. 'light') during initial render/hydration
  // to avoid mismatched markup. Sync with storage/preference in effect.
  const [mode, setMode] = useState<ThemeMode>('light');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync with localStorage or system preference after mount
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('color-theme');
      if (typeof storedPrefs === 'string') {
        setMode(storedPrefs as ThemeMode);
        return;
      }
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        setMode('dark');
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('color-theme', newMode);
      return newMode;
    });
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('color-theme', newMode);
  }, []);

  useEffect(() => {
    // Only apply class changes if mounted to avoid side-effects during render phase (though useEffect is post-render)
    if (!mounted) return;
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    
    // Apply meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', mode === 'dark' ? '#0f172a' : '#f8fafc');
    }
  }, [mode, mounted]);

  const value = useMemo(() => ({
    mode,
    toggleTheme,
    setTheme,
    theme: tokens.colors[mode],
    isDark: mode === 'dark',
  }), [mode, toggleTheme, setTheme]);

  // Optional: Prevent flash if critical, but standard pattern accepts initial light theme
  // For strict hydration safety, we render children immediately.
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
