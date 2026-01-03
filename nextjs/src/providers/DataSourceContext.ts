import { createContext } from "react";
import type {
  DataSourceActionsValue,
  DataSourceStateValue,
} from "./DataSourceContext.types";

// BP3: Split contexts for state and actions
// Context definitions only - No JSX, pure TypeScript logic

export const DataSourceStateContext = createContext<
  DataSourceStateValue | undefined
>(undefined);
export const DataSourceActionsContext = createContext<
  DataSourceActionsValue | undefined
>(undefined);
