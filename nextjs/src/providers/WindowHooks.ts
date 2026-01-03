import { useContext } from "react";
import { WindowActionsContext, WindowStateContext } from "./WindowContext";
import type {
  WindowActionsValue,
  WindowStateValue,
} from "./WindowContext.types";

// BP4: Export only custom hooks, not raw contexts
export function useWindowState(): WindowStateValue {
  const context = useContext(WindowStateContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error("useWindowState must be used within a WindowProvider");
  }
  return context;
}

export function useWindowActions(): WindowActionsValue {
  const context = useContext(WindowActionsContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error("useWindowActions must be used within a WindowProvider");
  }
  return context;
}

// Convenience hook for consumers that need both (backward compatibility)
export function useWindow() {
  return {
    ...useWindowState(),
    ...useWindowActions(),
  };
}
