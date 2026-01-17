/**
 * Design Tokens for LexiFlow Enterprise
 *
 * Provides the raw color palette and semantic token mappings.
 * Used by ThemeProvider to generate the active ThemeObject.
 */

import { ThemeObject } from "./types";

export type ThemeMode = "light" | "dark" | "system";
export type ThemeDensity = "compact" | "normal" | "comfortable" | "spacious";
export type FontMode = "sans" | "serif" | "mono";

export interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl"?: string;
  gutter?: string;
  [key: string]: string;
}

export interface TypographySizeScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  [key: string]: string;
}

export interface TypographyWeightScale {
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  [key: string]: string | number;
}

export interface LineHeightScale {
  tight: string;
  snug: string;
  normal: string;
  relaxed: string;
  loose: string;
  [key: string]: string;
}

export interface LetterSpacingScale {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  [key: string]: string;
}

export interface ShadowScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  [key: string]: string;
}

export interface BorderRadiusScale {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
  [key: string]: string;
}

export interface TransitionScale {
  fast: string;
  normal: string;
  slow: string;
  slower: string;
  bounce: string;
  spring: string;
  fade: string;
  [key: string]: string;
}

export interface ZIndexScale {
  base: number;
  dropdown: number;
  overlay: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
  max: number;
  [key: string]: number;
}

export interface LayoutScale {
  sidebarWidth: string;
  sidebarCollapsedWidth: string;
  topbarHeight: string;
  headerHeight: string;
  footerHeight: string;
  contentMaxWidth: string;
  pagePadding: string;
  cardPadding: string;
  formWidth: string;
  drawerWidth: string;
  panelWidth: string;
  navHeight: string;
  rowHeight: string;
  gap: string;
  [key: string]: string | number;
}

export interface AnimationDurationScale {
  fast: string;
  normal: string;
  slow: string;
  slower: string;
  [key: string]: string;
}

export interface AnimationEasingScale {
  linear: string;
  ease: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;
  bounce: string;
  [key: string]: string;
}

export interface AnimationKeyframesScale {
  fadeIn: string;
  fadeOut: string;
  slideUp: string;
  slideDown: string;
  scaleIn: string;
  scaleOut: string;
  [key: string]: string;
}

export interface EffectsScale {
  blur: Record<string, string>;
  opacity: Record<string, string>;
  backdrop: Record<string, string>;
}

export interface DesignTokens {
  mode: ThemeMode;
  density: ThemeDensity;
  fontMode: FontMode;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    borderLight: string;
    text: string;
    textMuted: string;
    charts: {
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
      [key: string]: string;
    };
    annotations: {
      note: string;
      highlight: string;
      warning: string;
      info: string;
      [key: string]: string;
    };
    gradients: {
      primary: string;
      secondary: string;
      accent: string;
      success: string;
      warning: string;
      info: string;
      [key: string]: string;
    };
  };
  spacing: {
    compact: SpacingScale;
    normal: SpacingScale;
    comfortable: SpacingScale;
    spacious: SpacingScale;
    layout: SpacingScale;
  };
  typography: {
    fontSans: string;
    fontSerif: string;
    fontMono: string;
    weights: TypographyWeightScale;
    sizes: TypographySizeScale;
    fontSize: TypographySizeScale;
    fontWeight: TypographyWeightScale;
    lineHeight: LineHeightScale;
    letterSpacing: LetterSpacingScale;
  };
  shadows: ShadowScale;
  borderRadius: BorderRadiusScale;
  transitions: TransitionScale;
  zIndex: ZIndexScale;
  layout: LayoutScale;
  animations: {
    duration: AnimationDurationScale;
    easing: AnimationEasingScale;
    keyframes: AnimationKeyframesScale;
  };
  effects: EffectsScale;
  semantic: Record<string, string>;
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
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
  emerald: {
    500: "#10b981",
  },
  amber: {
    400: "#fbbf24",
    500: "#f59e0b",
  },
  rose: {
    400: "#fb7185",
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
    base: "#ffffff",
    raised: PALETTE.slate[50],
    elevated: PALETTE.slate[50],
    highlight: PALETTE.slate[100],
    paper: "#ffffff",
    overlay: "rgba(255, 255, 255, 0.95)",
    input: "#ffffff",
    muted: PALETTE.slate[100],
    hover: PALETTE.slate[100],
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
    base: PALETTE.slate[900],
    raised: PALETTE.slate[800],
    elevated: PALETTE.slate[800],
    highlight: PALETTE.slate[700],
    paper: PALETTE.slate[900],
    overlay: "rgba(15, 23, 42, 0.95)",
    input: PALETTE.slate[900],
    muted: PALETTE.slate[800],
    hover: PALETTE.slate[800],
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

const BASE_SPACING = {
  compact: {
    xs: "0.25rem",
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
    gutter: "0.75rem",
  },
  normal: {
    xs: "0.375rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "3rem",
    gutter: "1rem",
  },
  comfortable: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    gutter: "1.5rem",
  },
  spacious: {
    xs: "0.75rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
    "2xl": "4rem",
    "3xl": "5rem",
    gutter: "2rem",
  },
  layout: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
    "2xl": "4rem",
  },
};

