/**
 * Consolidated Provider Type Exports
 *
 * BP9: Co-locate provider and type definitions
 * BP11: Define context contracts with explicit types
 *
 * This barrel file provides a single import point for all provider types
 */

// Theme types (from centralized location)
export type {
  ThemeActionsValue,
  ThemeContextValue,
  ThemeProviderProps,
  ThemeStateValue,
} from "@/theme";

// Toast types
export type {
  PriorityMap,
  Toast,
  ToastActionsValue,
  ToastContextValue,
  ToastProviderProps,
  ToastStateValue,
  ToastType,
} from "./toast/ToastContext.types";

// DataSource types
export type {
  DataSourceActionsValue,
  DataSourceContextValue,
  DataSourceProviderProps,
  DataSourceStateValue,
  DataSourceType,
} from "./data/DataSourceContext.types";

// Window types
export type {
  DragState,
  WindowActionsValue,
  WindowContextValue,
  WindowInstance,
  WindowProviderProps,
  WindowStateValue,
} from "./window/WindowContext.types";

// Sync types
export type {
  SyncActionsValue,
  SyncContextValue,
  SyncProviderProps,
  SyncStateValue,
  SyncStatus,
} from "./sync/SyncContext.types";

// Data context types (dashboard data)
export type { DashboardItem, DataContextValue } from "./data/DataContext";

// Case context types
export type { CaseContextValue } from "./case/CaseContext";

// Entitlements context types
export type { Entitlements, EntitlementsContextValue, Plan } from "./entitlements/EntitlementsContext";

// Flags context types
export type { Flags, FlagsContextValue } from "./flags/FlagsContext";

// Auth context types (re-exported from enterprise location)
export type { AuthUser, AuthActionsValue, AuthStateValue } from "./auth/authTypes";
