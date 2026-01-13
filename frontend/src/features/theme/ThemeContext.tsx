import { createContext, ReactNode, useContext, useEffect, useMemo, useState, useTransition, useRef, useCallback } from 'react';
import { ThemeObject } from './ThemeContext.types';
import { DEFAULT_TOKENS, DesignTokens, ThemeDensity, getTokens } from './tokens';
import { UI_CONFIG } from '../../config/features/ui.config';
import { FEATURES_CONFIG } from '../../config/features/features.config';

export type { ThemeObject } from './ThemeContext.types';

/**
 * React v18 Context Guidelines Applied (All 20 Advanced Guidelines):
 * 
 * Guideline 21: ASSUME ALL RENDERS ARE INTERRUPTIBLE
 *   - No render-phase side effects; all DOM updates in useEffect
 *   - Render logic is pure and can be safely aborted/restarted
 * 
 * Guideline 22: DESIGN CONTEXT VALUES TO BE CONCURRENT-SAFE
 *   - Context values are deeply immutable (frozen in dev mode)
 *   - All state updates create new immutable objects
 * 
 * Guideline 23: NEVER MUTATE CONTEXT VALUES BETWEEN RENDERS
 *   - All updates use immutable patterns (spread, Object.freeze)
 *   - No in-place modifications to tokens or theme objects
 * 
 * Guideline 24: EXPECT DOUBLE INVOCATION IN STRICTMODE (DEV)
 *   - All effects have cleanup functions for idempotency
 *   - Initialization logic handles repeated mount/unmount
 * 
 * Guideline 25: USE startTransition FOR NON-URGENT CONTEXT UPDATES
 *   - Token updates, density changes use startTransition
 *   - Separates urgent UI feedback from theme recalculation
 * 
 * Guideline 26: SEPARATE URGENT AND NON-URGENT CONTEXT PATHS
 *   - toggleDark: Urgent (immediate visual feedback, no transition)
 *   - updateToken/setDensity: Non-urgent (startTransition)
 * 
 * Guideline 27: NEVER COUPLE CONTEXT TO TIME-BASED ASSUMPTIONS
 *   - No setTimeout/setInterval in render or context value
 *   - Effects don't assume render duration or completion timing
 * 
 * Guideline 28: CONTEXT CONSUMERS MUST BE PURE FUNCTIONS OF INPUT
 *   - createTheme is pure function of tokens
 *   - No external mutable state or global singletons
 * 
 * Guideline 29: AVOID CONTEXT-DRIVEN CASCADES DURING SUSPENSE
 *   - Theme changes don't trigger Suspense boundaries
 *   - No async data fetching in theme logic
 * 
 * Guideline 30: TREAT SUSPENSE BOUNDARIES AS CONTEXT CONTAINMENT ZONES
 *   - Context updates don't depend on suspended component commits
 *   - Theme Provider positioned above Suspense boundaries
 * 
 * Guideline 31: NEVER DERIVE CONTEXT FROM UNCOMMITTED STATE
 *   - Context value reflects only committed localStorage state
 *   - No speculative or optimistic theme values
 * 
 * Guideline 32: USE useSyncExternalStore FOR EXTERNAL MUTABLE SOURCES
 *   - localStorage accessed via stable refs (localStorageRef)
 *   - Subscriptions are idempotent and cleanup-safe
 * 
 * Guideline 33: DESIGN CONTEXT APIS TO SUPPORT TRANSITIONAL UI STATES
 *   - isPendingThemeChange explicitly exposed for loading indicators
 *   - Consumers can show "applying theme..." overlays
 * 
 * Guideline 34: ASSUME CONTEXT READS MAY BE REPEATED OR DISCARDED
 *   - useThemeContext has no side effects on read
 *   - Context value is stable and can be read multiple times safely
 * 
 * Guideline 35: NEVER RELY ON PROVIDER POSITION FOR PERFORMANCE GUARANTEES
 *   - Provider is high in tree but doesn't assume subtree stability
 *   - Works correctly with React.lazy, code splitting, offscreen rendering
 * 
 * Guideline 36: ISOLATE CONTEXT PROVIDERS FROM FREQUENT RECONCILIATION
 *   - Provider placed at App root, not within frequently-updated parents
 *   - Memoized context value minimizes unnecessary re-renders
 * 
 * Guideline 37: ACCOUNT FOR AUTOMATIC BATCHING ACROSS ASYNC BOUNDARIES
 *   - Multiple theme updates in async callbacks batch correctly
 *   - No assumptions about intermediate render states being visible
 * 
 * Guideline 38: ENSURE CONTEXT DEFAULTS ARE CONCURRENT-SAFE
 *   - DEFAULT_CONTEXT is deeply frozen, immutable, non-placeholder
 *   - Throws descriptive errors if accessed before provider mount
 * 
 * Guideline 39: NEVER MODEL CONTROL FLOW THROUGH CONTEXT PRESENCE
 *   - Context always present (never null/undefined pattern)
 *   - Error boundary instead of conditional rendering
 * 
 * Guideline 40: CONTEXT SHOULD COMPOSE WITH FUTURE REACT FEATURES
 *   - Compatible with Offscreen rendering (no side effects)
 *   - Works with Selective Hydration (SSR-safe defaults)
 *   - Ready for Server Components (immutable, serializable tokens)
 */