const BASE_TYPOGRAPHY = {
  fontSans: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
  fontSerif: "Merriweather, Georgia, serif",
  fontMono: "JetBrains Mono, SFMono-Regular, Menlo, monospace",
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: "1.1",
    snug: "1.25",
    normal: "1.5",
    relaxed: "1.75",
    loose: "2",
  },
  letterSpacing: {
    tighter: "-0.02em",
    tight: "-0.01em",
    normal: "0em",
    wide: "0.02em",
    wider: "0.04em",
  },
};

const BASE_SHADOWS = {
  xs: "0 1px 2px rgba(15, 23, 42, 0.08)",
  sm: "0 1px 3px rgba(15, 23, 42, 0.12)",
  md: "0 4px 6px rgba(15, 23, 42, 0.16)",
  lg: "0 10px 15px rgba(15, 23, 42, 0.18)",
  xl: "0 20px 25px rgba(15, 23, 42, 0.2)",
  xxl: "0 25px 50px rgba(15, 23, 42, 0.25)",
};

const BASE_BORDER_RADIUS = {
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
};

const BASE_TRANSITIONS = {
  fast: "150ms ease",
  normal: "250ms ease",
  slow: "400ms ease",
  slower: "600ms ease",
  bounce: "300ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  spring: "400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  fade: "200ms ease",
};

const BASE_Z_INDEX = {
  base: 0,
  dropdown: 1000,
  overlay: 1100,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
  toast: 1500,
  max: 2147483647,
};

const BASE_LAYOUT = {
  sidebarWidth: "280px",
  sidebarCollapsedWidth: "80px",
  topbarHeight: "64px",
  headerHeight: "56px",
  footerHeight: "48px",
  contentMaxWidth: "1280px",
  pagePadding: "24px",
  cardPadding: "16px",
  formWidth: "640px",
  drawerWidth: "360px",
  panelWidth: "320px",
  navHeight: "48px",
  rowHeight: "40px",
  gap: "16px",
};

const BASE_ANIMATIONS = {
  duration: {
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
    slower: "600ms",
  },
  easing: {
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    bounce: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  },
  keyframes: {
    fadeIn: "fade-in",
    fadeOut: "fade-out",
    slideUp: "slide-up",
    slideDown: "slide-down",
    scaleIn: "scale-in",
    scaleOut: "scale-out",
  },
};

const BASE_EFFECTS = {
  blur: {
    sm: "4px",
    md: "8px",
    lg: "16px",
    xl: "24px",
  },
  opacity: {
    low: "0.4",
    medium: "0.7",
    high: "0.9",
    disabled: "0.5",
  },
  backdrop: {
    light: "blur(4px)",
    medium: "blur(8px)",
    heavy: "blur(16px)",
    glass: "blur(12px) saturate(180%)",
  },
};

const BASE_SEMANTIC = {
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
  primary: "primary",
  secondary: "secondary",
  accent: "accent",
};

