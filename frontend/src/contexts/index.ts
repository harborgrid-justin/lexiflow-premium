// ================================================================================
// CONTEXTS INDEX - APP-LEVEL CONTEXTS ONLY
// ================================================================================
//
// Per Enterprise React Architecture Standard:
//
// ARCHITECTURE LAYERING:
// /providers/     → Infrastructure (Env, Theme, Toast)
// /contexts/      → App-level (Auth, Permissions, Entitlements, Flags) ← THIS FILE
// /routes/[feat]/ → Domain (CaseProvider, DataProvider, WindowProvider, SyncProvider)
//
// WHAT BELONGS HERE:
// ✓ Authentication & Authorization (Auth)
// ✓ Entitlements & Feature Flags (Entitlements, Flags)
//
// WHAT DOES NOT BELONG HERE:
// ✗ Infrastructure contexts (Theme, Toast, QueryClient → /providers/)
// ✗ Domain contexts (CaseProvider → /routes/cases/)
// ✗ Data contexts (DataProvider → /routes/dashboard/)
// ✗ Window/Sync contexts (→ /routes/_shared/)
//
// Best Practice: Export hooks, not raw contexts
// ============================================================================

// ============================================================================
// ROOT PROVIDER (Composed Infrastructure + App-Level)
// ============================================================================
// Moved to '@/providers/AppProviders' - Use direct import or import from '@/providers'

// ============================================================================
// APP-LEVEL CONTEXTS (Global Infrastructure)
// ============================================================================

// AuthContext exports (App-level security)
export {
  AuthProvider,
  useAuth,
  useAuthActions,
  useAuthState,
} from "./auth/AuthContext";
export type { AuthUser, Organization } from "./auth/AuthContext";

// Entitlements exports (App-level permissions)
export {
  EntitlementsProvider,
  useEntitlements,
  useEntitlementsActions,
  useEntitlementsState,
} from "./entitlements/EntitlementsContext";
export type {
  Entitlements,
  EntitlementsContextValue,
  Plan,
} from "./entitlements/EntitlementsContext";

// Feature flag exports (App-level configuration)
export {
  FlagsProvider,
  useFlags,
  useFlagsActions,
  useFlagsState,
} from "./flags/FlagsContext";
export type { Flags, FlagsContextValue } from "./flags/FlagsContext";

// ============================================================================
// DOMAIN CONTEXTS (Live in /routes/)
// ============================================================================
// Per Enterprise Standard, domain contexts are route-specific:
//
// CASE MANAGEMENT:
//   import { CaseProvider, useCaseContext } from '@/routes/cases'
//
// DASHBOARD DATA:
//   import { DataProvider, useData } from '@/routes/dashboard'
//   import { DataSourceProvider, useDataSource } from '@/routes/dashboard'
//
// SHARED UTILITIES:
//   import { WindowProvider, useWindow } from '@/routes/_shared'
//   import { SyncProvider, useSync } from '@/routes/_shared'
//
// RULE: Domain contexts load with their routes, not globally.
// ============================================================================
// Type Exports (Consolidated)
// ============================================================================
// Import all types from the consolidated types file for convenience
export type * from "./types";

// ============================================================================
// Legacy Type Exports (for backward compatibility)
// ============================================================================

// Theme Context Types
export type { ThemeMode } from "@/contexts/ThemeContext";