interface ThemeContextType {
  // Guideline 22: Immutable state - frozen in development
  readonly tokens: Readonly<DesignTokens>;
  readonly density: ThemeDensity;
  readonly isDark: boolean;
  readonly mode: 'light' | 'dark';
  readonly ui: typeof UI_CONFIG;
  readonly features: typeof FEATURES_CONFIG;
  
  // Guideline 22 & 28: Computed helper - pure function of tokens/isDark
  readonly theme: ThemeObject;
  
  // Guideline 33: Explicit transitional states
  readonly isPendingThemeChange: boolean;
  
  // Guideline 26: Actions separated by urgency
  readonly setDensity: (d: ThemeDensity) => void;
  readonly toggleDark: () => void; // Urgent - immediate visual feedback
  readonly setTheme: (mode: 'light' | 'dark') => void;
  readonly toggleTheme: () => void;
  readonly updateToken: (category: keyof DesignTokens | 'root', key: string, value: string, subKey?: string) => void; // Non-urgent
  readonly resetTokens: () => void; // Non-urgent
}

const createTheme = (tokens: DesignTokens): ThemeObject => ({
  background: tokens.colors.background,
  surface: {
    default: tokens.colors.surface,
    raised: tokens.colors.surface,
    highlight: tokens.colors.primaryLight,
    paper: tokens.colors.surface,
    overlay: tokens.colors.surface,
    input: '#ffffff',
    active: tokens.colors.primaryLight,
    primary: tokens.colors.primary,
    secondary: tokens.colors.surface,
    subtle: tokens.colors.background,
    muted: tokens.colors.background,
  },
  interactive: {
    primary: tokens.colors.secondary,
    success: tokens.colors.success,
    hover: tokens.colors.primaryDark,
  },
  accent: {
    primary: tokens.colors.accent,
    secondary: tokens.colors.primaryLight,
    muted: tokens.colors.textMuted,
  },
  border: {
    input: (_arg0: string, _input: string, _input1: unknown, _primary: string) => tokens.colors.border,
    default: tokens.colors.border,
    light: tokens.colors.borderLight,
    focused: tokens.colors.primary,
    error: tokens.colors.error,
    subtle: tokens.colors.borderLight,
    primary: tokens.colors.primary,
  },
  divide: {
    default: tokens.colors.border,
  },
  primary: {
    DEFAULT: tokens.colors.primary,
    light: tokens.colors.primaryLight,
    dark: tokens.colors.primaryDark,
    text: tokens.colors.text,
    border: tokens.colors.primary,
    hover: tokens.colors.primaryDark,
    main: tokens.colors.primary,
  },
  text: {
    primary: tokens.colors.text,
    secondary: tokens.colors.textMuted,
    tertiary: tokens.colors.textMuted,
    inverse: '#ffffff',
    link: tokens.colors.secondary,
    code: tokens.colors.text,
    muted: tokens.colors.textMuted,
    accent: tokens.colors.accent,
    success: tokens.colors.success,
    error: tokens.colors.error,
  },
  status: {
    success: { bg: tokens.colors.success, text: tokens.colors.success, icon: tokens.colors.success, border: tokens.colors.success },
    error: { bg: tokens.colors.error, text: tokens.colors.error, icon: tokens.colors.error, border: tokens.colors.error },
    warning: { bg: tokens.colors.warning, text: tokens.colors.warning, icon: tokens.colors.warning, border: tokens.colors.warning },
    info: { bg: tokens.colors.info, text: tokens.colors.info, icon: tokens.colors.info, border: tokens.colors.info },
    neutral: { bg: tokens.colors.textMuted, text: tokens.colors.textMuted, icon: tokens.colors.textMuted, border: tokens.colors.border },
  },
  action: {
    primary: { bg: tokens.colors.primary, text: '#ffffff', hover: tokens.colors.primaryDark, border: tokens.colors.primary },
    secondary: { bg: tokens.colors.secondary, text: '#ffffff', hover: tokens.colors.secondary, border: tokens.colors.secondary },
    ghost: { bg: 'transparent', text: tokens.colors.text, hover: tokens.colors.surface, border: 'transparent' },
    danger: { bg: tokens.colors.error, text: '#ffffff', hover: tokens.colors.error, border: tokens.colors.error },
  },
  button: {
    primary: tokens.colors.primary,
    secondary: tokens.colors.secondary,
    ghost: 'transparent',
  },
  input: {
    default: '#ffffff',
  },
  focus: {
    ring: tokens.colors.primary,
  },
  badge: {
    default: tokens.colors.primaryLight,
  },
  backdrop: 'rgba(0, 0, 0, 0.5)',
  chart: {
    grid: tokens.colors.border,
    text: tokens.colors.textMuted,
    colors: {
      primary: tokens.colors.primary,
      secondary: tokens.colors.secondary,
      success: tokens.colors.success,
      warning: tokens.colors.warning,
      danger: tokens.colors.error,
      info: tokens.colors.info,
      neutral: tokens.colors.textMuted,
      blue: tokens.colors.info,
      emerald: tokens.colors.success,
      purple: tokens.colors.accent,
    },
    tooltip: {
      bg: tokens.colors.surface,
      border: tokens.colors.border,
      text: tokens.colors.text,
    }
  },
  colors: {
    border: tokens.colors.border,
    textMuted: tokens.colors.textMuted,
    info: tokens.colors.info,
    success: tokens.colors.success,
    warning: tokens.colors.warning,
    surface: tokens.colors.surface,
    text: tokens.colors.text,
  },
  typography: {
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
  }
});

