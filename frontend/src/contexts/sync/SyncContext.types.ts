/**
 * Sync Context Types
 * Type definitions for synchronization context
 */

export type SyncStatus = "idle" | "syncing" | "error" | "success";

export interface SyncStateValue {
  status: SyncStatus;
  lastSyncTime?: Date;
  pendingChanges: number;
  error?: Error;
}

export interface SyncActionsValue {
  sync: () => Promise<void>;
  clearError: () => void;
  getPendingChanges: () => number;
}

export interface SyncContextValue {
  state: SyncStateValue;
  actions: SyncActionsValue;
}

export interface SyncProviderProps {
  children: React.ReactNode;
  autoSync?: boolean;
  syncInterval?: number;
}
