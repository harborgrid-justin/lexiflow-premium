/**
 * Dark theme
 */

import { tokens } from "../tokens";
import type { Theme } from "../types";

export const darkTheme: Theme = {
  colors: {
    background: tokens.colors.neutral[900],
    foreground: tokens.colors.neutral[50],
    surface: tokens.colors.neutral[700],
    border: tokens.colors.neutral[700],
    primary: tokens.colors.primary[500],
    "primary-hover": tokens.colors.primary[600],
    muted: tokens.colors.neutral[500],
    "muted-100": tokens.colors.neutral[700],
    "muted-200": tokens.colors.neutral[700],
    success: tokens.colors.success[500],
    error: tokens.colors.error[500],
    warning: tokens.colors.warning[500],
    hover: "rgba(255, 255, 255, 0.1)",
  },
  spacing: tokens.spacing,
  typography: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.fontSize.base,
    lineHeight: tokens.typography.lineHeight.normal,
  },
};
