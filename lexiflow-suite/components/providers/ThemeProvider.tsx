
import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';

export type ThemeDensity = 'compact' | 'normal' | 'comfortable';
export type FontMode = 'sans' | 'serif';

interface DesignTokens {
  fontMode: FontMode;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
    borderLight: string;
    text: string;
    textMuted: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: Record<ThemeDensity, {
    unit: string;
    gutter: string;
    container: string;
    inputPadding: string;
    cardPadding: string;
    rowHeight: string;
  }>;
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  typography: {
    fontSans: string;
    fontMono: string;
    fontSerif: string;
    weights: {
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
      black: string;
    };
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  zIndex: {
    base: string;
    header: string;
    sidebar: string;
    modal: string;
    overlay: string;
  };
}

const DEFAULT_TOKENS: DesignTokens = {
  fontMode: 'sans',
  colors: {
    primary: '#0f172a', // Slate 900 (Enterprise Dark)
    primaryDark: '#020617', // Slate 950
    primaryLight: '#f1f5f9', // Slate 100
    secondary: '#2563eb', // Blue 600 (Action Blue)
    accent: '#6366f1', // Indigo 500
    background: '#f8fafc', // Slate 50
    surface: '#ffffff', // White
    border: '#e2e8f0', // Slate 200
    borderLight: '#f8fafc', // Slate 50
    text: '#0f172a', // Slate 900
    textMuted: '#64748b', // Slate 500
    success: '#10b981', // Emerald 500
    warning: '#f59e0b', // Amber 500
    error: '#ef4444', // Red 500
    info: '#3b82f6', // Blue 500
  },
  spacing: {
    compact: {
      unit: '4px',
      gutter: '16px',
      container: '1280px',
      inputPadding: '6px 12px',
      cardPadding: '12px',
      rowHeight: '32px'
    },
    normal: {
      unit: '6px',
      gutter: '24px', // Matches AdminPanel px-6
      container: '1920px', // Matches AdminPanel max-w
      inputPadding: '8px 16px',
      cardPadding: '24px',
      rowHeight: '48px'
    },
    comfortable: {
      unit: '8px',
      gutter: '32px',
      container: '2400px',
      inputPadding: '12px 24px',
      cardPadding: '32px',
      rowHeight: '64px'
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem', // Matches rounded-xl often used
    xl: '1rem', // Matches rounded-2xl often used
    full: '9999px',
  },
  typography: {
    fontSans: "'Inter', sans-serif",
    fontSerif: "'Merriweather', serif",
    fontMono: "'JetBrains Mono', monospace",
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600', 
      bold: '700',     
      black: '900',    
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    }
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  zIndex: {
    base: '0',
    header: '40',
    sidebar: '50',
    modal: '100',
    overlay: '90',
  }
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
    try {
        const saved = localStorage.getItem('lexiflow_tokens_v4');
        return saved ? JSON.parse(saved) : DEFAULT_TOKENS;
    } catch (e) {
        return DEFAULT_TOKENS;
    }
  });

  const [density, setDensityState] = useState<ThemeDensity>(() => {
    const saved = localStorage.getItem('lexiflow_density');
    return (saved as ThemeDensity) || 'normal'; // Default to normal to match AdminPanel
  });

  const [isDark, setIsDark] = useState(() => {
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
        (next as any)[key] = value;
      } else {
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
  return context;
};
