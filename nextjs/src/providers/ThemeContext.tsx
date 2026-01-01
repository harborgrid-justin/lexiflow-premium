import { DEFAULT_THEME, THEME_STORAGE_KEY } from '../config/app.config';
import { ThemeMode, tokens } from '@theme/tokens';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  ThemeActionsValue,
  ThemeProviderProps,
  ThemeStateValue,
} from './ThemeContext.types';

/**
 * ThemeContext - Application-level theming boundary
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

// BP3: Split contexts for state and actions
const ThemeStateContext = createContext<ThemeStateValue | undefined>(undefined);
const ThemeActionsContext = createContext<ThemeActionsValue | undefined>(undefined);

// BP4: Export only custom hooks, not raw contexts
export function useThemeState(): ThemeStateValue {
  const context = useContext(ThemeStateContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error('useThemeState must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeActions(): ThemeActionsValue {
  const context = useContext(ThemeActionsContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error('useThemeActions must be used within a ThemeProvider');
  }
  return context;
}

// Convenience hook for consumers that need both (backward compatibility)
export function useTheme() {
  return {
    ...useThemeState(),
    ...useThemeActions(),
  };
}

export const ThemeProvider = ({ children, initialMode }: ThemeProviderProps) => {
  // Context update minimization: Split contexts prevent unnecessary rerenders (Principle #14)
  // Concurrent-safe: Deterministic first render prevents hydration mismatches
  // Start with stable default during initial render to avoid markup mismatch
  const [mode, setMode] = useState<ThemeMode>(
    initialMode || (DEFAULT_THEME === 'auto' ? 'light' : DEFAULT_THEME)
  );

  const [mounted, setMounted] = useState(false);

  // Effect discipline: Synchronize theme with localStorage/system (Principle #6)
  // Strict Mode ready: Effect runs twice in dev, but is idempotent (Principle #7)
  useEffect(() => {
    setMounted(true);
    // Sync with localStorage or system preference after mount
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem(THEME_STORAGE_KEY);
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
