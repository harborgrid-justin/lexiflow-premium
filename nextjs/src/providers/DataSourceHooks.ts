import { useContext } from "react";
import {
  DataSourceActionsContext,
  DataSourceStateContext,
} from "./DataSourceContext";
import type {
  DataSourceActionsValue,
  DataSourceStateValue,
} from "./DataSourceContext.types";

const contextId = Math.random().toString(36).substring(7);
console.log("[DataSourceHooks] Module loaded, ID:", contextId);

// BP4: Export only custom hooks, not raw contexts
export function useDataSourceState(): DataSourceStateValue {
  const context = useContext(DataSourceStateContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    console.error(
      "[useDataSourceState] Context is missing! Provider not found in tree. Module ID:",
      contextId
    );
    throw new Error(
      "useDataSourceState must be used within a DataSourceProvider"
    );
  }
  return context;
}

export function useDataSourceActions(): DataSourceActionsValue {
  const context = useContext(DataSourceActionsContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error(
      "useDataSourceActions must be used within a DataSourceProvider"
    );
  }
  return context;
}

// Convenience hook for consumers that need both (backward compatibility)
export function useDataSource() {
  return {
    ...useDataSourceState(),
    ...useDataSourceActions(),
  };
}