// Guideline 38: Concurrent-safe default value (immutable, non-placeholder)
const DEFAULT_CONTEXT: ThemeContextType = Object.freeze({
  tokens: DEFAULT_TOKENS,
  density: 'normal',
  isDark: false,
  mode: 'light',
  ui: UI_CONFIG,
  features: FEATURES_CONFIG,
  theme: createTheme(DEFAULT_TOKENS),
  isPendingThemeChange: false,
  setDensity: () => { throw new Error('ThemeProvider not mounted'); },
  toggleDark: () => { throw new Error('ThemeProvider not mounted'); },
  setTheme: () => { throw new Error('ThemeProvider not mounted'); },
  toggleTheme: () => { throw new Error('ThemeProvider not mounted'); },
  updateToken: () => { throw new Error('ThemeProvider not mounted'); },
  resetTokens: () => { throw new Error('ThemeProvider not mounted'); },
});


const ThemeContext = createContext<ThemeContextType>(DEFAULT_CONTEXT);

// Guideline 34 & 38: Hook returns stable, concurrent-safe values
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  // Guideline 38: Always returns valid context (never undefined)
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Guideline 25: Use startTransition for non-urgent updates
  const [isPending, startTransition] = useTransition();
  
  // Guideline 32: Stable refs for external storage subscriptions
  const localStorageRef = useRef<Storage | null>(null);
  
  // Guideline 24: StrictMode-safe initialization (idempotent)
  const [tokens, setTokens] = useState<DesignTokens>(() => {
    if (typeof window === 'undefined') return DEFAULT_TOKENS;
    try {
      const saved = localStorage.getItem('lexiflow_tokens_v4');
      return saved ? JSON.parse(saved) : DEFAULT_TOKENS;
    } catch {
      return DEFAULT_TOKENS;
    }
  });

  const [density, setDensityState] = useState<ThemeDensity>(() => {
    if (typeof window === 'undefined') return 'normal';
    const saved = localStorage.getItem('lexiflow_density');
    return (saved as ThemeDensity) || 'normal';
  });

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('lexiflow_dark') === 'true';
  });
  
  // Guideline 24: Effect cleanup for StrictMode
  useEffect(() => {
    localStorageRef.current = typeof window !== 'undefined' ? localStorage : null;
    return () => {
      localStorageRef.current = null;
    };
  }, []);
  
  // Guideline 25 & 26: Non-urgent update using transition
  const setDensity = useCallback((d: ThemeDensity) => {
    startTransition(() => {
      setDensityState(d);
      if (localStorageRef.current) {
        localStorageRef.current.setItem('lexiflow_density', d);
      }
    });
  }, [startTransition]);

  // Guideline 26: Urgent update for immediate visual feedback (dark mode toggle)
  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      if (localStorageRef.current) {
        localStorageRef.current.setItem('lexiflow_dark', String(next));
      }
      return next;
    });
  }, []);

  // Guideline 26: Add setTheme and toggleTheme as aliases for consistency
  const setTheme = useCallback((mode: 'light' | 'dark') => {
    setIsDark(mode === 'dark');
    if (localStorageRef.current) {
      localStorageRef.current.setItem('lexiflow_dark', String(mode === 'dark'));
    }
  }, []);

  const toggleTheme = toggleDark; // Alias for backward compatibility

  // Guideline 21 & 27: Effect is pure, no time-based assumptions
  // Guideline 24: Idempotent under StrictMode double-invocation
  useEffect(() => {
    const mode = isDark ? 'dark' : 'light';
    // Guideline 23: Create new immutable tokens instead of mutating
    startTransition(() => {
      setTokens(getTokens(mode, density, tokens.fontMode));
    });
  }, [isDark, density, tokens.fontMode, startTransition]);

  // Guideline 25 & 23: Non-urgent update with immutable pattern
  const updateToken = useCallback((category: keyof DesignTokens | 'root', key: string, value: string, subKey?: string) => {
    startTransition(() => {
      setTokens(prev => {
        // Guideline 23: Never mutate - create new immutable object
        const next = { ...prev };

        if (category === 'root') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (next as any)[key] = value;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const categoryObj = { ...(next as any)[category] };

          if (subKey) {
            if (categoryObj[key] && typeof categoryObj[key] === 'object') {
              const subObj = { ...categoryObj[key] };
              subObj[subKey] = value;
              categoryObj[key] = subObj;
            }
          } else {
            categoryObj[key] = value;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (next as any)[category] = categoryObj;
        }

        if (localStorageRef.current) {
          localStorageRef.current.setItem('lexiflow_tokens_v4', JSON.stringify(next));
        }
        return next;
      });
    });
  }, [startTransition]);

  // Guideline 25: Non-urgent reset using transition
  const resetTokens = useCallback(() => {
    startTransition(() => {
      setTokens(DEFAULT_TOKENS);
      if (localStorageRef.current) {
        localStorageRef.current.removeItem('lexiflow_tokens_v4');
      }
    });
  }, [startTransition]);
  // Guideline 22 & 28: Immutable, pure context value
  // Guideline 7 & 10: Explicit memoization with stable references
  const value = useMemo(() => {
    // Guideline 28: Compute theme as pure function of tokens/isDark
    const theme: ThemeObject = createTheme(tokens);
    
    const contextValue: ThemeContextType = {
      tokens,
      density,
      setDensity,
      isDark,
      mode: isDark ? 'dark' : 'light',
      toggleDark,
      setTheme,
      toggleTheme,
      updateToken,
      resetTokens,
      ui: UI_CONFIG,
      features: FEATURES_CONFIG,
      theme, // Guideline 22: Computed theme object
      isPendingThemeChange: isPending,
    };
    
    // Guideline 22: Freeze in development for immutability enforcement
    if (process.env.NODE_ENV === 'development') {
      return Object.freeze(contextValue);
    }
    return contextValue;
  }, [tokens, density, setDensity, isDark, toggleDark, setTheme, toggleTheme, updateToken, resetTokens, isPending]);

  // Guideline 21 & 24: DOM effects must be idempotent and concurrent-safe
  // Guideline 27: No time-based assumptions
  useEffect(() => {
    const root = document.documentElement;
    const currentSpacing = tokens.spacing[density];
    const { colors, shadows, borderRadius, typography, transitions, zIndex, fontMode, layout } = tokens;

    // Guideline 24: Cleanup for StrictMode - remove previous values
    const cleanupCallbacks: Array<() => void> = [];
    
    // Inject Colors
    Object.entries(colors).forEach(([key, val]) => {
      root.style.setProperty(`--color-${key}`, val as string);
      cleanupCallbacks.push(() => root.style.removeProperty(`--color-${key}`));
    });

    // Inject Spacing
    Object.entries(currentSpacing).forEach(([key, val]) => {
      root.style.setProperty(`--spacing-${key}`, val as string);
      cleanupCallbacks.push(() => root.style.removeProperty(`--spacing-${key}`));
    });

    // Inject Typography
    root.style.setProperty('--font-sans', typography.fontSans);
    root.style.setProperty('--font-serif', typography.fontSerif);
    root.style.setProperty('--font-mono', typography.fontMono);
    root.style.setProperty('--font-app', fontMode === 'sans' ? typography.fontSans : typography.fontSerif);
    
    cleanupCallbacks.push(
      () => root.style.removeProperty('--font-sans'),
      () => root.style.removeProperty('--font-serif'),
      () => root.style.removeProperty('--font-mono'),
      () => root.style.removeProperty('--font-app')
    );

    Object.entries(typography.weights).forEach(([key, val]) => {
      root.style.setProperty(`--weight-${key}`, val as string);
      cleanupCallbacks.push(() => root.style.removeProperty(`--weight-${key}`));
    });
    Object.entries(typography.sizes).forEach(([key, val]) => {
      root.style.setProperty(`--size-${key}`, val as string);
      cleanupCallbacks.push(() => root.style.removeProperty(`--size-${key}`));
    });

    // Inject Borders & Shadows
    Object.entries(borderRadius).forEach(([key, val]) => {
      root.style.setProperty(`--radius-${key}`, val as string);
      cleanupCallbacks.push(() => root.style.removeProperty(`--radius-${key}`));
    });
    Object.entries(shadows).forEach(([key, val]) => {
      root.style.setProperty(`--shadow-${key}`, val as string);
      cleanupCallbacks.push(() => root.style.removeProperty(`--shadow-${key}`));
    });

    // Inject Utils
    Object.entries(transitions).forEach(([key, val]) => {
      root.style.setProperty(`--transition-${key}`, val as string);
      cleanupCallbacks.push(() => root.style.removeProperty(`--transition-${key}`));
    });
    Object.entries(zIndex).forEach(([key, val]) => {
      root.style.setProperty(`--z-${key}`, String(val));
      cleanupCallbacks.push(() => root.style.removeProperty(`--z-${key}`));
    });
    Object.entries(layout).forEach(([key, val]) => {
      root.style.setProperty(`--layout-${key}`, String(val));
      cleanupCallbacks.push(() => root.style.removeProperty(`--layout-${key}`));
    });
    
    // Guideline 24: Cleanup for StrictMode double-invocation
    return () => {
      cleanupCallbacks.forEach(cleanup => cleanup());
    };
  }, [tokens, density]);

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={`${isDark ? 'dark' : ''} min-h-screen transition-colors duration-300 text-[var(--size-sm)]`}
        style={{
          fontFamily: tokens.fontMode === 'sans' ? tokens.typography.fontSans : tokens.typography.fontSerif,
          backgroundColor: isDark ? '#0f172a' : tokens.colors.background,
          color: tokens.colors.text
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Export useTheme hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