const LIGHT_COLORS = {
  primary: PALETTE.blue[600],
  primaryDark: PALETTE.blue[700],
  primaryLight: PALETTE.blue[500],
  secondary: PALETTE.slate[700],
  accent: PALETTE.violet[500],
  success: PALETTE.emerald[500],
  warning: PALETTE.amber[500],
  error: PALETTE.rose[500],
  info: PALETTE.blue[500],
  background: PALETTE.slate[50],
  surface: "#ffffff",
  surfaceHover: PALETTE.slate[100],
  border: PALETTE.slate[200],
  borderLight: PALETTE.slate[100],
  text: PALETTE.slate[900],
  textMuted: PALETTE.slate[500],
  charts: {
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
  annotations: {
    note: PALETTE.blue[500],
    highlight: PALETTE.amber[500],
    warning: PALETTE.rose[500],
    info: PALETTE.slate[500],
  },
  gradients: {
    primary: `linear-gradient(135deg, ${PALETTE.blue[500]}, ${PALETTE.blue[700]})`,
    secondary: `linear-gradient(135deg, ${PALETTE.slate[200]}, ${PALETTE.slate[400]})`,
    accent: `linear-gradient(135deg, ${PALETTE.violet[500]}, ${PALETTE.blue[500]})`,
    success: `linear-gradient(135deg, ${PALETTE.emerald[500]}, ${PALETTE.blue[500]})`,
    warning: `linear-gradient(135deg, ${PALETTE.amber[500]}, ${PALETTE.rose[500]})`,
    info: `linear-gradient(135deg, ${PALETTE.blue[500]}, ${PALETTE.slate[400]})`,
  },
};

const DARK_COLORS = {
  primary: PALETTE.blue[500],
  primaryDark: PALETTE.blue[600],
  primaryLight: PALETTE.blue[400],
  secondary: PALETTE.slate[300],
  accent: PALETTE.violet[500],
  success: PALETTE.emerald[500],
  warning: PALETTE.amber[500],
  error: PALETTE.rose[500],
  info: PALETTE.blue[400],
  background: PALETTE.slate[950],
  surface: PALETTE.slate[900],
  surfaceHover: PALETTE.slate[800],
  border: PALETTE.slate[700],
  borderLight: PALETTE.slate[800],
  text: PALETTE.slate[50],
  textMuted: PALETTE.slate[400],
  charts: {
    primary: PALETTE.blue[500],
    secondary: PALETTE.slate[500],
    success: PALETTE.emerald[500],
    warning: PALETTE.amber[500],
    danger: PALETTE.rose[500],
    info: PALETTE.blue[400],
    neutral: PALETTE.slate[500],
    blue: PALETTE.blue[500],
    emerald: PALETTE.emerald[500],
    purple: PALETTE.violet[500],
  },
  annotations: {
    note: PALETTE.blue[400],
    highlight: PALETTE.amber[400],
    warning: PALETTE.rose[400],
    info: PALETTE.slate[400],
  },
  gradients: {
    primary: `linear-gradient(135deg, ${PALETTE.blue[500]}, ${PALETTE.blue[700]})`,
    secondary: `linear-gradient(135deg, ${PALETTE.slate[700]}, ${PALETTE.slate[900]})`,
    accent: `linear-gradient(135deg, ${PALETTE.violet[500]}, ${PALETTE.blue[500]})`,
    success: `linear-gradient(135deg, ${PALETTE.emerald[500]}, ${PALETTE.blue[500]})`,
    warning: `linear-gradient(135deg, ${PALETTE.amber[500]}, ${PALETTE.rose[500]})`,
    info: `linear-gradient(135deg, ${PALETTE.blue[400]}, ${PALETTE.slate[600]})`,
  },
};

const BASE_TOKENS = {
  spacing: BASE_SPACING,
  typography: BASE_TYPOGRAPHY,
  shadows: BASE_SHADOWS,
  borderRadius: BASE_BORDER_RADIUS,
  transitions: BASE_TRANSITIONS,
  zIndex: BASE_Z_INDEX,
  layout: BASE_LAYOUT,
  animations: BASE_ANIMATIONS,
  effects: BASE_EFFECTS,
  semantic: BASE_SEMANTIC,
};

const LIGHT_TOKENS: DesignTokens = {
  mode: "light",
  density: "normal",
  fontMode: "sans",
  colors: LIGHT_COLORS,
  ...BASE_TOKENS,
};

const DARK_TOKENS: DesignTokens = {
  mode: "dark",
  density: "normal",
  fontMode: "sans",
  colors: DARK_COLORS,
  ...BASE_TOKENS,
};

export const DEFAULT_TOKENS: DesignTokens = LIGHT_TOKENS;

export const getTokens = (
  mode: ThemeMode = "light",
  density: ThemeDensity = "normal",
  fontMode: FontMode = "sans",
): DesignTokens => {
  const base = mode === "dark" ? DARK_TOKENS : LIGHT_TOKENS;
  return {
    ...base,
    mode,
    density,
    fontMode,
  };
};
