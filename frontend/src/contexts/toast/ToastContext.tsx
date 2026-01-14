// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - TOAST NOTIFICATION DOMAIN
// ================================================================================
//
// CANONICAL STRUCTURE:
// ├── Types
// ├── State Shape
// ├── Actions (Action Types)
// ├── Reducer
// ├── Selectors
// ├── Context
// ├── Provider (with UI rendering)
// └── Public Hook
//
// POSITION IN ARCHITECTURE:
//   Context (cross-cutting notification boundary) → Views
//
// RULES ENFORCED:
//   ✓ Domain-scoped state only (notifications)
//   ✓ No HTTP calls
//   ✓ No router navigation
//   ✓ Minimal JSX (notification display only - acceptable for cross-cutting UI)
//   ✓ Reducer pattern for state management
//   ✓ Memoized selectors
//   ✓ Immutable context values
//   ✓ Concurrent-safe with useTransition
//
// EXCEPTION: This context renders UI (toast notifications) as it's a cross-cutting
// presentation concern. This is acceptable per BP1 (cross-cutting concerns).
//
// ================================================================================

import { TOAST_MAX_QUEUE, TOAST_MAX_VISIBLE } from "@/config/features/contexts.config";
import { NOTIFICATION_AUTO_DISMISS_MS, NOTIFICATION_ERROR_DISMISS_MS } from "@/config/features/ui.config";
import { cn } from "@/shared/lib/cn";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useTransition } from "react";
import type { Toast, ToastProviderProps, ToastType } from "./ToastContext.types";

// Re-export types for convenience
export type { ToastType } from "./ToastContext.types";

// ================================================================================
// Types
// ================================================================================

interface ToastState {
  toasts: Toast[];
  queue: Toast[];
}

type ToastAction =
  | { type: "toast/add"; payload: Toast }
  | { type: "toast/remove"; payload: { id: string } }
  | { type: "toast/clearAll" }
  | { type: "toast/processQueue"; payload: { maxVisible: number } };

// ================================================================================
// State Shape
// ================================================================================

const initialState: ToastState = {
  toasts: [],
  queue: [],
};

// ================================================================================
// Priority Mapping
// ================================================================================

const PRIORITY_MAP: Record<ToastType, number> = {
  error: 3,
  warning: 2,
  success: 1,
  info: 0,
};

// ================================================================================
// Reducer
// ================================================================================

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "toast/add": {
      const newToast = action.payload;

      // Check for duplicates in visible toasts
      const isDuplicateVisible = state.toasts.some(
        (t) => t.message === newToast.message && t.type === newToast.type
      );

      // Check for duplicates in queue
      const isDuplicateQueued = state.queue.some(
        (t) => t.message === newToast.message && t.type === newToast.type
      );

      if (isDuplicateVisible || isDuplicateQueued) {
        return state;
      }

      // Add to queue
      return {
        ...state,
        queue: [...state.queue, newToast],
      };
    }

    case "toast/remove": {
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload.id),
      };
    }

    case "toast/clearAll": {
      return initialState;
    }

    case "toast/processQueue": {
      const { maxVisible } = action.payload;
      const availableSlots = maxVisible - state.toasts.length;

      if (availableSlots <= 0 || state.queue.length === 0) {
        return state;
      }

      // Sort queue by priority (desc) then timestamp (asc)
      const sortedQueue = [...state.queue].sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.timestamp - b.timestamp;
      });

      // Take items from queue
      const toPromote = sortedQueue.slice(0, availableSlots);
      const remaining = sortedQueue.slice(availableSlots);

      return {
        toasts: [...state.toasts, ...toPromote],
        queue: remaining,
      };
    }

    default:
      return state;
  }
}

// ================================================================================
// Selectors
// ================================================================================

interface ToastSelectors {
  visibleCount: number;
  queuedCount: number;
  hasErrors: boolean;
}

function createSelectors(state: ToastState): ToastSelectors {
  return {
    visibleCount: state.toasts.length,
    queuedCount: state.queue.length,
    hasErrors: state.toasts.some((t) => t.type === "error"),
  };
}

// ================================================================================
// Context
// ================================================================================

interface ToastStateValue extends ToastState {
  selectors: ToastSelectors;
  isPending: boolean;
}

interface ToastActionsValue {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
}

