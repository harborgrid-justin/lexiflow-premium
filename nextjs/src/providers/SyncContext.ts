import { createContext } from "react";
import type { SyncActionsValue, SyncStateValue } from "./SyncContext.types";

// BP3: Actions context only (state comes from external store)
// Context definitions only - No JSX, pure TypeScript logic

export const SyncActionsContext = createContext<SyncActionsValue | undefined>(
  undefined
);

// Legacy unified context type for backward compatibility
export type SyncContextType = SyncStateValue & SyncActionsValue;

// Legacy unified context export (for backward compatibility with useSync hook)
export const SyncContext = createContext<SyncContextType | undefined>(
  undefined
);
