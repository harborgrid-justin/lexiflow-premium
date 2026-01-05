import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TOKENS, DesignTokens, ThemeDensity } from '../../components/theme/tokens';

interface ThemeContextType {
  tokens: DesignTokens;
  density: ThemeDensity;
  setDensity: (d: ThemeDensity) => void;
  isDark: boolean;
  toggleDark: () => void;
  updateToken: (category: keyof DesignTokens | 'root', key: string, value: string, subKey?: string) => void;
  resetTokens: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
    return (saved as ThemeDensity) || 'normal'; // Default to normal to match AdminPanel
  });

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('lexiflow_dark') === 'true';
  });

  const setDensity = (d: ThemeDensity) => {
    setDensityState(d);
    localStorage.setItem('lexiflow_density', d);
  };

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('lexiflow_dark', String(next));
      return next;
    });
  };

  const updateToken = (category: keyof DesignTokens | 'root', key: string, value: string, subKey?: string) => {
    setTokens(prev => {
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

      localStorage.setItem('lexiflow_tokens_v4', JSON.stringify(next));
      return next;
    });
  };

  const resetTokens = () => {
    setTokens(DEFAULT_TOKENS);
    localStorage.removeItem('lexiflow_tokens_v4');
  };

  const value = useMemo(() => ({
    tokens,
    density,
    setDensity,
    isDark,
    toggleDark,
    updateToken,
    resetTokens
  }), [tokens, density, isDark]);

  useEffect(() => {
    const root = document.documentElement;
    const currentSpacing = tokens.spacing[density];
    const { colors, shadows, borderRadius, typography, transitions, zIndex, fontMode } = tokens;

    // Inject Colors
    Object.entries(colors).forEach(([key, val]) => {
      root.style.setProperty(`--color-${key}`, val as string);
    });

    // Inject Spacing
    Object.entries(currentSpacing).forEach(([key, val]) => {
      root.style.setProperty(`--spacing-${key}`, val as string);
    });

    // Inject Typography
    root.style.setProperty('--font-sans', typography.fontSans);
    root.style.setProperty('--font-serif', typography.fontSerif);
    root.style.setProperty('--font-mono', typography.fontMono);

    // Set the Global App Font
    root.style.setProperty('--font-app', fontMode === 'sans' ? typography.fontSans : typography.fontSerif);

    Object.entries(typography.weights).forEach(([key, val]) => {
      root.style.setProperty(`--weight-${key}`, val as string);
    });
    Object.entries(typography.sizes).forEach(([key, val]) => {
      root.style.setProperty(`--size-${key}`, val as string);
    });

    // Inject Borders & Shadows
    Object.entries(borderRadius).forEach(([key, val]) => {
      root.style.setProperty(`--radius-${key}`, val as string);
    });
    Object.entries(shadows).forEach(([key, val]) => {
      root.style.setProperty(`--shadow-${key}`, val as string);
    });

    // Inject Utils
    Object.entries(transitions).forEach(([key, val]) => {
      root.style.setProperty(`--transition-${key}`, val as string);
    });
    Object.entries(zIndex).forEach(([key, val]) => {
      root.style.setProperty(`--z-${key}`, val as string);
    });

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

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');

  // Compatibility layer for AppProviders
  const theme = {
    surface: {
      default: 'bg-surface',
      raised: 'bg-surface',
      highlight: 'bg-primary-light',
      paper: 'bg-surface',
    },
    border: {
      default: 'border-border',
      light: 'border-border-light',
      focused: 'ring-2 ring-primary',
      error: 'border-error',
    },
    primary: {
      DEFAULT: 'bg-primary',
      light: 'bg-primary-light',
      dark: 'bg-primary-dark',
      text: 'text-primary',
    },
    text: {
      primary: 'text-text',
      secondary: 'text-text-muted',
      tertiary: 'text-text-muted/70',
      inverse: 'text-white',
    },
    status: {
      success: { bg: 'bg-success', text: 'text-success', icon: 'text-success', border: 'border-success' },
      error: { bg: 'bg-error', text: 'text-error', icon: 'text-error', border: 'border-error' },
      warning: { bg: 'bg-warning', text: 'text-warning', icon: 'text-warning', border: 'border-warning' },
      info: { bg: 'bg-info', text: 'text-info', icon: 'text-info', border: 'border-info' },
    },
    action: {
      primary: { bg: 'bg-primary', text: 'text-white', hover: 'hover:bg-primary-dark', border: 'border-primary' },
      secondary: { bg: 'bg-secondary', text: 'text-white', hover: 'hover:opacity-90', border: 'border-secondary' },
      ghost: { bg: 'bg-transparent', text: 'text-text', hover: 'hover:bg-surface' },
      danger: { bg: 'bg-error', text: 'text-white', hover: 'hover:opacity-90', border: 'border-error' },
    },
    chart: {
      grid: context.tokens.colors.border,
      text: context.tokens.colors.textMuted,
      colors: {
        primary: context.tokens.colors.primary,
        secondary: context.tokens.colors.secondary,
        success: context.tokens.colors.success,
        warning: context.tokens.colors.warning,
        danger: context.tokens.colors.error,
        info: context.tokens.colors.info,
      },
      tooltip: {
        bg: context.tokens.colors.surface,
        border: context.tokens.colors.border,
        text: context.tokens.colors.text,
      }
    }
  };

  const toggleTheme = context.toggleDark;
  const mode = context.isDark ? 'dark' : 'light';
  const setTheme = (newMode: 'light' | 'dark') => {
    if ((newMode === 'dark' && !context.isDark) || (newMode === 'light' && context.isDark)) {
      context.toggleDark();
    }
  };

  return { ...context, theme, toggleTheme, mode, setTheme };
};
