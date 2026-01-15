/**
 * Centralized Theme System
 *
 * All theme-related functionality exported from this centralized location.
 * All theme imports should come from '@/theme'.
 *
 * @module features/theme
 */

// Core theme types and tokens
export * from "./ThemeContext.types";
export * from "./tokens";

// Theme context and provider
export {
  ThemeProvider,
  useThemeContext as useTheme,
  useThemeContext,
} from "./ThemeContext";
export type { ThemeObject } from "./ThemeContext";

export { default as AdvancedThemeCustomizer } from "./components/AdvancedThemeCustomizer";
export { default as ThemeCustomizer } from "./components/ThemeCustomizer";

// Theme services (chart colors, utilities, etc.)
export * from "./services";
