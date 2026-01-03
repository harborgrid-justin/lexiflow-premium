import { createContext } from "react";
import type { ThemeActionsValue, ThemeStateValue } from "./ThemeContext.types";

// BP3: Split contexts for state and actions
// Context definitions only - No JSX, pure TypeScript logic

export const ThemeStateContext = createContext<ThemeStateValue | undefined>(
  undefined
);
export const ThemeActionsContext = createContext<ThemeActionsValue | undefined>(
  undefined
);
