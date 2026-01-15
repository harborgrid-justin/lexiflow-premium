/**
 * Feature Flags Contexts
 *
 * React contexts for feature flags state and actions.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/flags/contexts
 */

import { createContext } from "react";
import type { FlagsActionsValue, FlagsStateValue } from "./types";

/**
 * Split contexts for performance optimization (BP3)
 * - State context triggers re-renders only for state consumers
 * - Actions context is stable and doesn't trigger re-renders
 */
export const FlagsStateContext = createContext<FlagsStateValue | undefined>(
  undefined
);
export const FlagsActionsContext = createContext<FlagsActionsValue | undefined>(
  undefined
);
