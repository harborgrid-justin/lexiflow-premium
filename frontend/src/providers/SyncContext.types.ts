/**
 * SyncContext Type Definitions
 */

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error';

// BP2: Narrow interface - read-only state
export interface SyncStateValue {
  isOnline: boolean;
  pendingCount: number;
  failedCount: number;
  syncStatus: SyncStatus;
}

// BP2: Narrow interface - actions only
export interface SyncActionsValue {
  performMutation: <T = unknown>(type: string, payload: T, apiCall: () => Promise<T>) => Promise<void>;
  retryFailed: () => void;
}

// Combined interface for backward compatibility
export interface SyncContextValue extends SyncStateValue, SyncActionsValue {}

// Legacy alias
export type SyncContextType = SyncContextValue;

// Provider props
export interface SyncProviderProps {
  children: React.ReactNode;
  // BP14: Support test-friendly overrides
  initialOnlineState?: boolean;  // Notification callbacks to avoid circular dependency
  onSyncSuccess?: (message: string) => void;
  onSyncError?: (message: string) => void;}
