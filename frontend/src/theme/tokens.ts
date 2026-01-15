import {
  ANIMATION_DURATION_MS,
  ANIMATION_EASING,
  FOOTER_HEIGHT,
  MODAL_MAX_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
  TABLE_HEADER_HEIGHT,
  TABLE_ROW_HEIGHT,
  TOPBAR_HEIGHT,
} from "@/config/features/ui.config";

export type ThemeDensity = "compact" | "normal" | "comfortable";
export type FontMode = "sans" | "serif";
export type ThemeMode = "light" | "dark";

export interface DesignTokens {
  fontMode: FontMode;
  colors: {
    // Primary Brand Colors (5)
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;

    // Backgrounds (10)
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    surface: string;
    surfaceRaised: string;
    surfaceHighlight: string;
    surfaceOverlay: string;
    surfaceInput: string;
    surfaceActive: string;
    surfaceHover: string;

    // Borders (8)
    border: string;
    borderLight: string;
    borderDark: string;
    borderFocus: string;
    borderError: string;
    borderSuccess: string;
    borderWarning: string;
    borderInfo: string;

    // Text Colors (12)
    text: string;
    textMuted: string;
    textInverse: string;
    textLink: string;
    textDisabled: string;
    textPlaceholder: string;
    textCode: string;
    textSuccess: string;
    textWarning: string;
    textError: string;
    textInfo: string;
    textAccent: string;

    // Semantic/Status Colors (4)
    success: string;
    warning: string;
    error: string;
    info: string;

    // Extended Palette (18)
    slate50: string;
    slate100: string;
    slate200: string;
    slate300: string;
    slate400: string;
    slate500: string;
    slate600: string;
    slate700: string;
    slate800: string;
    slate900: string;
    blue400: string;
    blue500: string;
    blue600: string;
    emerald400: string;
    emerald500: string;
    amber400: string;
    rose400: string;
    indigo400: string;

    // Interactive States (6)
    hoverPrimary: string;
    hoverSecondary: string;
    activePrimary: string;
    activeSecondary: string;
    focusRing: string;
    disabled: string;

    charts: {
      blue: string;
      green: string;
      red: string;
      amber: string;
      purple: string;
      pink: string;
      slate: string;
      teal: string;
      cyan: string;
      orange: string;
    };
    annotations: {
      yellow: string;
      green: string;
      blue: string;
      red: string;
      purple: string;
      highlight: string;
      orange: string;
      pink: string;
    };
    // Gradients (6)
    gradients: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
      info: string;
    };
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
      // Extended spacing (10)
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      sectionPadding: string;
      buttonPadding: string;
      navHeight: string;
      modalPadding: string;
    }
  >;
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
    // Extended shadows (5)
    xxl: string;
    outline: string;
    colored: string;
    glow: string;
    inset: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
    // Extended radius (3)
    xxl: string;
    xxxl: string;
    none: string;
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
      // Extended weights (2)
      extralight: string;
      extrabold: string;
    };
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      // Extended sizes (5)
      "4xl": string;
      "5xl": string;
      "6xl": string;
      "7xl": string;
      "8xl": string;
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
      "5xl": string;
      "6xl": string;
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
      // Extended line heights (2)
      loose: string;
      none: string;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
      wider: string;
      widest: string;
    };
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
    // Extended transitions (5)
    instant: string;
    smooth: string;
    bounce: string;
    elastic: string;
    linear: string;
  };
  zIndex: {
    base: string;
    header: string;
    sidebar: string;
    modal: string;
    overlay: string;
    // Extended z-index (5)
    dropdown: string;
    sticky: string;
    fixed: string;
    tooltip: string;
    notification: string;
  };
  layout: {
    sidebarWidth: number;
    sidebarCollapsedWidth: number;
    topBarHeight: number;
    modalMaxWidth: number;
    footerHeight: number;
    tableRowHeight: number;
    tableHeaderHeight: number;
    // Extended layout (8)
    maxContentWidth: number;
    minContentWidth: number;
    cardMinHeight: number;
    inputHeight: number;
    buttonHeight: number;
    iconSize: number;
    avatarSize: number;
    badgeSize: number;
  };
  // New categories (15+ properties)
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
      verySlow: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
      bounce: string;
      elastic: string;
    };
    keyframes: {
      fadeIn: string;
      fadeOut: string;
      slideIn: string;
      slideOut: string;
      pulse: string;
      spin: string;
    };
  };
  effects: {
    blur: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    opacity: {
      disabled: string;
      hover: string;
      active: string;
      overlay: string;
    };
    backdrop: {
      blur: string;
      brightness: string;
      contrast: string;
      saturate: string;
    };
  };
  semantic: {
    overlay: string;
    backdrop: string;
    divider: string;
    highlight: string;
    selection: string;
    focus: string;
    placeholder: string;
  };
}
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
  layout: {
    sidebarWidth: number;
    sidebarCollapsedWidth: number;
    topBarHeight: number;
    modalMaxWidth: number;
    footerHeight: number;
    tableRowHeight: number;
    tableHeaderHeight: number;
  };
}

