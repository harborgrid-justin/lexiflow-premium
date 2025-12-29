/**
 * ThemeContext Type Definitions
 */

import { ThemeMode } from '@theme/tokens';
import { tokens } from '@theme/tokens';

// Theme type with colors compatibility layer
type ThemeWithColors = typeof tokens.colors.light & {
  colors: typeof tokens.colors.light;
};

// BP2: Narrow interface - read-only state
export interface ThemeStateValue {
  mode: ThemeMode;
  theme: ThemeWithColors;
  isDark: boolean;
}

// BP2: Narrow interface - actions only
export interface ThemeActionsValue {
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// Combined interface for backward compatibility
export interface ThemeContextValue extends ThemeStateValue, ThemeActionsValue {}

// Provider props
export interface ThemeProviderProps {
  children: React.ReactNode;
  // BP14: Support test-friendly overrides
  initialMode?: ThemeMode;
}
