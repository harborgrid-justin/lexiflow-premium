/**
 * Entitlements Contexts
 *
 * React contexts for entitlements state and actions.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/entitlements/contexts
 */

import { createContext } from "react";
import type { EntitlementsActionsValue, EntitlementsStateValue } from "./types";

/**
 * Split contexts for performance optimization (BP3)
 * - State context triggers re-renders only for state consumers
 * - Actions context is stable and doesn't trigger re-renders
 */
export const EntitlementsStateContext = createContext<
  EntitlementsStateValue | undefined
>(undefined);
export const EntitlementsActionsContext = createContext<
  EntitlementsActionsValue | undefined
>(undefined);
