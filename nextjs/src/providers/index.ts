// context/index.ts
// ============================================================================
// Context Providers & Hooks
// ============================================================================
//
// Best Practice Applied (BP4): Export only hooks, not raw contexts
// This enables invariant checks and future refactors without breaking consumers

// Composed Provider Tree (recommended way to use all providers)
export { AppProviders } from "./AppProviders";

// SyncContext exports
export type { SyncContextType } from "./SyncContext";
export type { SyncStatus } from "./SyncContext.types";
export {
  SyncContext,
  useSync,
  useSyncActions,
  useSyncState,
} from "./SyncHooks";
export { SyncProvider } from "./SyncProvider";

// ThemeContext exports
export { useTheme, useThemeActions, useThemeState } from "./ThemeHooks";
export { ThemeProvider } from "./ThemeProvider";

// ToastContext exports
export type { ToastType } from "./ToastContext.types";
export { useToast, useToastActions, useToastState } from "./ToastHooks";
export { ToastProvider } from "./ToastProvider";

// WindowContext exports
export type { WindowInstance } from "./WindowContext.types";
export { useWindow, useWindowActions, useWindowState } from "./WindowHooks";
export { WindowProvider } from "./WindowProvider";

// DataSourceContext exports
export type { DataSourceType } from "./DataSourceContext.types";
export {
  useDataSource,
  useDataSourceActions,
  useDataSourceState,
} from "./DataSourceHooks";
export { DataSourceProvider } from "./DataSourceProvider";

// Repository infrastructure exports
export type {
  AuthProvider,
  BaseRepository,
  BatchRepository,
  CaseRepository,
  ComplianceRepository,
  ConflictResult,
  DataOwnership,
  DocumentRepository,
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
export type { ThemeMode } from "../components/theme/tokens";
