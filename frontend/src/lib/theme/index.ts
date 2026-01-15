/**
 * Theme Library - Public API
 *
 * Enterprise React Architecture - Library Layer
 * Export all theme-related utilities and services
 *
 * @module lib/theme
 */

// ============================================================================
// Core Exports
// ============================================================================

// Context
export { ThemeContext } from "./contexts";

// Types
export type {
  ThemeActionsValue,
  ThemeContextType,
  ThemeObject,
  ThemeProviderProps,
  ThemeStateValue,
} from "./types";

// Tokens and configuration
export * from "./tokens";
export type { DesignTokens, FontMode, ThemeDensity, ThemeMode } from "./tokens";

// Services
export { ChartColorService } from "./services/chartColorService";

// ============================================================================
// Provider and Hooks
// ============================================================================

// Context and Provider (from infrastructure)
export {
  ThemeContext as ThemeContextLegacy,
  ThemeProvider,
  createTheme,
} from "@/providers/infrastructure/ThemeProvider";
export type { ThemeContextType as ThemeContextTypeLegacy } from "@/providers/infrastructure/ThemeProvider";

// Hooks
export { useTheme, useThemeContext } from "@/hooks/useTheme";
export { useThemeCustomizer } from "@/hooks/useThemeCustomizer";
export type {
  ThemeCustomizerActions,
  ThemeCustomizerState,
  ThemeCustomizerStatus,
} from "@/hooks/useThemeCustomizer";

// ============================================================================
// Components
// ============================================================================

export { AdvancedThemeCustomizer } from "@/components/theme/AdvancedThemeCustomizer";
export { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";
export { default as ThemePreview } from "@/components/theme/ThemePreview";
