import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TOKENS, DesignTokens, ThemeDensity } from '../../components/theme/tokens';

export type ThemeObject = {
  background: string;
  surface: {
    default: string;
    raised: string;
    highlight: string;
    paper: string;
    overlay: string;
    input: string;
    active: string;
    primary: string;
    secondary: string;
  };
  border: {
    default: string;
    light: string;
    focused: string;
    error: string;
    subtle: string;
    primary: string;
  };
  primary: {
    DEFAULT: string;
    light: string;
    dark: string;
    text: string;
    border: string;
    hover: string;
    main: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    link: string;
    code: string;
  };
  status: {
    success: { bg: string; text: string; icon: string; border: string };
    error: { bg: string; text: string; icon: string; border: string };
    warning: { bg: string; text: string; icon: string; border: string };
    info: { bg: string; text: string; icon: string; border: string };
    neutral: { bg: string; text: string; icon: string; border: string };
  };
  action: {
    primary: { bg: string; text: string; hover: string; border: string };
    secondary: { bg: string; text: string; hover: string; border: string };
    ghost: { bg: string; text: string; hover: string; border: string };
    danger: { bg: string; text: string; hover: string; border: string };
  };
  button: {
    primary: string;
    secondary: string;
    ghost: string;
  };
  input: {
    default: string;
  };
  focus: {
    ring: string;
  };
  badge: {
    default: string;
  };
  backdrop: string;
  chart: {
    grid: string;
    text: string;
    colors: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      danger: string;
      info: string;
      neutral: string;
      blue: string;
      emerald: string;
      purple: string;
    };
    tooltip: {
      bg: string;
      border: string;
      text: string;
    };
  };
};

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
  const theme: ThemeObject = {
    background: context.tokens.colors.background,
    surface: {
      default: context.tokens.colors.surface,
      raised: context.tokens.colors.surface,
      highlight: context.tokens.colors.primaryLight,
      paper: context.tokens.colors.surface,
      overlay: context.tokens.colors.surface,
      input: '#ffffff',
      active: context.tokens.colors.primaryLight,
      primary: context.tokens.colors.primary,
      secondary: context.tokens.colors.surface,
    },
    border: {
      default: context.tokens.colors.border,
      light: context.tokens.colors.borderLight,
      focused: context.tokens.colors.primary,
      error: context.tokens.colors.error,
      subtle: context.tokens.colors.borderLight,
      primary: context.tokens.colors.primary,
    },
    primary: {
      DEFAULT: context.tokens.colors.primary,
      light: context.tokens.colors.primaryLight,
      dark: context.tokens.colors.primaryDark,
      text: context.tokens.colors.text,
      border: context.tokens.colors.primary,
      hover: context.tokens.colors.primaryDark,
      main: context.tokens.colors.primary,
    },
    text: {
      primary: context.tokens.colors.text,
      secondary: context.tokens.colors.textMuted,
      tertiary: context.tokens.colors.textMuted,
      inverse: '#ffffff',
      link: context.tokens.colors.secondary,
      code: context.tokens.colors.text,
    },
    status: {
      success: { bg: context.tokens.colors.success, text: context.tokens.colors.success, icon: context.tokens.colors.success, border: context.tokens.colors.success },
      error: { bg: context.tokens.colors.error, text: context.tokens.colors.error, icon: context.tokens.colors.error, border: context.tokens.colors.error },
      warning: { bg: context.tokens.colors.warning, text: context.tokens.colors.warning, icon: context.tokens.colors.warning, border: context.tokens.colors.warning },
      info: { bg: context.tokens.colors.info, text: context.tokens.colors.info, icon: context.tokens.colors.info, border: context.tokens.colors.info },
      neutral: { bg: context.tokens.colors.textMuted, text: context.tokens.colors.textMuted, icon: context.tokens.colors.textMuted, border: context.tokens.colors.border },
    },
    action: {
      primary: { bg: context.tokens.colors.primary, text: '#ffffff', hover: context.tokens.colors.primaryDark, border: context.tokens.colors.primary },
      secondary: { bg: context.tokens.colors.secondary, text: '#ffffff', hover: context.tokens.colors.secondary, border: context.tokens.colors.secondary },
      ghost: { bg: 'transparent', text: context.tokens.colors.text, hover: context.tokens.colors.surface, border: 'transparent' },
      danger: { bg: context.tokens.colors.error, text: '#ffffff', hover: context.tokens.colors.error, border: context.tokens.colors.error },
    },
    button: {
      primary: context.tokens.colors.primary,
      secondary: context.tokens.colors.secondary,
      ghost: 'transparent',
    },
    input: {
      default: '#ffffff',
    },
    focus: {
      ring: context.tokens.colors.primary,
    },
    badge: {
      default: context.tokens.colors.primaryLight,
    },
    backdrop: 'rgba(0, 0, 0, 0.5)',
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
        neutral: context.tokens.colors.textMuted,
        blue: context.tokens.colors.info,
        emerald: context.tokens.colors.success,
        purple: context.tokens.colors.accent,
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
