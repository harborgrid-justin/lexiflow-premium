/**
 * Toast Context Types and Definitions
 *
 * ARCHITECTURE: Context definition for infrastructure-level toast notifications
 * Location: /lib/toast/ (utility layer)
 */

import { createContext } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  priority: number;
  timestamp: number;
  count?: number;
}

// Split contexts for state and actions
export interface ToastStateValue {
  toasts: readonly Toast[];
}

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

// Context definitions
export const ToastStateContext = createContext<ToastStateValue | undefined>(
  undefined
);
export const ToastActionsContext = createContext<ToastActionsValue | undefined>(
  undefined
);

ToastStateContext.displayName = "ToastStateContext";
ToastActionsContext.displayName = "ToastActionsContext";
