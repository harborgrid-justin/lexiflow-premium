import { TOAST_MAX_QUEUE, TOAST_MAX_VISIBLE } from '@/config/features/contexts.config';
import { NOTIFICATION_AUTO_DISMISS_MS, NOTIFICATION_ERROR_DISMISS_MS } from '@/config/features/ui.config';
import { cn } from '@/shared/lib/cn';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  PriorityMap,
  Toast,
  ToastActionsValue,
  ToastProviderProps,
  ToastStateValue,
  ToastType,
} from './ToastContext.types';

/**
 * ToastContext - Application-level notification boundary
 *
 * React v18 Guidelines Applied:
 * - Guideline 22: Immutable context values (frozen in dev)
 * - Guideline 25: startTransition for non-urgent dismissals
 * - Guideline 33: Explicit isPending state for transitions
 * - Guideline 38: Concurrent-safe defaults (non-placeholder)
 * - BP1: Cross-cutting concern (notifications) justifies context usage
 * - BP2: Narrow interface with minimal surface area
 * - BP3: Split read/write contexts for performance
 * - BP4: No raw context export; only hooks
 * - BP10: Stabilize function references
 */

// Re-export types for convenience
export type { ToastType } from './ToastContext.types';

// Guideline 38: ENSURE CONTEXT DEFAULTS ARE CONCURRENT-SAFE
// Immutable, non-placeholder defaults
const DEFAULT_STATE: ToastStateValue = Object.freeze({
  toasts: [],
  isPending: false,
});

const DEFAULT_ACTIONS: ToastActionsValue = Object.freeze({
  addToast: () => { throw new Error('ToastProvider not mounted'); },
  removeToast: () => { throw new Error('ToastProvider not mounted'); },
  clearAllToasts: () => { throw new Error('ToastProvider not mounted'); },
});

// BP3: Split contexts for state and actions
const ToastStateContext = createContext<ToastStateValue>(DEFAULT_STATE);
const ToastActionsContext = createContext<ToastActionsValue>(DEFAULT_ACTIONS);

// BP4: Export only custom hooks, not raw contexts
export function useToastState(): ToastStateValue {
  const context = useContext(ToastStateContext);
  // BP5: Fail fast when provider is missing
  if (context === DEFAULT_STATE) {
    throw new Error('useToastState must be used within a ToastProvider');
  }
  return context;
}

export function useToastActions(): ToastActionsValue {
  const context = useContext(ToastActionsContext);
  // BP5: Fail fast when provider is missing
  if (context === DEFAULT_ACTIONS) {
    throw new Error('useToastActions must be used within a ToastProvider');
  }
  return context;
}

// Convenience hook for consumers that need both (backward compatibility)
export function useToast() {
  return {
    ...useToastState(),
    ...useToastActions(),
  };
}

// Priority mapping
const PRIORITY_MAP: PriorityMap = {
  'error': 3,
  'warning': 2,
  'success': 1,
  'info': 0
};

