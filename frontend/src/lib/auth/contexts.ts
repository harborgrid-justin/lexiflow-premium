/**
 * Authentication Contexts
 *
 * React contexts for auth state and actions.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module providers/authContexts
 */

import { createContext } from "react";

import type { AuthActionsValue, AuthStateValue } from "./types";

/**
 * Split contexts for performance optimization (BP3)
 * - State context triggers re-renders only for state consumers
 * - Actions context is stable and doesn't trigger re-renders
 */
export const AuthStateContext = createContext<AuthStateValue | undefined>(
  undefined
);
export const AuthActionsContext = createContext<AuthActionsValue | undefined>(
  undefined
);
