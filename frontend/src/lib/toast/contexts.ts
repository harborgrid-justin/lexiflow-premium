/**
 * Toast Contexts
 *
 * React contexts for toast state and actions.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/toast/contexts
 */

import { createContext } from "react";

import type { ToastActionsValue, ToastStateValue } from "./types";

/**
 * Split contexts for performance optimization (BP3)
 * - State context triggers re-renders only for state consumers
 * - Actions context is stable and doesn't trigger re-renders
 */
export const ToastStateContext = createContext<ToastStateValue | undefined>(
  undefined
);
export const ToastActionsContext = createContext<ToastActionsValue | undefined>(
  undefined
);

ToastStateContext.displayName = "ToastStateContext";
ToastActionsContext.displayName = "ToastActionsContext";
