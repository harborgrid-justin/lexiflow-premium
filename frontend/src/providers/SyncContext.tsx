
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { SyncEngine, Mutation } from '@/services';
import { DataService } from '@/services';
import { useToast } from './ToastContext';
import type { SyncContextType } from './SyncContext.types';

// Create context in a separate variable to avoid Fast Refresh issues
const SyncContext = createContext<SyncContextType | undefined>(undefined);

// Export context (non-component export should be before component exports)
export { SyncContext };
export type { SyncContextType };

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

// Type for mutation handler functions
type MutationHandler = (payload: unknown) => Promise<unknown>;

// Registry of handlers to replay mutations
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

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'offline' | 'error'>(typeof navigator !== 'undefined' && navigator.onLine ? 'idle' : 'offline');
  const { addToast } = useToast();
  
  // Ref to prevent concurrent queue processing
  const isProcessingRef = useRef(false);

  const refreshCounts = useCallback(() => {
      setPendingCount(SyncEngine.count());
      setFailedCount(SyncEngine.getFailed().length);
  }, []);

  // Queue Processor
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
        await processQueue();

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
            addToast(`Sync failed for ${mutation.type}. Action required.`, 'error');
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
            setTimeout(() => processQueue(), delay);
        }
    }
  }, [addToast, refreshCounts]);

  useEffect(() => {
    refreshCounts();
    
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      addToast('Connection restored. Syncing changes...', 'success');
      processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
      addToast('You are offline. Changes will be saved locally.', 'warning');
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
  }, [addToast, processQueue, refreshCounts]);

  const performMutation = async <T = unknown>(type: string, payload: T, apiCall: () => Promise<T>) => {
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
  };

  const retryFailed = useCallback(() => {
      SyncEngine.resetFailed();
      refreshCounts();
      setSyncStatus('syncing');
      processQueue();
      addToast('Retrying failed items...', 'info');
  }, [addToast, processQueue, refreshCounts]);

  return (
    <SyncContext.Provider value={{ isOnline, pendingCount, failedCount, performMutation, retryFailed, syncStatus }}>
      {children}
    </SyncContext.Provider>
  );
};

