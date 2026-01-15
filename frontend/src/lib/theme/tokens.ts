/**
 * Design Tokens for LexiFlow Enterprise
 *
 * Provides the raw color palette and semantic token mappings.
 * Used by ThemeProvider to generate the active ThemeObject.
 */

import { ThemeObject } from "./ThemeContext.types";

export type ThemeMode = "light" | "dark" | "system";
export type ThemeDensity = "compact" | "comfortable" | "spacious";
export type FontMode = "sans" | "serif" | "mono";

export interface DesignTokens {
  mode: ThemeMode;
  density: ThemeDensity;
  font: FontMode;
}

// TailWind Slate-based palette
const PALETTE = {
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  blue: {
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
  emerald: {
    500: "#10b981",
  },
  amber: {
    500: "#f59e0b",
  },
  rose: {
    500: "#f43f5e",
  },
  violet: {
    500: "#8b5cf6",
  },
};

export const DEFAULT_LIGHT_THEME: ThemeObject = {
  background: PALETTE.slate[50], // surface-ground
  surface: {
    default: "#ffffff",
    raised: PALETTE.slate[50],
    highlight: PALETTE.slate[100],
    paper: "#ffffff",
    overlay: "rgba(255, 255, 255, 0.95)",
    input: "#ffffff",
    active: PALETTE.slate[100],
    primary: PALETTE.slate[50],
    secondary: PALETTE.slate[100],
    subtle: PALETTE.slate[50],
  },
  border: {
    default: PALETTE.slate[200],
    light: PALETTE.slate[100],
    focused: PALETTE.blue[500],
    error: PALETTE.rose[500],
    subtle: PALETTE.slate[100],
    primary: PALETTE.blue[500],
    input: (val, input, _, primary) => val || input || primary, // Placeholder function
  },
  divide: {
    default: PALETTE.slate[200],
  },
  primary: {
    DEFAULT: PALETTE.blue[600],
    light: PALETTE.blue[500],
    dark: PALETTE.blue[700],
    text: "#ffffff",
    border: PALETTE.blue[600],
    hover: PALETTE.blue[700],
    main: PALETTE.blue[600],
  },
  text: {
    primary: PALETTE.slate[900],
    secondary: PALETTE.slate[600],
    tertiary: PALETTE.slate[400],
    inverse: "#ffffff",
    link: PALETTE.blue[600],
    code: PALETTE.slate[700],
    muted: PALETTE.slate[400],
    accent: PALETTE.violet[500],
    success: PALETTE.emerald[500],
    error: PALETTE.rose[500],
  },
  interactive: {
    primary: PALETTE.blue[600],
    success: PALETTE.emerald[500],
    hover: PALETTE.blue[700],
  },
  status: {
    success: {
      bg: "#ecfdf5",
      text: "#065f46",
      icon: "#10b981",
      border: "#a7f3d0",
    },
    error: {
      bg: "#fff1f2",
      text: "#9f1239",
      icon: "#f43f5e",
      border: "#fecdd3",
    },
    warning: {
      bg: "#fffbeb",
      text: "#92400e",
      icon: "#f59e0b",
      border: "#fde68a",
    },
    info: {
      bg: "#eff6ff",
      text: "#1e40af",
      icon: "#3b82f6",
      border: "#bfdbfe",
    },
    neutral: {
      bg: "#f8fafc",
      text: "#475569",
      icon: "#94a3b8",
      border: "#cbd5e1",
    },
  },
  action: {
    primary: {
      bg: PALETTE.blue[600],
      text: "#ffffff",
      hover: PALETTE.blue[700],
      border: "transparent",
    },
    secondary: {
      bg: "#ffffff",
      text: PALETTE.slate[700],
      hover: PALETTE.slate[50],
      border: PALETTE.slate[300],
    },
    ghost: {
      bg: "transparent",
      text: PALETTE.slate[600],
      hover: PALETTE.slate[100],
      border: "transparent",
    },
    danger: {
      bg: PALETTE.rose[500],
      text: "#ffffff",
      hover: "#e11d48",
      border: "transparent",
    },
  },
  button: {
    primary: PALETTE.blue[600],
    secondary: PALETTE.slate[100],
    ghost: "transparent",
  },
  input: {
    default: "#ffffff",
  },
  focus: {
    ring: PALETTE.blue[500],
  },
  badge: {
    default: PALETTE.slate[100],
  },
  backdrop: "rgba(0, 0, 0, 0.5)",
  chart: {
    grid: PALETTE.slate[200],
    text: PALETTE.slate[500],
    colors: {
      primary: PALETTE.blue[500],
      secondary: PALETTE.slate[400],
      success: PALETTE.emerald[500],
      warning: PALETTE.amber[500],
      danger: PALETTE.rose[500],
      info: PALETTE.blue[500],
      neutral: PALETTE.slate[400],
      blue: PALETTE.blue[500],
      emerald: PALETTE.emerald[500],
      purple: PALETTE.violet[500],
    },
    tooltip: {
      bg: "#ffffff",
      border: PALETTE.slate[200],
      text: PALETTE.slate[800],
    },
  },
  colors: {
    border: PALETTE.slate[200],
    textMuted: PALETTE.slate[500],
    info: PALETTE.blue[500],
    success: PALETTE.emerald[500],
    warning: PALETTE.amber[500],
    surface: "#ffffff",
    text: PALETTE.slate[900],
  },
  typography: {
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
    },
  },
  borderRadius: {
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
  },
};