export const ToastProvider = ({
  children,
  maxVisible = TOAST_MAX_VISIBLE,
  maxQueue = TOAST_MAX_QUEUE
}: ToastProviderProps) => {
  // Guideline 25: USE startTransition FOR NON-URGENT CONTEXT UPDATES
  // Guideline 33: DESIGN CONTEXT APIS TO SUPPORT TRANSITIONAL UI STATES
  const [isPending, startTransition] = useTransition();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastsRef = useRef<Toast[]>([]);
  const queueRef = useRef<Toast[]>([]);
  const timeoutIdsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Keep toastsRef in sync with state for stable callbacks
  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  // BP13: Document lifecycle - cleanup all timeouts on unmount
  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
      timeoutIds.clear();
    };
  }, []);

  // BP10: Stabilize function references with useCallback
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    // Process queue after removing to fill the slot
    // processQueue(); // Removed to avoid circular dependency
  }, []);

  // Clear all toasts and queue
  const clearAllToasts = useCallback(() => {
    startTransition(() => {
      setToasts([]);
      queueRef.current = [];
      // Clear all pending timeouts
      timeoutIdsRef.current.forEach(id => clearTimeout(id));
      timeoutIdsRef.current.clear();
    });
  }, []);

  // BP10: Stabilize function references with useCallback
  const processQueue = useCallback(() => {
    setToasts(prev => {
      // If we have space
      if (prev.length < maxVisible && queueRef.current.length > 0) {
        // Get highest priority items from queue
        // Queue sort: Priority Desc, then Timestamp Asc
        queueRef.current.sort((a, b) => {
          if (a.priority !== b.priority) return b.priority - a.priority;
          return a.timestamp - b.timestamp;
        });

        const nextToast = queueRef.current.shift();
        if (nextToast) {
          // Auto-dismiss logic with cleanup tracking
          const timeoutId = setTimeout(() => {
            removeToast(nextToast.id);
            timeoutIdsRef.current.delete(timeoutId);
          }, nextToast.type === 'error' ? NOTIFICATION_ERROR_DISMISS_MS : NOTIFICATION_AUTO_DISMISS_MS);
          timeoutIdsRef.current.add(timeoutId);
          return [...prev, nextToast];
        }
      }
      return prev;
    });
  }, [maxVisible, removeToast]);

  // Trigger processing whenever toasts state changes (slot frees up)
  useEffect(() => {
    if (toasts.length < maxVisible) {
      processQueue();
    }
  }, [toasts.length, processQueue, maxVisible]);

  // BP10: Stabilize function references with useCallback
  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    // DEDUPLICATION: Check if identical toast is already visible or in queue
    const isDuplicateVisible = toastsRef.current.some(t => t.message === message && t.type === type);
    const isDuplicateQueued = queueRef.current.some(t => t.message === message && t.type === type);

    if (isDuplicateVisible || isDuplicateQueued) {
      // Optional: We could increment a counter on the visible toast here
      return;
    }

    // Safety check: if queue is at max capacity, remove lowest priority oldest items
    if (queueRef.current.length >= maxQueue) {
      // Sort by priority (ascending) then timestamp (ascending) to find least important
      queueRef.current.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.timestamp - b.timestamp;
      });

      // Remove oldest, lowest priority item
      const removed = queueRef.current.shift();
      console.warn(`[ToastContext] Queue at capacity (${maxQueue}), dropped toast: ${removed?.message}`);
    }

    const id = crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = {
      id,
      message,
      type,
      priority: PRIORITY_MAP[type],
      timestamp: Date.now()
    };

    queueRef.current.push(newToast);
    processQueue();
  }, [processQueue, maxQueue]);

  // BP10: Stabilize function references - helper methods
  const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);
  const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast]);

  // Guideline 22: DESIGN CONTEXT VALUES TO BE CONCURRENT-SAFE
  // Guideline 33: DESIGN CONTEXT APIS TO SUPPORT TRANSITIONAL UI STATES
  const stateValue = useMemo<ToastStateValue>(() => {
    const value = {
\n      toasts,
  isPending, \n
    };
return process.env.NODE_ENV === 'development' ? Object.freeze(value) : value;
  }, [toasts, isPending]);

// BP7: Memoize provider values explicitly - actions context
const actionsValue = useMemo<ToastActionsValue>(() => ({
  addToast,
  removeToast,
  clearAllToasts,
  success,
  error,
  info,
  warning,
  notifySuccess: success,
  notifyError: error,
}), [addToast, removeToast, clearAllToasts, success, error, info, warning]);
{ children }
<div className="fixed bottom-4 right-4 z-[6000] flex flex-col gap-2 pointer-events-none">
  {toasts.map((toast) => (
    <div
      key={toast.id}
      className={cn(
        "pointer-events-auto flex items-center w-80 p-4 rounded-lg shadow-lg border animate-in slide-in-from-right-full duration-300",
        "bg-white dark:bg-slate-800",
        toast.type === 'success' ? "border-green-500" :
          toast.type === 'error' ? "border-red-500" :
            toast.type === 'warning' ? "border-amber-500" : "border-blue-500"
      )}
    >
      <div className="shrink-0 mr-3">
        {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
        {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
        {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
        {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
      </div>
      <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
        {toast.message}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  ))}
</div>
    </ToastActionsContext.Provider >
  </ToastStateContext.Provider >
);
};