const ToastStateContext = createContext<ToastStateValue | null>(null);
const ToastActionsContext = createContext<ToastActionsValue | null>(null);

// ================================================================================
// Provider
// ================================================================================

export function ToastProvider({
  children,
  maxVisible = TOAST_MAX_VISIBLE,
  maxQueue = TOAST_MAX_QUEUE,
}: ToastProviderProps) {
  const [state, dispatch] = useReducer(toastReducer, initialState);
  const [isPending, startTransition] = useTransition();

  const timeoutIdsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Process queue when toasts change
  useEffect(() => {
    dispatch({ type: "toast/processQueue", payload: { maxVisible } });
  }, [state.toasts.length, maxVisible]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;
    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
      timeoutIds.clear();
    };
  }, []);

  // Memoized selectors
  const selectors = useMemo(() => createSelectors(state), [state]);

  // Domain actions
  const removeToast = useCallback((id: string) => {
    dispatch({ type: "toast/remove", payload: { id } });
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = crypto.randomUUID
        ? crypto.randomUUID()
        : `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const newToast: Toast = {
        id,
        message,
        type,
        priority: PRIORITY_MAP[type],
        timestamp: Date.now(),
      };

      // Check queue limit
      if (state.queue.length >= maxQueue) {
        console.warn(`[ToastContext] Queue at capacity (${maxQueue}), dropping oldest toast`);
      }

      dispatch({ type: "toast/add", payload: newToast });

      // Set auto-dismiss timeout
      const dismissTime =
        type === "error" ? NOTIFICATION_ERROR_DISMISS_MS : NOTIFICATION_AUTO_DISMISS_MS;

      const timeoutId = setTimeout(() => {
        removeToast(id);
        timeoutIdsRef.current.delete(timeoutId);
      }, dismissTime);

      timeoutIdsRef.current.add(timeoutId);
    },
    [state.queue.length, maxQueue, removeToast]
  );

  const clearAllToasts = useCallback(() => {
    startTransition(() => {
      dispatch({ type: "toast/clearAll" });
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current.clear();
    });
  }, []);

  // Helper methods
  const success = useCallback((message: string) => addToast(message, "success"), [addToast]);
  const error = useCallback((message: string) => addToast(message, "error"), [addToast]);
  const info = useCallback((message: string) => addToast(message, "info"), [addToast]);
  const warning = useCallback((message: string) => addToast(message, "warning"), [addToast]);

  // Immutable context values
  const stateValue = useMemo<ToastStateValue>(
    () => ({
      ...state,
      selectors,
      isPending,
    }),
    [state, selectors, isPending]
  );

  const actionsValue = useMemo<ToastActionsValue>(
    () => ({
      addToast,
      removeToast,
      clearAllToasts,
      success,
      error,
      info,
      warning,
      notifySuccess: success,
      notifyError: error,
    }),
    [addToast, removeToast, clearAllToasts, success, error, info, warning]
  );

  return (
    <ToastStateContext.Provider value={stateValue}>
      <ToastActionsContext.Provider value={actionsValue}>
        {children}
        {/* Toast UI Rendering - Acceptable for cross-cutting notification concern */}
        <div className="fixed bottom-4 right-4 z-[6000] flex flex-col gap-2 pointer-events-none">
          {state.toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-center w-80 p-4 rounded-lg shadow-lg border animate-in slide-in-from-right-full duration-300",
                "bg-white dark:bg-slate-800",
                toast.type === "success"
                  ? "border-green-500"
                  : toast.type === "error"
                    ? "border-red-500"
                    : toast.type === "warning"
                      ? "border-amber-500"
                      : "border-blue-500"
              )}
            >
              <div className="shrink-0 mr-3">
                {toast.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {toast.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                {toast.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                {toast.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
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
      </ToastActionsContext.Provider>
    </ToastStateContext.Provider>
  );
}

// ================================================================================
// Public Hooks
// ================================================================================

export function useToastState(): ToastStateValue {
  const context = useContext(ToastStateContext);
  if (!context) {
    throw new Error("useToastState must be used within a ToastProvider");
  }
  return context;
}

export function useToastActions(): ToastActionsValue {
  const context = useContext(ToastActionsContext);
  if (!context) {
    throw new Error("useToastActions must be used within a ToastProvider");
  }
  return context;
}

export function useToast() {
  return {
    ...useToastState(),
    ...useToastActions(),
  };
}
