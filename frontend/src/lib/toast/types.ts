/**
 * Toast Type Definitions
 *
 * Shared types for toast notification system.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/toast/types
 */

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  priority: number;
  timestamp: number;
  count?: number;
}

/**
 * State value exposed to consumers
 */
export interface ToastStateValue {
  toasts: readonly Toast[];
}

/**
 * Actions value exposed to consumers
 */
export interface ToastActionsValue {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export interface ToastContextValue extends ToastStateValue, ToastActionsValue {}

export interface ToastProviderProps {
  children: React.ReactNode;
  maxVisible?: number;
  maxQueue?: number;
}
