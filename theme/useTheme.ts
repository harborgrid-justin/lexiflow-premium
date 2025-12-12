/**
 * useTheme.ts
 * Custom hook for accessing and manipulating theme
 * Re-exports from ThemeProvider for convenience
 */

import { useContext } from 'react';
import { Theme, ThemeMode } from './theme.config';

// Note: This would normally import from ThemeProvider,
// but to avoid circular dependencies, we'll define a minimal interface

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  customTheme: Partial<Theme> | null;
  setCustomTheme: (theme: Partial<Theme>) => void;
  resetTheme: () => void;
}

// This will be populated by ThemeProvider
let ThemeContext: React.Context<ThemeContextType | undefined>;

// ============================================================================
// useTheme Hook
// ============================================================================

export function useTheme(): ThemeContextType {
  // Import ThemeContext from ThemeProvider to avoid circular dependency
  const context = useContext(
    require('./ThemeProvider').default.ThemeContext ||
    require('./ThemeProvider').ThemeContext
  );

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}

// ============================================================================
// useThemeMode Hook
// ============================================================================

export function useThemeMode(): [ThemeMode, (mode: ThemeMode) => void, () => void] {
  const { mode, setMode, toggleMode } = useTheme();
  return [mode, setMode, toggleMode];
}

// ============================================================================
// useThemeColors Hook
// ============================================================================

export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

// ============================================================================
// useThemeValue Hook (get specific theme value)
// ============================================================================

export function useThemeValue<K extends keyof Theme>(key: K): Theme[K] {
  const { theme } = useTheme();
  return theme[key];
}

// ============================================================================
// useColorScheme Hook (get effective color scheme)
// ============================================================================

export function useColorScheme(): 'light' | 'dark' {
  const { theme } = useTheme();
  return theme.mode;
}

// ============================================================================
// useMediaQuery Hook (responsive design)
// ============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

// ============================================================================
// useBreakpoint Hook (semantic breakpoints)
// ============================================================================

export function useBreakpoint() {
  const { theme } = useTheme();
  const breakpoints = theme.breakpoints;

  const isXs = useMediaQuery(`(max-width: ${breakpoints.xs})`);
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`);
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`);
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`);
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl})`);

  const isAboveSm = useMediaQuery(`(min-width: ${breakpoints.sm})`);
  const isAboveMd = useMediaQuery(`(min-width: ${breakpoints.md})`);
  const isAboveLg = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  const isAboveXl = useMediaQuery(`(min-width: ${breakpoints.xl})`);

  const isBelowSm = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const isBelowMd = useMediaQuery(`(max-width: ${breakpoints.md})`);
  const isBelowLg = useMediaQuery(`(max-width: ${breakpoints.lg})`);
  const isBelowXl = useMediaQuery(`(max-width: ${breakpoints.xl})`);

  return {
    // Current breakpoint
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,

    // Above breakpoints
    isAboveSm,
    isAboveMd,
    isAboveLg,
    isAboveXl,

    // Below breakpoints
    isBelowSm,
    isBelowMd,
    isBelowLg,
    isBelowXl,

    // Mobile/Desktop
    isMobile: isBelowMd,
    isTablet: isMd,
    isDesktop: isAboveLg,
  };
}

// ============================================================================
// usePrefersDarkMode Hook (system preference)
// ============================================================================

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

// ============================================================================
// usePrefersReducedMotion Hook (accessibility)
// ============================================================================

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// Import React for hooks
import * as React from 'react';

export default useTheme;
