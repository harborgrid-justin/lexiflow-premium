/**
 * ================================================================================
 * TOAST PROVIDER - INFRASTRUCTURE LAYER
 * ================================================================================
 *
 * Enterprise React Architecture - Toast Notification Provider
 * Integrates with react-hot-toast for actual rendering
 *
 * Best Practices Applied:
 * - React 18 concurrent-safe patterns
 * - Split read/write contexts for performance
 * - Stabilized function references
 * - Explicit memoization
 * - Fail-fast error boundaries
 *
 * @module providers/infrastructure/ToastProvider
 */

import {
  toastError as showErrorToast,
  toastInfo as showInfoToast,
  toastSuccess as showSuccessToast,
  toastWarning as showWarningToast,
} from '@/components/organisms/notifications/Toast';
import type {
  Toast,
  ToastActionsValue,
  ToastProviderProps,
  ToastStateValue,
  ToastType,
} from '@/lib/toast/context';
import { ToastActionsContext, ToastStateContext } from '@/lib/toast/context';
import { useCallback, useMemo, useState } from 'react';

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
