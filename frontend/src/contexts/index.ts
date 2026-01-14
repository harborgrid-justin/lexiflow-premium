// context/index.ts
// ============================================================================
// Global Context Providers & Hooks (APP-LEVEL ONLY)
// ============================================================================
//
// Per Enterprise Architecture Standard:
// - This file contains ONLY app-level/infrastructure contexts
// - Domain-specific contexts belong in their respective /routes folders
// - See /routes/cases, /routes/dashboard, /routes/_shared for feature contexts
//
// Best Practice Applied (BP4): Export only hooks, not raw contexts
// This enables invariant checks and future refactors without breaking consumers

// ============================================================================
// ROOT PROVIDER (Composed Infrastructure + App-Level)
// ============================================================================
// Composed Provider Tree (recommended way to use all global providers)
export { AppProviders } from "./AppProviders";

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
// DOMAIN-SPECIFIC CONTEXTS (Moved to /routes)
// ============================================================================
// These exports are DEPRECATED. Import from route folders instead:
//
// - CaseContext → import from "@/routes/cases"
// - DataContext → import from "@/routes/dashboard"
// - WindowContext → import from "@/routes/_shared"
// - SyncContext → import from "@/routes/_shared"
//
// Legacy re-exports below will be removed in future release:

// @deprecated Use @/routes/cases instead
export {
  CaseProvider,
  useCaseActions,
  useCaseContext,
  useCaseState,
} from "../routes/cases";
export type { CaseContextValue } from "../routes/cases";

// @deprecated Use @/routes/dashboard instead
export {
  DataProvider,
  useData,
  useDataActions,
  useDataState,
} from "../routes/dashboard";
export type { DashboardItem, DataContextValue } from "../routes/dashboard";

// @deprecated Use @/routes/_shared instead
export {
  WindowProvider,
  useWindow,
  useWindowActions,
  useWindowState,
} from "../routes/_shared";
export type { WindowInstance } from "../routes/_shared";

// @deprecated Use @/routes/_shared instead
export {
  SyncContext,
  SyncProvider,
  useSync,
  useSyncActions,
  useSyncState,
} from "../routes/_shared";
export type { SyncContextType, SyncStatus } from "../routes/_shared";

// @deprecated Use @/routes/dashboard instead
export {
  DataSourceProvider,
  useDataSource,
  useDataSourceActions,
  useDataSourceState,
} from "../routes/dashboard";
export type { DataSourceType } from "../routes/dashboard";

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
