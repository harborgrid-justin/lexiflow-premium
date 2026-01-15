/**
 * Toast Hooks
 *
 * ARCHITECTURE: Hooks for accessing toast context
 * Location: /hooks/ (hook layer)
 */

import type { ToastActionsValue, ToastStateValue } from "@/lib/toast/context";
import { ToastActionsContext, ToastStateContext } from "@/lib/toast/context";
import { useContext } from "react";

/**
 * Hook to access toast state
 */
export function useToastState(): ToastStateValue {
  const context = useContext(ToastStateContext);
  if (!context) {
    throw new Error("useToastState must be used within a ToastProvider");
  }
  return context;
}

/**
 * Hook to access toast actions
 */
export function useToastActions(): ToastActionsValue {
  const context = useContext(ToastActionsContext);
  if (!context) {
    throw new Error("useToastActions must be used within a ToastProvider");
  }
  return context;
}

/**
 * Convenience hook for both state and actions
 */
export function useToast() {
  return {
    ...useToastState(),
    ...useToastActions(),
  };
}
