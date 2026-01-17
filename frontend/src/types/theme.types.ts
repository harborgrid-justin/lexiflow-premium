/**
 * Theme Type Definitions
 *
 * Enterprise React Architecture - Type Layer
 * Centralized theme type definitions following the architecture standard.
 *
 * @module types/theme
 */

import { type ThemeMode } from "@/lib/theme/tokens";

import type { ReactNode } from "react";

// Theme type for the actual theme object returned by useTheme
export interface ThemeObject {
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
    subtle: string;
  };
  border: {
    input(
      arg0: string,
      input: string,
      input1: unknown,
      primary: string
    ): string | undefined;
    default: string;
    light: string;
    focused: string;
    error: string;
    subtle: string;
    primary: string;
  };
  divide: {
    default: string;
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
    muted: string;
    accent: string;
    success: string;
    error: string;
  };
  interactive: {
    primary: string;
    success?: string;
    hover: string;
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
  colors: {
    border: string;
    textMuted: string;
    info: string;
    success: string;
    warning: string;
    surface: string;
    text: string;
  };
  typography: {
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Narrow interface - read-only state
export interface ThemeStateValue {
  mode: ThemeMode;
  theme: ThemeObject;
  isDark: boolean;
}

// Narrow interface - actions only
export interface ThemeActionsValue {
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// Combined interface for backward compatibility
export interface ThemeContextValue extends ThemeStateValue, ThemeActionsValue {}

// Provider props
export interface ThemeProviderProps {
  children: ReactNode;
  // Support test-friendly overrides
  initialMode?: ThemeMode;
}
