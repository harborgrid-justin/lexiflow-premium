/**
 * ThemeProvider.tsx
 * Theme context provider for managing application themes
 * Supports light/dark modes and custom theme configurations
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Theme, ThemeMode, ThemeConfig } from './theme.config';
import { getTheme } from './theme.config';

// ============================================================================
// Types
// ============================================================================

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  customTheme: Partial<Theme> | null;
  setCustomTheme: (theme: Partial<Theme>) => void;
  resetTheme: () => void;
  config: ThemeConfig;
}

// ============================================================================
// Context Creation
// ============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================================================
// Storage Keys
// ============================================================================

const THEME_STORAGE_KEY = 'app_theme_mode';
const CUSTOM_THEME_STORAGE_KEY = 'app_custom_theme';

// ============================================================================
// Helper Functions
// ============================================================================

function getInitialMode(): ThemeMode {
  // Check localStorage first
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && (stored === 'light' || stored === 'dark' || stored === 'auto')) {
    return stored as ThemeMode;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

function getEffectiveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'auto') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  return mode;
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;

  // Apply CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      root.style.setProperty(`--color-${key}`, value);
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        root.style.setProperty(`--color-${key}-${subKey}`, subValue as string);
      });
    }
  });

  // Apply spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });

  // Apply typography
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value);
  });
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, String(value));
  });
  Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
    root.style.setProperty(`--line-height-${key}`, String(value));
  });

  // Apply border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--border-radius-${key}`, value);
  });

  // Apply shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });

  // Apply z-index values
  Object.entries(theme.zIndex).forEach(([key, value]) => {
    root.style.setProperty(`--z-index-${key}`, String(value));
  });

  // Apply breakpoints
  Object.entries(theme.breakpoints).forEach(([key, value]) => {
    root.style.setProperty(`--breakpoint-${key}`, value);
  });
}

// ============================================================================
// ThemeProvider Component
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  config?: Partial<ThemeConfig>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode,
  config: customConfig,
}) => {
  const [mode, setModeState] = useState<ThemeMode>(() => defaultMode || getInitialMode());
  const [customTheme, setCustomThemeState] = useState<Partial<Theme> | null>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // ============================================================================
  // Compute effective theme
  // ============================================================================

  const theme = useMemo(() => {
    const effectiveMode = getEffectiveMode(mode);
    const baseTheme = getTheme(effectiveMode);

    // Merge with custom theme if provided
    if (customTheme) {
      return {
        ...baseTheme,
        ...customTheme,
        colors: { ...baseTheme.colors, ...customTheme.colors },
        spacing: { ...baseTheme.spacing, ...customTheme.spacing },
        typography: { ...baseTheme.typography, ...customTheme.typography },
        borderRadius: { ...baseTheme.borderRadius, ...customTheme.borderRadius },
        shadows: { ...baseTheme.shadows, ...customTheme.shadows },
      } as Theme;
    }

    return baseTheme;
  }, [mode, customTheme]);

  // ============================================================================
  // Apply theme to document
  // ============================================================================

  useEffect(() => {
    applyThemeToDocument(theme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.background);
    }

    // Update body background
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
  }, [theme]);

  // ============================================================================
  // Listen to system theme changes
  // ============================================================================

  useEffect(() => {
    if (mode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      // Force re-render when system theme changes
      setModeState('auto');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mode]);

  // ============================================================================
  // Set Mode
  // ============================================================================

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  // ============================================================================
  // Toggle Mode
  // ============================================================================

  const toggleMode = () => {
    const effectiveMode = getEffectiveMode(mode);
    const newMode = effectiveMode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  // ============================================================================
  // Set Custom Theme
  // ============================================================================

  const setCustomTheme = (newTheme: Partial<Theme>) => {
    setCustomThemeState(newTheme);
    localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(newTheme));
  };

  // ============================================================================
  // Reset Theme
  // ============================================================================

  const resetTheme = () => {
    setCustomThemeState(null);
    localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
  };

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: ThemeContextType = {
    theme,
    mode,
    setMode,
    toggleMode,
    customTheme,
    setCustomTheme,
    resetTheme,
    config: {
      enableTransitions: true,
      persistPreference: true,
      respectSystemPreference: true,
      ...customConfig,
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================================================
// useTheme Hook
// ============================================================================

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}

// ============================================================================
// withTheme HOC
// ============================================================================

export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
) {
  return function ThemedComponent(props: P) {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} />;
  };
}

export default ThemeProvider;
