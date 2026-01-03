import { useContext } from "react";
import { ThemeActionsContext, ThemeStateContext } from "./ThemeContext";
import type { ThemeActionsValue, ThemeStateValue } from "./ThemeContext.types";

// BP4: Export only custom hooks, not raw contexts
export function useThemeState(): ThemeStateValue {
  const context = useContext(ThemeStateContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error("useThemeState must be used within a ThemeProvider");
  }
  return context;
}

export function useThemeActions(): ThemeActionsValue {
  const context = useContext(ThemeActionsContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error("useThemeActions must be used within a ThemeProvider");
  }
  return context;
}

// Convenience hook for consumers that need both (backward compatibility)
export function useTheme() {
  return {
    ...useThemeState(),
    ...useThemeActions(),
  };
}
