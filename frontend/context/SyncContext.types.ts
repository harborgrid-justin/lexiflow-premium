export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error';

export interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
  failedCount: number;
  performMutation: <T = unknown>(type: string, payload: T, apiCall: () => Promise<T>) => Promise<void>;
  retryFailed: () => void;
  syncStatus: SyncStatus;
}
