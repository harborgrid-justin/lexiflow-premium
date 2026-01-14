/**
 * ToastContext Type Definitions
 */

import type { ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  priority: number; // Higher is more important
  timestamp: number;
  count?: number; // For coalesced toasts
}

// BP2: Narrow interface - read-only state
// Guideline 33: Support transitional UI states
export interface ToastStateValue {
  readonly toasts: readonly Toast[];
  readonly isPending: boolean; // Transition state for concurrent updates
}

// BP2: Narrow interface - actions only
export interface ToastActionsValue {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void; // Clear all active toasts
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
  children: ReactNode;
  // BP14: Support test-friendly overrides
  maxVisible?: number;
  maxQueue?: number;
}

// Priority mapping type
export type PriorityMap = Record<ToastType, number>;