export const DEFAULT_TOKENS: DesignTokens = {
  fontMode: "sans",
  colors: {
    // Primary Brand Colors (5)
    primary: "#0f172a", // Slate 900 (Enterprise Dark)
    primaryDark: "#020617", // Slate 950
    primaryLight: "#f1f5f9", // Slate 100
    secondary: "#2563eb", // Blue 600 (Action Blue)
    accent: "#6366f1", // Indigo 500

    // Backgrounds (10)
    background: "#f8fafc", // Slate 50
    backgroundSecondary: "#f1f5f9", // Slate 100
    backgroundTertiary: "#e2e8f0", // Slate 200
    surface: "#ffffff", // White
    surfaceRaised: "#ffffff",
    surfaceHighlight: "#f1f5f9",
    surfaceOverlay: "rgba(0, 0, 0, 0.5)",
    surfaceInput: "#ffffff",
    surfaceActive: "#eff6ff", // Blue 50
    surfaceHover: "#f8fafc",

    // Borders (8)
    border: "#e2e8f0", // Slate 200
    borderLight: "#f8fafc", // Slate 50
    borderDark: "#94a3b8", // Slate 400
    borderFocus: "#2563eb", // Blue 600
    borderError: "#ef4444", // Red 500
    borderSuccess: "#10b981", // Emerald 500
    borderWarning: "#f59e0b", // Amber 500
    borderInfo: "#3b82f6", // Blue 500

    // Text Colors (12)
    text: "#0f172a", // Slate 900
    textMuted: "#64748b", // Slate 500
    textInverse: "#ffffff",
    textLink: "#2563eb", // Blue 600
    textDisabled: "#cbd5e1", // Slate 300
    textPlaceholder: "#94a3b8", // Slate 400
    textCode: "#0f172a",
    textSuccess: "#10b981",
    textWarning: "#f59e0b",
    textError: "#ef4444",
    textInfo: "#3b82f6",
    textAccent: "#6366f1",

    // Semantic/Status Colors (4)
    success: "#10b981", // Emerald 500
    warning: "#f59e0b", // Amber 500
    error: "#ef4444", // Red 500
    info: "#3b82f6", // Blue 500

    // Extended Palette (18)
    slate50: "#f8fafc",
    slate100: "#f1f5f9",
    slate200: "#e2e8f0",
    slate300: "#cbd5e1",
    slate400: "#94a3b8",
    slate500: "#64748b",
    slate600: "#475569",
    slate700: "#334155",
    slate800: "#1e293b",
    slate900: "#0f172a",
    blue400: "#60a5fa",
    blue500: "#3b82f6",
    blue600: "#2563eb",
    emerald400: "#34d399",
    emerald500: "#10b981",
    amber400: "#fbbf24",
    rose400: "#fb7185",
    indigo400: "#818cf8",

    // Interactive States (6)
    hoverPrimary: "#1e40af", // Blue 800
    hoverSecondary: "#1d4ed8", // Blue 700
    activePrimary: "#1e3a8a", // Blue 900
    activeSecondary: "#1e40af",
    focusRing: "#2563eb",
    disabled: "#e2e8f0",

    charts: {
      blue: "#3b82f6",
      green: "#10b981",
      red: "#ef4444",
      amber: "#f59e0b",
      purple: "#8b5cf6",
      pink: "#ec4899",
      slate: "#475569",
      teal: "#14b8a6",
      cyan: "#06b6d4",
      orange: "#f97316",
    },
    annotations: {
      yellow: "#FCD34D", // Amber 300
      green: "#34D399", // Emerald 400
      blue: "#60A5FA", // Blue 400
      red: "#F87171", // Red 400
      purple: "#A78BFA", // Violet 400
      highlight: "#fef08a", // Yellow 200
      orange: "#fdba74", // Orange 300
      pink: "#f9a8d4", // Pink 300
    },
    gradients: {
      primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      secondary: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
      success: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
      warning: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
      error: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
      info: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
    },
  },
  spacing: {
    compact: {
      unit: "4px",
      gutter: "16px",
      container: "1280px",
      inputPadding: "12px",
      cardPadding: "12px",
      rowHeight: "32px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "20px",
      xxl: "24px",
      sectionPadding: "16px",
      buttonPadding: "8px 16px",
      navHeight: "48px",
      modalPadding: "16px",
    },
    normal: {
      unit: "6px",
      gutter: "24px", // Matches AdminPanel px-6
      container: "1920px", // Matches AdminPanel max-w
      inputPadding: "16px",
      cardPadding: "24px",
      rowHeight: "48px",
      xs: "6px",
      sm: "12px",
      md: "18px",
      lg: "24px",
      xl: "30px",
      xxl: "36px",
      sectionPadding: "24px",
      buttonPadding: "12px 24px",
      navHeight: "64px",
      modalPadding: "24px",
    },
    comfortable: {
      unit: "8px",
      gutter: "32px",
      container: "2400px",
      inputPadding: "24px",
      cardPadding: "32px",
      rowHeight: "64px",
      xs: "8px",
      sm: "16px",
      md: "24px",
      lg: "32px",
      xl: "40px",
      xxl: "48px",
      sectionPadding: "32px",
      buttonPadding: "16px 32px",
      navHeight: "80px",
      modalPadding: "32px",
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    xxl: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    outline: "0 0 0 3px rgba(37, 99, 235, 0.5)",
    colored: "0 10px 25px -5px rgba(37, 99, 235, 0.3)",
    glow: "0 0 20px rgba(37, 99, 235, 0.4)",
    inset: "inset 0 2px 8px 0 rgb(0 0 0 / 0.1)",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem", // Matches rounded-xl often used
    xl: "1rem", // Matches rounded-2xl often used
    full: "9999px",
    xxl: "1.5rem",
    xxxl: "2rem",
    none: "0",
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
      extralight: "200",
      extrabold: "800",
    },
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
      "7xl": "4.5rem",
      "8xl": "6rem",
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
      "5xl": "3rem",
      "6xl": "3.75rem",
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
      loose: "2",
      none: "1",
    },
    letterSpacing: {
      tight: "-0.025em",
      normal: "0",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.1em",
    },
  },
  transitions: {
    fast: `${Math.round(ANIMATION_DURATION_MS * 0.75)}ms ${ANIMATION_EASING}`,
    normal: `${ANIMATION_DURATION_MS}ms ${ANIMATION_EASING}`,
    slow: `${Math.round(ANIMATION_DURATION_MS * 2.5)}ms ${ANIMATION_EASING}`,
    instant: "75ms ease-out",
    smooth: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    elastic: "600ms cubic-bezier(0.68, -0.6, 0.32, 1.6)",
    linear: "200ms linear",
  },
  zIndex: {
    base: "0",
    header: "40",
    sidebar: "50",
    modal: "100",
    overlay: "90",
    dropdown: "60",
    sticky: "30",
    fixed: "70",
    tooltip: "110",
    notification: "120",
  },
  layout: {
    sidebarWidth: SIDEBAR_WIDTH,
    sidebarCollapsedWidth: SIDEBAR_COLLAPSED_WIDTH,
    topBarHeight: TOPBAR_HEIGHT,
    modalMaxWidth: MODAL_MAX_WIDTH,
    footerHeight: FOOTER_HEIGHT,
    tableRowHeight: TABLE_ROW_HEIGHT,
    tableHeaderHeight: TABLE_HEADER_HEIGHT,
    maxContentWidth: 1920,
    minContentWidth: 320,
    cardMinHeight: 200,
    inputHeight: 40,
    buttonHeight: 40,
    iconSize: 20,
    avatarSize: 40,
    badgeSize: 24,
  },
  animations: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
      verySlow: "800ms",
    },
    easing: {
      linear: "linear",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      elastic: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
    },
    keyframes: {
      fadeIn: "fadeIn 0.3s ease-in",
      fadeOut: "fadeOut 0.3s ease-out",
      slideIn: "slideIn 0.3s ease-out",
      slideOut: "slideOut 0.3s ease-in",
      pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      spin: "spin 1s linear infinite",
    },
  },
  effects: {
    blur: {
      sm: "4px",
      md: "8px",
      lg: "16px",
      xl: "24px",
    },
    opacity: {
      disabled: "0.5",
      hover: "0.8",
      active: "0.9",
      overlay: "0.75",
    },
    backdrop: {
      blur: "blur(8px)",
      brightness: "brightness(1.1)",
      contrast: "contrast(1.1)",
      saturate: "saturate(1.2)",
    },
  },
  semantic: {
    overlay: "rgba(0, 0, 0, 0.5)",
    backdrop: "rgba(0, 0, 0, 0.25)",
    divider: "#e2e8f0",
    highlight: "#fef08a",
    selection: "#bfdbfe",
    focus: "#2563eb",
    placeholder: "#94a3b8",
  },
};

