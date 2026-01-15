/**
 * Theme Contexts
 *
 * React contexts for theme state and actions.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/theme/contexts
 */

import { createContext } from "react";
import type { ThemeContextType } from "./types";

/**
 * Theme Context
 *
 * Provides theme configuration and controls.
 * Uses a single context since theme updates are infrequent.
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

ThemeContext.displayName = "ThemeContext";
