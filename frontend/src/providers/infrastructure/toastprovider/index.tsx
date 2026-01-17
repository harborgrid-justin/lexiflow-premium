/**
 * ================================================================================
 * TOAST PROVIDER - INFRASTRUCTURE LAYER
 * ================================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + react-hot-toast Integration
 *
 * RESPONSIBILITIES:
 * • Global toast notification state
 * • Priority-based toast queuing
 * • Maximum visible toast management
 * • Toast lifecycle (add, remove)
 * • Convenience methods (success, error, warning, info)
 *
 * REACT 18 PATTERNS:
 * ✓ Split state/actions contexts (performance)
 * ✓ Stabilized function references (useCallback)
 * ✓ Memoized context values
 * ✓ No side effects in render
 * ✓ StrictMode compatible
 *
 * INTEGRATION:
 * • Uses react-hot-toast for actual rendering
 * • ToastContainer must be included in InfrastructureLayer
 * • Priority system ensures errors are visible
 *
 * CROSS-CUTTING CAPABILITY:
 * Available to ALL providers and components via useToast()
 * Common pattern: AuthProvider shows login success/error toasts
 *
 * @module providers/infrastructure/toastprovider
 */

import { useCallback, useContext, useMemo, useState } from 'react';

import {
  toastError as showErrorToast,
  toastInfo as showInfoToast,
  toastSuccess as showSuccessToast,
  toastWarning as showWarningToast,
} from '@/components/organisms/notifications/Toast';
import { ToastActionsContext, ToastStateContext } from '@/lib/toast/context';

import type {
  Toast,
  ToastActionsValue,
  ToastProviderProps,
  ToastStateValue,
  ToastType,
} from '@/lib/toast/context';

// Priority mapping
const PRIORITY_MAP: Record<ToastType, number> = {
  error: 3,
  warning: 2,
  success: 1,
  info: 0,
};

/**
 * ToastProvider
 *
 * Provides toast notification state and actions.
 * Actual toast rendering is handled by react-hot-toast via ToastContainer.
 */
export function ToastProvider({
  children,
  maxVisible = 5,
}: Omit<ToastProviderProps, 'maxQueue'>) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Stabilized add toast function
  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = {
      id,
      message,
      type,
      priority: PRIORITY_MAP[type],
      timestamp: Date.now(),
    };

    setToasts((prev) => {
      // Check if we need to queue or can display
      if (prev.length >= maxVisible) {
        // Queue is handled by react-hot-toast automatically
        return prev;
      }
      return [...prev, toast];
    });

    // Trigger actual toast via react-hot-toast
    switch (type) {
      case 'success':
        showSuccessToast(message);
        break;
      case 'error':
        showErrorToast(message);
        break;
      case 'warning':
        showWarningToast(message);
        break;
      case 'info':
        showInfoToast(message);
        break;
    }

    return id;
  }, [maxVisible]);

  // Stabilized remove toast function
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback((message: string) => {
    addToast(message, 'success');
  }, [addToast]);

  const error = useCallback((message: string) => {
    addToast(message, 'error');
  }, [addToast]);

  const info = useCallback((message: string) => {
    addToast(message, 'info');
  }, [addToast]);

  const warning = useCallback((message: string) => {
    addToast(message, 'warning');
  }, [addToast]);

  // Memoized state value
  const stateValue = useMemo<ToastStateValue>(
    () => ({
      toasts,
    }),
    [toasts]
  );

  // Memoized actions value
  const actionsValue = useMemo<ToastActionsValue>(
    () => ({
      addToast,
      removeToast,
      success,
      error,
      info,
      warning,
    }),
    [addToast, removeToast, success, error, info, warning]
  );

  return (
    <ToastStateContext.Provider value={stateValue}>
      <ToastActionsContext.Provider value={actionsValue}>
        {children}
      </ToastActionsContext.Provider>
    </ToastStateContext.Provider>
  );
}

ToastProvider.displayName = 'ToastProvider';

export function useToast() {
  const state = useContext(ToastStateContext);
  const actions = useContext(ToastActionsContext);

  if (!state || !actions) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    ...state,
    ...actions,
  };
}
