/**
 * Toast Context - Legacy file
 *
 * This file now re-exports from the split structure.
 * Use contexts.ts and types.ts for new imports.
 *
 * ARCHITECTURE: Context definition for infrastructure-level toast notifications
 * Location: /lib/toast/ (utility layer)
 */

// Re-export contexts
export { ToastActionsContext, ToastStateContext } from "./contexts";

// Re-export types
export type {
  Toast,
  ToastActionsValue,
  ToastContextValue,
  ToastProviderProps,
  ToastStateValue,
  ToastType,
} from "./types";
