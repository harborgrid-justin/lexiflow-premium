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
// ✓ Authentication & Authorization (Auth, Permissions)
// ✓ Entitlements & Feature Flags (Entitlements, Flags)
// ✓ Infrastructure (Theme, Toast, QueryClient)
//
// WHAT DOES NOT BELONG HERE:
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
} from "./AuthContext";
export type { AuthUser, Organization } from "./AuthContext";

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

// ThemeContext exports (Infrastructure-level UI)
export { ThemeProvider, useTheme } from "@/theme";

// ToastContext exports (Infrastructure-level notifications)
export {
  ToastProvider,
  useToast,
  useToastActions,
  useToastState,
} from "./toast/ToastContext";
export type { ToastType } from "./toast/ToastContext.types";

// Query Client provider export (Infrastructure-level data fetching)
export { QueryClientProvider } from "./query/QueryClientProvider";

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
// Repository infrastructure exports
export type {
  BaseRepository,
  BatchRepository,
  CaseRepository,
  ComplianceRepository,
  ConflictResult,
  DataOwnership,
  DocumentRepository,
  AuthProvider as RepositoryAuthProvider,
  RepositoryConfig,
  RepositoryFactory,
  RepositoryLogger,
  RepositoryMetrics,
  RepositoryRegistry,
  RepositoryTracer,
  ScanResult,
  SearchOptions,
  SearchResult,
  SearchableRepository,
  Span,
} from "./repository/types";

export type {
  DataSourceConfig,
  DataSourceEnvironmentConfig,
  ObservabilityConfig,
  RetryConfig,
  TimeoutConfig,
} from "./repository/config";

export {
  DEFAULT_OBSERVABILITY,
  DEFAULT_RETRY,
  DEFAULT_TIMEOUTS,
  DataSourceConfigBuilder,
  ENVIRONMENT_CONFIGS,
  createConfigFromEnv,
  createTestConfig,
} from "./repository/config";

export {
  BusinessRuleError,
  ConcurrencyError,
  ConflictError,
  ErrorFactory,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  RepositoryError,
  ServerError,
  TimeoutError,
  UnauthorizedError,
  ValidationError,
  getErrorSeverity,
  getUserMessage,
  isRepositoryError,
  isRetryableError,
} from "./repository/errors";

export type { ValidationFailure } from "./repository/errors";

// ============================================================================
// Type Exports (Consolidated)
// ============================================================================
// Import all types from the consolidated types file for convenience
export type * from "./types";

// ============================================================================
// Legacy Type Exports (for backward compatibility)
// ============================================================================

// Theme Context Types
export type { ThemeMode } from "@/theme";
