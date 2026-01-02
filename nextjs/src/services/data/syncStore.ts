import { useSyncExternalStore } from "react";

/**
 * External store for sync state management
 * Prevents tearing bugs in concurrent mode
 *
 * @see https://react.dev/reference/react/useSyncExternalStore
 */

export interface SyncState {
  isOnline: boolean;
  pendingCount: number;
  failedCount: number;
  syncStatus: "idle" | "syncing" | "offline" | "error";
}

type Listener = () => void;

class SyncStoreClass {
  private listeners = new Set<Listener>();

  private state: SyncState = {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    pendingCount: 0,
    failedCount: 0,
    syncStatus:
      typeof navigator !== "undefined" && navigator.onLine ? "idle" : "offline",
  };

  constructor() {
    // Listen to browser online/offline events
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.updateState({ isOnline: true, syncStatus: "syncing" });
      });

      window.addEventListener("offline", () => {
        this.updateState({ isOnline: false, syncStatus: "offline" });
      });
    }
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): SyncState => {
    return this.state;
  };

  getServerSnapshot = (): SyncState => {
    // SSR: Default to online state
    return {
      isOnline: true,
      pendingCount: 0,
      failedCount: 0,
      syncStatus: "idle",
    };
  };

  updateState(partial: Partial<SyncState>) {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  // Public methods for updating state
  setOnline(isOnline: boolean) {
    this.updateState({
      isOnline,
      syncStatus: isOnline ? "syncing" : "offline",
    });
  }

  setPendingCount(count: number) {
    this.updateState({ pendingCount: count });
  }

  setFailedCount(count: number) {
    this.updateState({ failedCount: count });
  }

  setSyncStatus(status: SyncState["syncStatus"]) {
    this.updateState({ syncStatus: status });
  }
}

// Singleton instance
export const syncStore = new SyncStoreClass();

/**
 * Hook to subscribe to full sync state
 * Causes re-render on ANY state change
 *
 * Prefer specific hooks (useIsOnline, usePendingCount) for better performance
 */
export function useSyncStore() {
  return useSyncExternalStore(
    syncStore.subscribe,
    syncStore.getSnapshot,
    syncStore.getServerSnapshot
  );
}

/**
 * Hook to subscribe only to online status
 * Re-renders only when online status changes
 */
export function useIsOnline() {
  return useSyncExternalStore(
    syncStore.subscribe,
    () => syncStore.getSnapshot().isOnline,
    () => syncStore.getServerSnapshot().isOnline
  );
}

/**
 * Hook to subscribe only to pending count
 * Re-renders only when pending count changes
 */
export function usePendingCount() {
  return useSyncExternalStore(
    syncStore.subscribe,
    () => syncStore.getSnapshot().pendingCount,
    () => syncStore.getServerSnapshot().pendingCount
  );
}

/**
 * Hook to subscribe only to failed count
 * Re-renders only when failed count changes
 */
export function useFailedCount() {
  return useSyncExternalStore(
    syncStore.subscribe,
    () => syncStore.getSnapshot().failedCount,
    () => syncStore.getServerSnapshot().failedCount
  );
}

/**
 * Hook to subscribe only to sync status
 * Re-renders only when sync status changes
 */
export function useSyncStatus() {
  return useSyncExternalStore(
    syncStore.subscribe,
    () => syncStore.getSnapshot().syncStatus,
    () => syncStore.getServerSnapshot().syncStatus
  );
}
