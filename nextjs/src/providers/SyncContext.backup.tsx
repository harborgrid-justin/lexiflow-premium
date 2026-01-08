import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DataService } from '../services/data/dataService';
import { SyncEngine } from '../services/data/syncEngine';
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


const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

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
  // HYDRATION-SAFE: Check for browser environment before accessing navigator
  // Default to true for SSR to prevent server/client mismatch
  const [isOnline, setIsOnline] = useState(
    initialOnlineStatus !== undefined
      ? initialOnlineStatus
      : (typeof navigator !== 'undefined' ? navigator.onLine : true)
  );

  // Initialize counts from SyncEngine to avoid setState in effect
  const [pendingCount, setPendingCount] = useState(() => {
    const counts = SyncEngine.getCounts();
    return counts.pending;
  });
  const [failedCount, setFailedCount] = useState(() => {
    const counts = SyncEngine.getCounts();
    return counts.failed;
  });

  // HYDRATION-SAFE: Sync status initialization also checks environment
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    initialOnlineStatus !== undefined
      ? (initialOnlineStatus ? 'idle' : 'offline')
      : (typeof navigator !== 'undefined' && navigator.onLine ? 'idle' : 'offline')
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
    if (!navigator.onLine || isProcessingRef.current) return;

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

      await handler(mutation.payload);

      // Success
      SyncEngine.dequeue();
      refreshCounts();
      isProcessingRef.current = false;

      // Process next immediately
      await processQueueRef.current?.();

    } catch (err) {
      console.error(`[Sync] Failed ${mutation.type}:`, err);

      const newRetryCount = mutation.retryCount + 1;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';

      if (newRetryCount >= MAX_RETRIES) {
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

        const delay = Math.pow(2, newRetryCount) * BASE_DELAY;
        console.log(`[Sync] Retrying in ${delay}ms...`);

        isProcessingRef.current = false;
        setTimeout(() => processQueueRef.current?.(), delay);
      }
    }
  }, [refreshCounts]);

  // Assign ref for recursive calls in effect
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  useEffect(() => {
    // BP13: Lifecycle - initialize counts and event listeners
    // Initialize counts once on mount - already done via useState initializer

    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      if (onSyncSuccessRef.current) {
        onSyncSuccessRef.current('Connection restored. Syncing changes...');
      }
      processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
      if (onSyncErrorRef.current) {
        onSyncErrorRef.current('You are offline. Changes will be saved locally.');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (SyncEngine.count() > 0 && navigator.onLine) {
      processQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // Note: _onSyncSuccess and onSyncError are function props that may change, but we intentionally
    // exclude them from dependencies to avoid recreating event handlers on every render

  }, [processQueue, refreshCounts]);

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

  // BP3 & BP8: Multiple providers for split read/write
  return (
    <SyncStateContext.Provider value={stateValue}>
      <SyncActionsContext.Provider value={actionsValue}>
        {children}
      </SyncActionsContext.Provider>
    </SyncStateContext.Provider>
  );
};
