/**
 * @deprecated This module has been moved to @/features/theme/tokens
 * Please update your imports:
 *
 * Old: import { ThemeMode, tokens } from '@/shared/theme/tokens';
 * New: import { ThemeMode, DEFAULT_LIGHT_TOKENS } from '@/features/theme';
 *
 * This re-export will be removed in a future version.
 */

// Re-export everything from centralized location
export * from "@/features/theme/tokens";
export type { FontMode, ThemeMode, ThemeDensity } from "@/features/theme/tokens";

export interface DesignTokens {
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
  spacing: Record<
    ThemeDensity,
    {
      unit: string;
      gutter: string;
      container: string;
      inputPadding: string;
      cardPadding: string;
      rowHeight: string;
    }
  >;
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
      "2xl": string;
      "3xl": string;
    };
    // Aliases for compatibility
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      "4xl": string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
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

export const DEFAULT_TOKENS: DesignTokens = {
  fontMode: "sans",
  colors: {
    primary: "#0f172a", // Slate 900 (Enterprise Dark)
    primaryDark: "#020617", // Slate 950
    primaryLight: "#f1f5f9", // Slate 100
    secondary: "#2563eb", // Blue 600 (Action Blue)
    accent: "#6366f1", // Indigo 500
    background: "#f8fafc", // Slate 50
    surface: "#ffffff", // White
    border: "#e2e8f0", // Slate 200
    borderLight: "#f8fafc", // Slate 50
    text: "#0f172a", // Slate 900
    textMuted: "#64748b", // Slate 500
    success: "#10b981", // Emerald 500
    warning: "#f59e0b", // Amber 500
    error: "#ef4444", // Red 500
    info: "#3b82f6", // Blue 500
  },
  spacing: {
    compact: {
      unit: "4px",
      gutter: "16px",
      container: "1280px",
      inputPadding: "12px",
      cardPadding: "12px",
      rowHeight: "32px",
    },
    normal: {
      unit: "6px",
      gutter: "24px", // Matches AdminPanel px-6
      container: "1920px", // Matches AdminPanel max-w
      inputPadding: "16px",
      cardPadding: "24px",
      rowHeight: "48px",
    },
    comfortable: {
      unit: "8px",
      gutter: "32px",
      container: "2400px",
      inputPadding: "24px",
      cardPadding: "32px",
      rowHeight: "64px",
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem", // Matches rounded-xl often used
    xl: "1rem", // Matches rounded-2xl often used
    full: "9999px",
  },
  typography: {
    fontSans: "'Inter', sans-serif",
    fontSerif: "'Merriweather', serif",
    fontMono: "'JetBrains Mono', monospace",
    weights: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      black: "900",
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
    // Aliases
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
  zIndex: {
    base: "0",
    header: "40",
    sidebar: "50",
    modal: "100",
    overlay: "90",
  },
};

export const tokens = DEFAULT_TOKENS;

/**
 * Get design tokens based on theme mode, density, and font mode
 * @param mode - Theme mode (light or dark)
 * @param _density
 * @param fontMode - Font family preference (sans or serif)
 * @returns Complete design tokens object
 */
export function getTokens(
  mode: ThemeMode = "light",
  _density: ThemeDensity = "normal",
  fontMode: FontMode = "sans"
): DesignTokens {
  const baseTokens = { ...DEFAULT_TOKENS };

  // Apply dark mode colors if needed
  if (mode === "dark") {
    baseTokens.colors = {
      ...baseTokens.colors,
      primary: "#f1f5f9", // Light text on dark
      primaryDark: "#f8fafc",
      primaryLight: "#334155",
      background: "#0f172a", // Dark background
      surface: "#1e293b", // Slightly lighter surface
      border: "#334155",
      borderLight: "#1e293b",
      text: "#f1f5f9",
      textMuted: "#94a3b8",
    };
  }

  // Set font mode
  baseTokens.fontMode = fontMode;

  return baseTokens;
}
