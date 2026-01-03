import { createContext } from "react";
import type {
  WindowActionsValue,
  WindowStateValue,
} from "./WindowContext.types";

// BP3: Split contexts for state and actions
// Context definitions only - No JSX, pure TypeScript logic

export const WindowStateContext = createContext<WindowStateValue | undefined>(
  undefined
);
export const WindowActionsContext = createContext<
  WindowActionsValue | undefined
>(undefined);
