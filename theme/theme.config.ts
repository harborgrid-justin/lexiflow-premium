/**
 * theme.config.ts
 * Theme configuration with light, dark, and custom theme definitions
 * Based on design system principles and brand guidelines
 */

// ============================================================================
// Types
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
  shadows: Shadows;
  zIndex: ZIndex;
  breakpoints: Breakpoints;
  transitions: Transitions;
}

export interface ThemeColors {
  // Base colors
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;

  // Background colors
  background: string;
  surface: string;
  overlay: string;

  // Text colors
  text: string;
  textSecondary: string;
  textDisabled: string;

  // Border colors
  border: string;
  borderLight: string;
  borderHeavy: string;

  // Interactive states
  hover: string;
  active: string;
  focus: string;
  disabled: string;

  // Legal-specific colors
  legal: {
    case: string;
    document: string;
    evidence: string;
    deadline: string;
    billing: string;
  };

  // Status colors
  status: {
    draft: string;
    pending: string;
    approved: string;
    rejected: string;
    archived: string;
  };
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface Typography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    xxxl: string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface Shadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
}

export interface ZIndex {
  dropdown: number;
  sticky: number;
  fixed: number;
  modalBackdrop: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface Transitions {
  fast: string;
  normal: string;
  slow: string;
}

export interface ThemeConfig {
  enableTransitions: boolean;
  persistPreference: boolean;
  respectSystemPreference: boolean;
}

// ============================================================================
// Light Theme
// ============================================================================

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    // Base colors
    primary: '#2563eb',
    secondary: '#7c3aed',
    accent: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Background colors
    background: '#ffffff',
    surface: '#f9fafb',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Text colors
    text: '#111827',
    textSecondary: '#6b7280',
    textDisabled: '#9ca3af',

    // Border colors
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    borderHeavy: '#d1d5db',

    // Interactive states
    hover: '#f3f4f6',
    active: '#e5e7eb',
    focus: '#dbeafe',
    disabled: '#f9fafb',

    // Legal-specific colors
    legal: {
      case: '#8b5cf6',
      document: '#3b82f6',
      evidence: '#06b6d4',
      deadline: '#ef4444',
      billing: '#10b981',
    },

    // Status colors
    status: {
      draft: '#9ca3af',
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
      archived: '#6b7280',
    },
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      xxl: '1.5rem',    // 24px
      xxxl: '2rem',     // 32px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
};

// ============================================================================
// Dark Theme
// ============================================================================

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    // Base colors
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Background colors
    background: '#111827',
    surface: '#1f2937',
    overlay: 'rgba(0, 0, 0, 0.75)',

    // Text colors
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    textDisabled: '#6b7280',

    // Border colors
    border: '#374151',
    borderLight: '#4b5563',
    borderHeavy: '#6b7280',

    // Interactive states
    hover: '#374151',
    active: '#4b5563',
    focus: '#1e3a8a',
    disabled: '#1f2937',

    // Legal-specific colors
    legal: {
      case: '#a78bfa',
      document: '#60a5fa',
      evidence: '#22d3ee',
      deadline: '#f87171',
      billing: '#34d399',
    },

    // Status colors
    status: {
      draft: '#9ca3af',
      pending: '#fbbf24',
      approved: '#34d399',
      rejected: '#f87171',
      archived: '#9ca3af',
    },
  },
  spacing: lightTheme.spacing,
  typography: lightTheme.typography,
  borderRadius: lightTheme.borderRadius,
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  },
  zIndex: lightTheme.zIndex,
  breakpoints: lightTheme.breakpoints,
  transitions: lightTheme.transitions,
};

// ============================================================================
// Theme Getter
// ============================================================================

export function getTheme(mode: 'light' | 'dark'): Theme {
  return mode === 'light' ? lightTheme : darkTheme;
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  light: lightTheme,
  dark: darkTheme,
  getTheme,
};