export const DEFAULT_DARK_THEME: ThemeObject = {
  background: "#020617", // slate-950
  surface: {
    default: PALETTE.slate[900],
    raised: PALETTE.slate[800],
    highlight: PALETTE.slate[700],
    paper: PALETTE.slate[900],
    overlay: "rgba(15, 23, 42, 0.95)",
    input: PALETTE.slate[900],
    active: PALETTE.slate[800],
    primary: PALETTE.slate[900],
    secondary: PALETTE.slate[800],
    subtle: PALETTE.slate[900],
  },
  border: {
    default: PALETTE.slate[700],
    light: PALETTE.slate[800],
    focused: PALETTE.blue[500],
    error: PALETTE.rose[500],
    subtle: PALETTE.slate[800],
    primary: PALETTE.blue[500],
    input: (val, input, _, primary) => val || input || primary,
  },
  divide: {
    default: PALETTE.slate[700],
  },
  primary: {
    DEFAULT: PALETTE.blue[500],
    light: PALETTE.blue[400],
    dark: PALETTE.blue[600],
    text: "#ffffff",
    border: PALETTE.blue[500],
    hover: PALETTE.blue[600],
    main: PALETTE.blue[500],
  },
  text: {
    primary: PALETTE.slate[50], // Almost white
    secondary: PALETTE.slate[300], // Muted
    tertiary: PALETTE.slate[500], // Darker
    inverse: PALETTE.slate[900],
    link: PALETTE.blue[400],
    code: PALETTE.slate[300],
    muted: PALETTE.slate[500],
    accent: PALETTE.violet[500],
    success: PALETTE.emerald[500],
    error: PALETTE.rose[500],
  },
  interactive: {
    primary: PALETTE.blue[500],
    success: PALETTE.emerald[500],
    hover: PALETTE.blue[400],
  },
  status: {
    success: {
      bg: "rgba(16, 185, 129, 0.1)",
      text: "#6ee7b7",
      icon: "#34d399",
      border: "rgba(16, 185, 129, 0.2)",
    },
    error: {
      bg: "rgba(244, 63, 94, 0.1)",
      text: "#fda4af",
      icon: "#fb7185",
      border: "rgba(244, 63, 94, 0.2)",
    },
    warning: {
      bg: "rgba(245, 158, 11, 0.1)",
      text: "#fcd34d",
      icon: "#fbbf24",
      border: "rgba(245, 158, 11, 0.2)",
    },
    info: {
      bg: "rgba(59, 130, 246, 0.1)",
      text: "#93c5fd",
      icon: "#60a5fa",
      border: "rgba(59, 130, 246, 0.2)",
    },
    neutral: {
      bg: "rgba(148, 163, 184, 0.1)",
      text: "#cbd5e1",
      icon: "#94a3b8",
      border: "rgba(148, 163, 184, 0.2)",
    },
  },
  action: {
    primary: {
      bg: PALETTE.blue[500],
      text: "#ffffff",
      hover: PALETTE.blue[600],
      border: "transparent",
    },
    secondary: {
      bg: PALETTE.slate[800],
      text: PALETTE.slate[200],
      hover: PALETTE.slate[700],
      border: PALETTE.slate[600],
    },
    ghost: {
      bg: "transparent",
      text: PALETTE.slate[300],
      hover: PALETTE.slate[800],
      border: "transparent",
    },
    danger: {
      bg: PALETTE.rose[500],
      text: "#ffffff",
      hover: "#e11d48",
      border: "transparent",
    },
  },
  button: {
    primary: PALETTE.blue[500],
    secondary: PALETTE.slate[800],
    ghost: "transparent",
  },
  input: {
    default: PALETTE.slate[900],
  },
  focus: {
    ring: PALETTE.blue[500],
  },
  badge: {
    default: PALETTE.slate[800],
  },
  backdrop: "rgba(0, 0, 0, 0.75)",
  chart: {
    grid: PALETTE.slate[700],
    text: PALETTE.slate[400],
    colors: {
      primary: PALETTE.blue[500],
      secondary: PALETTE.slate[500],
      success: PALETTE.emerald[500],
      warning: PALETTE.amber[500],
      danger: PALETTE.rose[500],
      info: PALETTE.blue[500],
      neutral: PALETTE.slate[500],
      blue: PALETTE.blue[500],
      emerald: PALETTE.emerald[500],
      purple: PALETTE.violet[500],
    },
    tooltip: {
      bg: PALETTE.slate[800],
      border: PALETTE.slate[600],
      text: PALETTE.slate[200],
    },
  },
  colors: {
    border: PALETTE.slate[700],
    textMuted: PALETTE.slate[500],
    info: PALETTE.blue[500],
    success: PALETTE.emerald[500],
    warning: PALETTE.amber[500],
    surface: PALETTE.slate[900],
    text: PALETTE.slate[50],
  },
  typography: {
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
    },
  },
  borderRadius: {
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
  },
};

export const DEFAULT_TOKENS = {
  mode: "light",
  density: "comfortable",
  font: "sans",
} as DesignTokens;

export const getTokens = (mode: ThemeMode = "light"): ThemeObject => {
  if (mode === "dark") return DEFAULT_DARK_THEME;
  // System detection would go here, effectively defaulting to light for now
  return DEFAULT_LIGHT_THEME;
};
