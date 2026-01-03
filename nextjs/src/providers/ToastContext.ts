import { createContext } from "react";
import type { ToastActionsValue, ToastStateValue } from "./ToastContext.types";

// BP3: Split contexts for state and actions
// Context definitions only - No JSX, pure TypeScript logic

export const ToastStateContext = createContext<ToastStateValue | undefined>(
  undefined
);
export const ToastActionsContext = createContext<ToastActionsValue | undefined>(
  undefined
);