export const tokens = DEFAULT_TOKENS;

/**
 * Get design tokens based on theme mode, density, and font mode
 * @param mode - Theme mode (light or dark)
 * @param density - Spacing density (compact, normal, or comfortable)
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
      // Primary Brand Colors
      primary: "#f1f5f9", // Light text on dark
      primaryDark: "#f8fafc",
      primaryLight: "#334155",
      secondary: "#3b82f6",
      accent: "#818cf8",

      // Backgrounds
      background: "#0f172a", // Dark background
      backgroundSecondary: "#1e293b",
      backgroundTertiary: "#334155",
      surface: "#1e293b", // Slightly lighter surface
      surfaceRaised: "#334155",
      surfaceHighlight: "#475569",
      surfaceOverlay: "rgba(0, 0, 0, 0.8)",
      surfaceInput: "#1e293b",
      surfaceActive: "#1e3a8a",
      surfaceHover: "#334155",

      // Borders
      border: "#334155",
      borderLight: "#1e293b",
      borderDark: "#64748b",
      borderFocus: "#3b82f6",
      borderError: "#f87171",
      borderSuccess: "#34d399",
      borderWarning: "#fbbf24",
      borderInfo: "#60a5fa",

      // Text Colors
      text: "#f1f5f9",
      textMuted: "#94a3b8",
      textInverse: "#0f172a",
      textLink: "#60a5fa",
      textDisabled: "#475569",
      textPlaceholder: "#64748b",
      textCode: "#f1f5f9",
      textSuccess: "#34d399",
      textWarning: "#fbbf24",
      textError: "#f87171",
      textInfo: "#60a5fa",
      textAccent: "#a78bfa",

      // Interactive States
      hoverPrimary: "#60a5fa",
      hoverSecondary: "#3b82f6",
      activePrimary: "#93c5fd",
      activeSecondary: "#60a5fa",
      focusRing: "#3b82f6",
      disabled: "#334155",

      // Extended Palette (inverted)
      slate50: "#0f172a",
      slate100: "#1e293b",
      slate200: "#334155",
      slate300: "#475569",
      slate400: "#64748b",
      slate500: "#94a3b8",
      slate600: "#cbd5e1",
      slate700: "#e2e8f0",
      slate800: "#f1f5f9",
      slate900: "#f8fafc",

      // Semantic (keep most the same for clarity)
      overlay: "rgba(0, 0, 0, 0.7)",
      backdrop: "rgba(0, 0, 0, 0.5)",
      divider: "#334155",
      highlight: "#713f12",
      selection: "#1e3a8a",
      focus: "#3b82f6",
      placeholder: "#64748b",
    };

    baseTokens.semantic = {
      overlay: "rgba(0, 0, 0, 0.7)",
      backdrop: "rgba(0, 0, 0, 0.5)",
      divider: "#334155",
      highlight: "#713f12",
      selection: "#1e3a8a",
      focus: "#3b82f6",
      placeholder: "#64748b",
    };
  }

  // Set font mode
  baseTokens.fontMode = fontMode;

  return baseTokens;
}
