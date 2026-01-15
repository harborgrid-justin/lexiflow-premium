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

// Tokens and types
export * from "./tokens";
export type { DesignTokens, FontMode, ThemeDensity, ThemeMode } from "./tokens";

// Services
export { ChartColorService } from "./services/chartColorService";

// Types
export type { ThemeObject } from "./ThemeContext.types";

// ============================================================================
// Re-exports for Convenience
// ============================================================================

// Context (use via @/providers/infrastructure/ThemeProvider or @/lib/theme)
export {
  ThemeContext,
  createTheme,
} from "@/providers/infrastructure/ThemeProvider";
export type { ThemeContextType } from "@/providers/infrastructure/ThemeProvider";

// Hook (use via @/hooks/useTheme or @/lib/theme)
export { useTheme, useThemeContext } from "@/hooks/useTheme";

// Provider (use via @/providers/infrastructure/ThemeProvider or @/lib/theme)
export { ThemeProvider } from "@/providers/infrastructure/ThemeProvider";

// Components (use via @/components/theme or @/lib/theme)
export { AdvancedThemeCustomizer } from "@/components/theme/AdvancedThemeCustomizer";
export { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";
export { default as ThemePreview } from "@/components/theme/ThemePreview";

// Hooks (use via @/hooks or @/lib/theme)
export { useThemeCustomizer } from "@/hooks/useThemeCustomizer";
export type {
  ThemeCustomizerActions,
  ThemeCustomizerState,
  ThemeCustomizerStatus,
} from "@/hooks/useThemeCustomizer";
