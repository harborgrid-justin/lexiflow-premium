export interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
  failedCount: number;
  performMutation: (type: string, payload: any, apiCall: () => Promise<any>) => Promise<void>;
  retryFailed: () => void;
  syncStatus: 'idle' | 'syncing' | 'offline' | 'error';
}
