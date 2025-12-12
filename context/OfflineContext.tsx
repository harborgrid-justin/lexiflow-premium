/**
 * OfflineContext.tsx
 * Offline support and data synchronization management
 * Handles offline queue, sync strategies, and conflict resolution
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'conflict';

export interface QueuedOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'success';
  error?: string;
}

export interface SyncConflict {
  id: string;
  operation: QueuedOperation;
  serverData: any;
  clientData: any;
  timestamp: Date;
}

export interface OfflineState {
  isOnline: boolean;
  syncStatus: SyncStatus;
  queue: QueuedOperation[];
  conflicts: SyncConflict[];
  lastSyncTime: Date | null;
  pendingCount: number;
  failedCount: number;
}

interface OfflineContextType {
  state: OfflineState;
  queueOperation: (operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>) => void;
  syncQueue: () => Promise<void>;
  clearQueue: () => void;
  retryFailed: () => Promise<void>;
  resolveConflict: (conflictId: string, resolution: 'client' | 'server' | 'merge', mergedData?: any) => void;
  getQueuedOperations: (resource?: string) => QueuedOperation[];
}

// ============================================================================
// Context Creation
// ============================================================================

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  QUEUE: 'offline_queue',
  CONFLICTS: 'offline_conflicts',
  LAST_SYNC: 'offline_last_sync',
};

// ============================================================================
// Provider Component
// ============================================================================

interface OfflineProviderProps {
  children: ReactNode;
  syncEndpoint?: string;
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({
  children,
  syncEndpoint = '/api/sync',
  autoSync = true,
  syncInterval = 30000, // 30 seconds
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [queue, setQueue] = useState<QueuedOperation[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // ============================================================================
  // Load persisted data
  // ============================================================================

  useEffect(() => {
    try {
      const savedQueue = localStorage.getItem(STORAGE_KEYS.QUEUE);
      if (savedQueue) {
        setQueue(JSON.parse(savedQueue));
      }

      const savedConflicts = localStorage.getItem(STORAGE_KEYS.CONFLICTS);
      if (savedConflicts) {
        setConflicts(JSON.parse(savedConflicts));
      }

      const savedLastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (savedLastSync) {
        setLastSyncTime(new Date(savedLastSync));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }, []);

  // ============================================================================
  // Persist queue changes
  // ============================================================================

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(conflicts));
  }, [conflicts]);

  // ============================================================================
  // Online/Offline Detection
  // ============================================================================

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoSync && queue.length > 0) {
        syncQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSync, queue.length]);

  // ============================================================================
  // Auto-sync interval
  // ============================================================================

  useEffect(() => {
    if (!autoSync || !isOnline) return;

    const interval = setInterval(() => {
      if (queue.length > 0 && syncStatus === 'idle') {
        syncQueue();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, isOnline, queue.length, syncStatus, syncInterval]);

  // ============================================================================
  // Queue Operations
  // ============================================================================

  const queueOperation = useCallback((
    operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>
  ) => {
    const newOperation: QueuedOperation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0,
      status: 'pending',
    };

    setQueue(prev => [...prev, newOperation]);
  }, []);

  // ============================================================================
  // Sync Queue
  // ============================================================================

  const syncQueue = useCallback(async () => {
    if (!isOnline || queue.length === 0 || syncStatus === 'syncing') {
      return;
    }

    setSyncStatus('syncing');

    const pendingOps = queue.filter(op => op.status === 'pending' || op.status === 'failed');

    try {
      for (const operation of pendingOps) {
        try {
          // Update operation status
          setQueue(prev =>
            prev.map(op =>
              op.id === operation.id ? { ...op, status: 'syncing' as const } : op
            )
          );

          // Send to server
          const response = await fetch(syncEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              operation: operation.type,
              resource: operation.resource,
              data: operation.data,
              timestamp: operation.timestamp,
            }),
          });

          if (!response.ok) {
            if (response.status === 409) {
              // Conflict detected
              const serverData = await response.json();
              const conflict: SyncConflict = {
                id: `conflict-${Date.now()}`,
                operation,
                serverData: serverData.data,
                clientData: operation.data,
                timestamp: new Date(),
              };
              setConflicts(prev => [...prev, conflict]);
              setSyncStatus('conflict');
            } else {
              throw new Error(`Sync failed: ${response.statusText}`);
            }
          } else {
            // Mark as success
            setQueue(prev =>
              prev.map(op =>
                op.id === operation.id ? { ...op, status: 'success' as const } : op
              )
            );
          }
        } catch (error) {
          // Mark as failed
          setQueue(prev =>
            prev.map(op =>
              op.id === operation.id
                ? {
                    ...op,
                    status: 'failed' as const,
                    retryCount: op.retryCount + 1,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  }
                : op
            )
          );
        }
      }

      // Remove successful operations
      setQueue(prev => prev.filter(op => op.status !== 'success'));

      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());

      setSyncStatus(conflicts.length > 0 ? 'conflict' : 'idle');
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    }
  }, [isOnline, queue, syncStatus, syncEndpoint, conflicts.length]);

  // ============================================================================
  // Clear Queue
  // ============================================================================

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(STORAGE_KEYS.QUEUE);
  }, []);

  // ============================================================================
  // Retry Failed Operations
  // ============================================================================

  const retryFailed = useCallback(async () => {
    setQueue(prev =>
      prev.map(op =>
        op.status === 'failed' ? { ...op, status: 'pending' as const } : op
      )
    );
    await syncQueue();
  }, [syncQueue]);

  // ============================================================================
  // Resolve Conflicts
  // ============================================================================

  const resolveConflict = useCallback(
    (conflictId: string, resolution: 'client' | 'server' | 'merge', mergedData?: any) => {
      const conflict = conflicts.find(c => c.id === conflictId);
      if (!conflict) return;

      let resolvedData: any;
      switch (resolution) {
        case 'client':
          resolvedData = conflict.clientData;
          break;
        case 'server':
          resolvedData = conflict.serverData;
          break;
        case 'merge':
          resolvedData = mergedData || { ...conflict.serverData, ...conflict.clientData };
          break;
      }

      // Re-queue the operation with resolved data
      queueOperation({
        type: conflict.operation.type,
        resource: conflict.operation.resource,
        data: resolvedData,
      });

      // Remove the conflict
      setConflicts(prev => prev.filter(c => c.id !== conflictId));

      // Update sync status
      if (conflicts.length === 1) {
        setSyncStatus('idle');
      }
    },
    [conflicts, queueOperation]
  );

  // ============================================================================
  // Get Queued Operations
  // ============================================================================

  const getQueuedOperations = useCallback(
    (resource?: string) => {
      if (!resource) return queue;
      return queue.filter(op => op.resource === resource);
    },
    [queue]
  );

  // ============================================================================
  // Compute derived state
  // ============================================================================

  const pendingCount = queue.filter(op => op.status === 'pending').length;
  const failedCount = queue.filter(op => op.status === 'failed').length;

  const state: OfflineState = {
    isOnline,
    syncStatus,
    queue,
    conflicts,
    lastSyncTime,
    pendingCount,
    failedCount,
  };

  const value: OfflineContextType = {
    state,
    queueOperation,
    syncQueue,
    clearQueue,
    retryFailed,
    resolveConflict,
    getQueuedOperations,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};

export default OfflineContext;
