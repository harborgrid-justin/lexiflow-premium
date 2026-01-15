/**
 * Role Contexts
 *
 * React contexts for role state and actions.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/role/contexts
 */

import { createContext } from "react";
import type { RoleActionsValue, RoleStateValue } from "./types";

/**
 * Split contexts for performance optimization (BP3)
 * - State context triggers re-renders only for state consumers
 * - Actions context is stable and doesn't trigger re-renders
 */
export const RoleStateContext = createContext<RoleStateValue | undefined>(
  undefined
);

export const RoleActionsContext = createContext<RoleActionsValue | undefined>(
  undefined
);
