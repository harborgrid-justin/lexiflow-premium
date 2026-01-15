/**
 * useTheme Hook
 *
 * ENTERPRISE REACT ARCHITECTURE: Hook Layer
 * - Pure hook that accesses ThemeContext
 * - Separated from context definition and provider
 *
 * React v18 Pattern: Guideline 34
 */

import {
  ThemeContext,
  ThemeContextType,
} from "@/providers/infrastructure/ThemeProvider";
import { useContext } from "react";

/**
 * Hook to access theme context
 * Must be used within ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

// Re-export for backward compatibility
export { useTheme as useThemeContext };
