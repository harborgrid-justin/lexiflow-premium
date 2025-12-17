
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { SyncEngine, Mutation } from '../services/syncEngine';
import { DataService } from '../services/dataService';
import { useToast } from './ToastContext';

export interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
  failedCount: number;
  performMutation: (type: string, payload: any, apiCall: () => Promise<any>) => Promise<void>;
  retryFailed: () => void;
  syncStatus: 'idle' | 'syncing' | 'offline' | 'error';
}

export const SyncContext = createContext<SyncContextType | undefined>(undefined);

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

// Registry of handlers to replay mutations
// In a real app, these would likely import specific service methods directly
const MUTATION_HANDLERS: Record<string, (payload: any) => Promise<any>> = {
    'CASE_CREATE': (p) => DataService.cases.add(p),
    'CASE_UPDATE': (p) => DataService.cases.update(p.id, p.data),
    'TASK_ADD': (p) => DataService.tasks.add(p),
    'TASK_UPDATE': (p) => DataService.tasks.update(p.id, p.data),
    'DOC_UPLOAD': (p) => DataService.documents.add(p), // Assuming payload is metadata
    'BILLING_LOG': (p) => DataService.billing.addTimeEntry(p),
    // Default fallback for demo visualization
    'DEFAULT': async (p) => new Promise(resolve => setTimeout(resolve, 1000))
};

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        processQueue();

    } catch (err: any) {
        console.error(`[Sync] Failed ${mutation.type}:`, err);
        
        const newRetryCount = mutation.retryCount + 1;
        const errorMsg = err.message || 'Unknown error';

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

  const performMutation = async (type: string, payload: any, apiCall: () => Promise<any>) => {
    if (isOnline) {
      try {
        await apiCall();
      } catch (e) {
        // Fallback to queue if call fails due to network-like issues
        console.warn("Direct call failed, queuing mutation", e);
        SyncEngine.enqueue(type, payload);
        refreshCounts();
        processQueue(); // Trigger queue attempt
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
