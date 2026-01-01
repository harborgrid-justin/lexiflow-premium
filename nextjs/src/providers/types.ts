/**
 * Consolidated Provider Type Exports
 * 
 * BP9: Co-locate provider and type definitions
 * BP11: Define context contracts with explicit types
 * 
 * This barrel file provides a single import point for all provider types
 */

// Theme types
export type {
  ThemeStateValue,
  ThemeActionsValue,
  ThemeContextValue,
  ThemeProviderProps,
} from './ThemeContext.types';

// Toast types
export type {
  ToastType,
  Toast,
  ToastStateValue,
  ToastActionsValue,
  ToastContextValue,
  ToastProviderProps,
  PriorityMap,
} from './ToastContext.types';

// DataSource types
export type {
  DataSourceType,
  DataSourceStateValue,
  DataSourceActionsValue,
  DataSourceContextValue,
  DataSourceProviderProps,
} from './DataSourceContext.types';

// Window types
export type {
  WindowInstance,
  WindowStateValue,
  WindowActionsValue,
  WindowContextValue,
  WindowProviderProps,
  DragState,
} from './WindowContext.types';

// Sync types
export type {
  SyncStatus,
  SyncStateValue,
  SyncActionsValue,
  SyncContextValue,
  SyncProviderProps,
} from './SyncContext.types';
