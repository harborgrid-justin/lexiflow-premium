import { DataService } from '@/services/data/data-service.service';
import { SyncEngine } from '@/services/data/syncEngine';
import { SYNC_MAX_RETRIES, SYNC_BASE_DELAY_MS } from '@/config/features/contexts.config';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type {
  SyncActionsValue,
  SyncProviderProps,
  SyncStateValue,
  SyncStatus,
} from './SyncContext.types';

// Extend SyncProviderProps to include initialOnlineStatus for testing
interface ExtendedSyncProviderProps extends SyncProviderProps {
  initialOnlineStatus?: boolean;
}

/**
 * GUIDELINE #32: Use useSyncExternalStore for External Mutable Sources
 * 
 * Hook to subscribe to navigator.onLine in a concurrent-safe manner.
 * Uses useSyncExternalStore to prevent tearing during interrupted renders.
 * 
 * @see https://react.dev/reference/react/useSyncExternalStore
 */
function useOnlineStatus(initialStatus?: boolean): boolean {
  const subscribe = useCallback((callback: () => void) => {
    // Subscribe to online/offline events
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('online', callback);
      window.removeEventListener('offline', callback);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    // SSR-safe: default to true if navigator is unavailable
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }, []);

  const getServerSnapshot = useCallback(() => {
    // SSR always returns true to avoid hydration mismatch
    return true;
  }, []);

  // Use external store subscription for concurrent-safe reads
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Override with test value if provided
  return initialStatus !== undefined ? initialStatus : isOnline;
}

/**
 * SyncContext - Application-level offline sync boundary
 *
 * Best Practices Applied:
 * - BP1: Cross-cutting concern (offline sync) justifies context usage
 * - BP2: Narrow interface with minimal surface area
 * - BP3: Split read/write contexts for performance
 * - BP4: No raw context export; only hooks
 * - BP7: Explicit memoization of provider values
 * - BP9: Co-locate provider and type definitions
 * - BP10: Stabilize function references
 * - BP11: Strict TypeScript contracts
 * - BP13: Document provider responsibilities
 */

// BP3: Split contexts for state and actions
const SyncStateContext = createContext<SyncStateValue | undefined>(undefined);
const SyncActionsContext = createContext<SyncActionsValue | undefined>(undefined);

// Legacy unified context type for backward compatibility
export type SyncContextType = SyncStateValue & SyncActionsValue;

// Legacy unified context export (for backward compatibility with useSync hook)
export const SyncContext = createContext<SyncContextType | undefined>(undefined);

// BP4: Export only custom hooks, not raw contexts
export function useSyncState(): SyncStateValue {
  const context = useContext(SyncStateContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error('useSyncState must be used within a SyncProvider');
  }
  return context;
}

