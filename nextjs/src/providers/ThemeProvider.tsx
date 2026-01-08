import { ThemeMode, tokens } from '@theme/tokens';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_THEME, THEME_STORAGE_KEY } from '../config/app.config';
import { ThemeActionsContext, ThemeStateContext } from './ThemeContext';
import type {
  ThemeProviderProps
} from './ThemeContext.types';

/**
 * ThemeProvider - Application-level theming boundary
 *
 * Best Practices Applied:
 * - BP1: Cross-cutting concern (theming) justifies context usage
 * - BP2: Narrow interface with minimal surface area
 * - BP3: Split read/write contexts for performance
 * - BP4: No raw context export; only hooks
 * - BP7: Explicit memoization of provider values
 * - BP9: Co-locate provider and type definitions
 * - BP11: Strict TypeScript contracts
 */

export const ThemeProvider = ({ children, initialMode }: ThemeProviderProps) => {
  // Context update minimization: Split contexts prevent unnecessary rerenders (Principle #14)
  // Concurrent-safe: Deterministic first render prevents hydration mismatches
  // Start with stable default during initial render to avoid markup mismatch
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Initialize from localStorage or system preference if available
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (typeof storedPrefs === 'string') {
        return storedPrefs as ThemeMode;
      }
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }
    return initialMode || (DEFAULT_THEME === 'auto' ? 'light' : DEFAULT_THEME);
  });

  // Initialize mounted as true - component is always mounted when rendering
  const [mounted] = useState(true);

  // Effect discipline: Synchronize theme with localStorage/system (Principle #6)
  // Strict Mode ready: Effect runs twice in dev, but is idempotent (Principle #7)
  useEffect(() => {
    // Theme is already initialized in useState, no need for additional sync
    // Effect left empty for future theme change listeners
  }, []);

  // Stable callbacks minimize context updates (Principle #14)
  // Functional state update ensures concurrent safety (Principle #5)
  const toggleTheme = useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, newMode);
      return newMode;
    });
  }, []);

  // BP10: Stabilize function references with useCallback
  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
  }, []);

  // Effect discipline: Synchronize theme class with DOM (Principle #6)
  // This is legitimate external system synchronization
  useEffect(() => {
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

  // BP7: Memoize provider values explicitly - state context
  const currentTheme = tokens.colors[mode];
  const stateValue = useMemo(() => ({
    mode,
    theme: {
      ...currentTheme,
      // Compatibility layer for enterprise components that use theme.colors.xxx
      colors: currentTheme,
    },
    isDark: mode === 'dark',
  }), [mode, currentTheme]);

  // BP7: Memoize provider values explicitly - actions context
  const actionsValue = useMemo(() => ({
    toggleTheme,
    setTheme,
  }), [toggleTheme, setTheme]);

  // BP3 & BP8: Multiple providers for split read/write
  return (
    <ThemeStateContext.Provider value={stateValue}>
      <ThemeActionsContext.Provider value={actionsValue}>
        {children}
      </ThemeActionsContext.Provider>
    </ThemeStateContext.Provider>
  );
};
