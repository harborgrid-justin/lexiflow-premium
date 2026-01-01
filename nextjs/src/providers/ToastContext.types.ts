/**
 * ToastContext Type Definitions
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  priority: number; // Higher is more important
  timestamp: number;
  count?: number; // For coalesced toasts
}

// BP2: Narrow interface - read-only state
export interface ToastStateValue {
  toasts: readonly Toast[];
}

// BP2: Narrow interface - actions only
export interface ToastActionsValue {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  // Legacy aliases for backward compatibility
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
}

// Combined interface for backward compatibility
export interface ToastContextValue extends ToastStateValue, ToastActionsValue {}

// Provider props
export interface ToastProviderProps {
  children: React.ReactNode;
  // BP14: Support test-friendly overrides
  maxVisible?: number;
  maxQueue?: number;
}

// Priority mapping type
export type PriorityMap = Record<ToastType, number>;
