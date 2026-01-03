import { useContext } from "react";
import {
  useFailedCount,
  useIsOnline,
  usePendingCount,
  useSyncStatus,
  useSyncStore,
} from "../services/data/syncStore";
import { SyncActionsContext } from "./SyncContext";
import type { SyncActionsValue, SyncStateValue } from "./SyncContext.types";

// BP4: Export only custom hooks, not raw contexts

/**
 * Hook to get sync state
 * Uses useSyncExternalStore - tearing-safe
 */
export function useSyncState(): SyncStateValue {
  return useSyncStore();
}

/**
 * Hook to get sync actions
 */
export function useSyncActions(): SyncActionsValue {
  const context = useContext(SyncActionsContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error("useSyncActions must be used within a SyncProvider");
  }
  return context;
}

// Convenience hook for consumers that need both (backward compatibility)
export function useSync() {
  return {
    ...useSyncState(),
    ...useSyncActions(),
  };
}

// Export fine-grained hooks for performance
export { useFailedCount, useIsOnline, usePendingCount, useSyncStatus };
