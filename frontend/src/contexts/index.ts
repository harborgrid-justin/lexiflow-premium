// context/index.ts
// ============================================================================
// Context Providers & Hooks
// ============================================================================
//
// Best Practice Applied (BP4): Export only hooks, not raw contexts
// This enables invariant checks and future refactors without breaking consumers

// Composed Provider Tree (recommended way to use all providers)
export { AppProviders } from "./AppProviders";

// Case context exports
export { CaseProvider, useCaseContext, useCaseState, useCaseActions } from "./case/CaseContext";
export type { CaseContextValue } from "./case/CaseContext";

// AuthContext exports
export {
  AuthProvider,
  useAuth,
  useAuthActions,
  useAuthState,
} from "./AuthContext";
export type { AuthUser, Organization } from "./AuthContext";

// DataContext exports
export { DataProvider, useData, useDataState, useDataActions } from "./data/DataContext";
export type { DashboardItem, DataContextValue } from "./data/DataContext";

// Entitlements exports
export {
  EntitlementsProvider,
  useEntitlements,
  useEntitlementsState,
  useEntitlementsActions,
} from "./entitlements/EntitlementsContext";
export type {
  Entitlements,
  EntitlementsContextValue,
  Plan,
} from "./entitlements/EntitlementsContext";

// Feature flag exports
export { FlagsProvider, useFlags, useFlagsState, useFlagsActions } from "./flags/FlagsContext";
export type { Flags, FlagsContextValue } from "./flags/FlagsContext";

// Query Client provider export
export { QueryClientProvider } from "./query/QueryClientProvider";

// SyncContext exports
export {
  SyncContext,
  SyncProvider,
  useSync,
  useSyncActions,
  useSyncState,
} from "./sync/SyncContext";
export type { SyncContextType } from "./sync/SyncContext";
export type { SyncStatus } from "./sync/SyncContext.types";

// ThemeContext exports (re-exported from centralized location)
export { ThemeProvider, useTheme } from "@/features/theme";

// ToastContext exports
export {
  ToastProvider,
  useToast,
  useToastActions,
  useToastState,
} from "./toast/ToastContext";
export type { ToastType } from "./toast/ToastContext.types";

// WindowContext exports
export {
  WindowProvider,
  useWindow,
  useWindowActions,
  useWindowState,
} from "./window/WindowContext";
export type { WindowInstance } from "./window/WindowContext.types";

// DataSourceContext exports
export {
  DataSourceProvider,
  useDataSource,
  useDataSourceActions,
  useDataSourceState,
} from "./data/DataSourceContext";
export type { DataSourceType } from "./data/DataSourceContext.types";

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
export type { ThemeMode } from "@/features/theme";
