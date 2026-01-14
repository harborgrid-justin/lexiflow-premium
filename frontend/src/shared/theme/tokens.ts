/**
 * @deprecated This module has been moved to @/theme/tokens
 * Please update your imports:
 *
 * Old: import { ThemeMode, tokens } from '@/shared/theme/tokens';
 * New: import { ThemeMode, DEFAULT_LIGHT_TOKENS } from '@/theme';
 *
 * This re-export will be removed in a future version.
 */

// Re-export everything from centralized location
export * from "@/theme/tokens";
export type {
  DesignTokens,
  FontMode,
  ThemeDensity,
  ThemeMode,
} from "@/theme/tokens";

// Re-export constants for backward compatibility
export {
  DEFAULT_TOKENS,
  DEFAULT_TOKENS as DEFAULT_LIGHT_TOKENS,
  DEFAULT_TOKENS as DEFAULT_DARK_TOKENS,
  getTokens,
  DEFAULT_TOKENS as tokens,
} from "@/theme/tokens";