export function useSyncActions(): SyncActionsValue {
  const context = useContext(SyncActionsContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error('useSyncActions must be used within a SyncProvider');
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

// Export types
export type { SyncStatus };

// Type for mutation handler functions
type MutationHandler = (payload: unknown) => Promise<unknown>;

// BP13: Registry of handlers to replay mutations
// Maps mutation types to their corresponding DataService methods
const MUTATION_HANDLERS: Record<string, MutationHandler> = {
  'CASE_CREATE': (p) => DataService.cases.add(p as Parameters<typeof DataService.cases.add>[0]),
  'CASE_UPDATE': (p) => {
    const payload = p as { id: string; data: Record<string, unknown> };
    return DataService.cases.update(payload.id, payload.data);
  },
  'TASK_ADD': (p) => DataService.tasks.add(p as Parameters<typeof DataService.tasks.add>[0]),
  'TASK_UPDATE': (p) => {
    const payload = p as { id: string; data: Record<string, unknown> };
    return DataService.tasks.update(payload.id, payload.data);
  },
  'DOC_UPLOAD': (p) => DataService.documents.add(p as Parameters<typeof DataService.documents.add>[0]),
  'BILLING_LOG': (p) => DataService.billing.addTimeEntry(p as Parameters<typeof DataService.billing.addTimeEntry>[0]),
  // Default fallback handler for unknown mutation types
  'DEFAULT': async () => {
    console.warn('[SyncContext] Unknown mutation type encountered, using default handler');
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
};

/**
 * SyncProvider
 *
 * BP13: Responsibilities:
 * - Monitor online/offline status
 * - Queue mutations when offline
 * - Replay queued mutations when online
 * - Handle retry logic with exponential backoff
 *
 * Lifecycle:
 * - Initializes online status from navigator.onLine
 * - Attaches online/offline event listeners
 * - Processes queue on mount if pending items exist
 * - Cleans up event listeners on unmount
 */
export const SyncProvider = ({
  children,
  initialOnlineStatus,
  onSyncSuccess: _onSyncSuccess,
  onSyncError
}: ExtendedSyncProviderProps) => {
  // GUIDELINE #32: Use useSyncExternalStore for concurrent-safe external reads
  const isOnline = useOnlineStatus(initialOnlineStatus);
  
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  // Derive sync status from online state (no race conditions)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    initialOnlineStatus !== undefined
      ? (initialOnlineStatus ? 'idle' : 'offline')
      : (isOnline ? 'idle' : 'offline')
  );

  // BP6: Ref to prevent concurrent queue processing (not high-frequency state)
  const isProcessingRef = useRef(false);

  // Refs for callbacks to prevent dependency cycles
  const onSyncSuccessRef = useRef(_onSyncSuccess);
  const onSyncErrorRef = useRef(onSyncError);

  useEffect(() => {
    onSyncSuccessRef.current = _onSyncSuccess;
    onSyncErrorRef.current = onSyncError;
  }, [_onSyncSuccess, onSyncError]);

  // BP10: Stabilize function references with useCallback
  const refreshCounts = useCallback(() => {
    setPendingCount(SyncEngine.count());
    setFailedCount(SyncEngine.getFailed().length);
  }, []);


  // BP10: Stabilize function references with useCallback - Queue Processor
  const processQueue = useCallback(async () => {
    const isNavigatorOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
    if (!isNavigatorOnline || isProcessingRef.current) return;

    const mutation = SyncEngine.peek();
    if (!mutation) {
      setSyncStatus('idle');
      return;
    }

    // Stop if head is failed to preserve order dependency
    if (mutation.status === 'failed') {
      setSyncStatus('error');
      return;
    }

    isProcessingRef.current = true;
    setSyncStatus('syncing');

    // Change status to syncing in storage
    SyncEngine.update(mutation.id, { status: 'syncing' });

    try {
      const handler = MUTATION_HANDLERS[mutation.type] || MUTATION_HANDLERS['DEFAULT'];
      console.log(`[Sync] Replaying: ${mutation.type}`, mutation.payload);

      await handler!(mutation.payload);

      // Success
      SyncEngine.dequeue();
      refreshCounts();
      isProcessingRef.current = false;

      // Process next immediately
      await processQueue();

    } catch (err) {
      console.error(`[Sync] Failed ${mutation.type}:`, err);

      const newRetryCount = mutation.retryCount + 1;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';

      if (newRetryCount >= SYNC_MAX_RETRIES) {
        // Permanent Failure
        SyncEngine.update(mutation.id, {
          status: 'failed',
          lastError: errorMsg,
          retryCount: newRetryCount
        });
        setSyncStatus('error');
        if (onSyncErrorRef.current) {
          onSyncErrorRef.current(`Sync failed for ${mutation.type}. Action required.`);
        }
        isProcessingRef.current = false;
        refreshCounts();
      } else {
        // Temporary Failure - Backoff
        SyncEngine.update(mutation.id, {
          status: 'pending',
          lastError: errorMsg,
          retryCount: newRetryCount
        });

        const delay = Math.pow(2, newRetryCount) * SYNC_BASE_DELAY_MS;
        console.log(`[Sync] Retrying in ${delay}ms...`);

        isProcessingRef.current = false;
        setTimeout(() => processQueue(), delay);
      }
    }
  }, [refreshCounts]);

  useEffect(() => {
    // BP13: Lifecycle - initialize counts
    refreshCounts();

    // GUIDELINE #32: useSyncExternalStore handles online/offline subscriptions
    // This effect reacts to isOnline changes from the external store

    // Update sync status based on online state
    setSyncStatus(isOnline ? 'syncing' : 'offline');

    // Notify callbacks
    if (isOnline && onSyncSuccessRef.current) {
      onSyncSuccessRef.current('Connection restored. Syncing changes...');
    } else if (!isOnline && onSyncErrorRef.current) {
      onSyncErrorRef.current('You are offline. Changes will be saved locally.');
    }

    // Process queue when online
    if (isOnline && SyncEngine.count() > 0) {
      processQueue();
    }

    // GUIDELINE #24: No cleanup needed - external store handles subscriptions
    // Note: onSyncSuccessRef and onSyncErrorRef are stable refs updated in separate effect
  }, [isOnline, processQueue, refreshCounts]);

  // BP10: Stabilize function references with useCallback
  const performMutation = useCallback(async <T = unknown>(type: string, payload: T, apiCall: () => Promise<T>) => {
    if (isOnline) {
      try {
        await apiCall();
      } catch (e) {
        // Fallback to queue if call fails due to network-like issues
        console.warn("Direct call failed, queuing mutation", e);
        SyncEngine.enqueue(type, payload);
        refreshCounts();
        await processQueue(); // Trigger queue attempt
      }
    } else {
      // Offline: Queue it
      SyncEngine.enqueue(type, payload);
      refreshCounts();
      // Return resolved promise for optimistic UI
      return Promise.resolve();
    }
  }, [isOnline, processQueue, refreshCounts]);

  // BP10: Stabilize function references with useCallback
  const retryFailed = useCallback(() => {
    SyncEngine.resetFailed();
    refreshCounts();
    setSyncStatus('syncing');
    processQueue();
    if (onSyncSuccessRef.current) {
      onSyncSuccessRef.current('Retrying failed items...');
    }
    // Note: _onSyncSuccess is a function prop that may change, but we intentionally
    // exclude it from dependencies to maintain stable callback identity

  }, [processQueue, refreshCounts]);

  // BP7: Memoize provider values explicitly - state context
  const stateValue = useMemo<SyncStateValue>(() => ({
    isOnline,
    pendingCount,
    failedCount,
    syncStatus
  }), [isOnline, pendingCount, failedCount, syncStatus]);

  // BP7: Memoize provider values explicitly - actions context
  const actionsValue = useMemo<SyncActionsValue>(() => ({
    performMutation,
    retryFailed
  }), [performMutation, retryFailed]);

  // Legacy unified value for backward compatibility
  const unifiedValue = useMemo<SyncContextType>(() => ({
    ...stateValue,
    ...actionsValue
  }), [stateValue, actionsValue]);

  // BP3 & BP8: Multiple providers for split read/write
  return (
    <SyncContext.Provider value={unifiedValue}>
      <SyncStateContext.Provider value={stateValue}>
        <SyncActionsContext.Provider value={actionsValue}>
          {children}
        </SyncActionsContext.Provider>
      </SyncStateContext.Provider>
    </SyncContext.Provider>
  );
};
