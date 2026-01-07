/**
 * Light theme
 */

import { tokens } from "../tokens";
import type { Theme } from "../types";

export const lightTheme: Theme = {
  colors: {
    background: tokens.colors.neutral[50],
    foreground: tokens.colors.neutral[900],
    surface: "#ffffff",
    border: tokens.colors.neutral[200],
    primary: tokens.colors.primary[500],
    "primary-hover": tokens.colors.primary[600],
    muted: tokens.colors.neutral[500],
    "muted-100": tokens.colors.neutral[100],
    "muted-200": tokens.colors.neutral[200],
    success: tokens.colors.success[500],
    error: tokens.colors.error[500],
    warning: tokens.colors.warning[500],
    hover: tokens.colors.neutral[100],
  },
  spacing: tokens.spacing,
  typography: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.fontSize.base,
    lineHeight: tokens.typography.lineHeight.normal,
  },
};
