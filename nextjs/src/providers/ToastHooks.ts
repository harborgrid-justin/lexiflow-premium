import { useContext } from "react";
import { ToastActionsContext, ToastStateContext } from "./ToastContext";
import type { ToastActionsValue, ToastStateValue } from "./ToastContext.types";

// BP4: Export only custom hooks, not raw contexts
export function useToastState(): ToastStateValue {
  const context = useContext(ToastStateContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error("useToastState must be used within a ToastProvider");
  }
  return context;
}

export function useToastActions(): ToastActionsValue {
  const context = useContext(ToastActionsContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error("useToastActions must be used within a ToastProvider");
  }
  return context;
}

// Convenience hook for consumers that need both (backward compatibility)
export function useToast() {
  return {
    ...useToastState(),
    ...useToastActions(),
  };
}
