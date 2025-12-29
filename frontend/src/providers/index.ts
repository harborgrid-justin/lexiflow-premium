// context/index.ts
// ============================================================================
// Context Providers & Hooks
// ============================================================================
// 
// Best Practice Applied (BP4): Export only hooks, not raw contexts
// This enables invariant checks and future refactors without breaking consumers

// Composed Provider Tree (recommended way to use all providers)
export { AppProviders } from './AppProviders';

// SyncContext exports
export { SyncProvider, useSyncState, useSyncActions, useSync, SyncContext } from './SyncContext';
export type { SyncContextType } from './SyncContext';
export type { SyncStatus } from './SyncContext.types';

// ThemeContext exports
export { ThemeProvider, useThemeState, useThemeActions, useTheme } from './ThemeContext';

// ToastContext exports
export { ToastProvider, useToastState, useToastActions, useToast } from './ToastContext';
export type { ToastType } from './ToastContext.types';

// WindowContext exports
export { WindowProvider, useWindowState, useWindowActions, useWindow } from './WindowContext';
export type { WindowInstance } from './WindowContext.types';

// DataSourceContext exports
export { DataSourceProvider, useDataSourceState, useDataSourceActions, useDataSource } from './DataSourceContext';
export type { DataSourceType } from './DataSourceContext.types';

// Repository infrastructure exports
export type { 
  BaseRepository, 
  BatchRepository, 
  SearchableRepository,
  SearchOptions,
  SearchResult,
  CaseRepository,
  DocumentRepository,
  ComplianceRepository,
  ConflictResult,
  ScanResult,
  RepositoryRegistry,
  RepositoryFactory,
  RepositoryConfig,
  RepositoryLogger,
  RepositoryTracer,
  RepositoryMetrics,
  Span,
  AuthProvider,
  DataOwnership,
} from './repository/types';

export type {
  DataSourceConfig,
  DataSourceEnvironmentConfig,
  TimeoutConfig,
  RetryConfig,
  ObservabilityConfig,
} from './repository/config';

export { 
  DataSourceConfigBuilder,
  createConfigFromEnv,
  createTestConfig,
  DEFAULT_TIMEOUTS,
  DEFAULT_RETRY,
  DEFAULT_OBSERVABILITY,
  ENVIRONMENT_CONFIGS,
} from './repository/config';

export {
  RepositoryError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  NetworkError,
  TimeoutError,
  ServerError,
  RateLimitError,
  BusinessRuleError,
  ConcurrencyError,
  ErrorFactory,
  isRepositoryError,
  isRetryableError,
  getUserMessage,
  getErrorSeverity,
} from './repository/errors';

export type {
  ValidationFailure,
} from './repository/errors';

// ============================================================================
// Type Exports (Consolidated)
// ============================================================================
// Import all types from the consolidated types file for convenience
export type * from './types';

// ============================================================================
// Legacy Type Exports (for backward compatibility)
// ============================================================================

// Theme Context Types
export type { ThemeMode } from '../components/theme/tokens';

