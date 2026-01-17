/**
 * Layout Contexts
 *
 * React contexts for layout state.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/layout/contexts
 */

import { createContext } from "react";

import type { LayoutContextValue } from "./types";

/**
 * Layout Context
 *
 * Provides global layout state management for application-level UI.
 */
export const LayoutContext = createContext<LayoutContextValue | undefined>(
  undefined
);

LayoutContext.displayName = "LayoutContext";
