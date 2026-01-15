/**
 * ================================================================================
 * PROVIDERS INDEX - PUBLIC API
 * ================================================================================
 */

export {
  ThemeContext,
  ThemeProvider,
  createTheme,
  useThemeContext,
} from "@/contexts/ThemeContext";
export type { ThemeContextType, ThemeObject } from "@/contexts/ThemeContext";
export {
  ToastProvider,
  useToast,
  useToastActions,
  useToastState,
} from "@/contexts/toast/ToastContext";
export type { ToastType } from "@/contexts/toast/ToastContext.types";
export { useTheme } from "@/hooks/useTheme";
export { ApplicationLayer } from "./application/ApplicationLayer";
export { AppProviders } from "./AppProviders";
export { EnvProvider, useEnv } from "./infrastructure/EnvProvider";
export { InfrastructureLayer } from "./infrastructure/InfrastructureLayer";
export { LayoutProvider } from "./infrastructure/LayoutProvider";
export { QueryClientProvider } from "./infrastructure/query/QueryClientProvider";
export { ThemeProvider } from "./infrastructure/ThemeProvider";
export { ToastProvider } from "./infrastructure/ToastProvider";

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
