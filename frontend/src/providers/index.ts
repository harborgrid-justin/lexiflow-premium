/**
 * ================================================================================
 * PROVIDERS INDEX - PUBLIC API
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + React Router v7 + Context + Suspense
 * ================================================================================
 *
 * CANONICAL COMPOSITION:
 * ✅ RootProviders        - Use this (Infrastructure + Application only)
 * ⚠️  AppProviders        - DEPRECATED (includes DataLayer)
 * ⚠️  DataLayer           - DEPRECATED (domain providers → /routes/[feature]/)
 *
 * MIGRATION GUIDE: See DATA_LAYER_DEPRECATION.md
 * INTEGRATION GUIDE: See PROVIDER_INTEGRATION_GUIDE.tsx
 */

// ============================================================================
// ENTERPRISE STANDARD (✅ Use these)
// ============================================================================

/**
 * RootProviders - Canonical composition (Infrastructure + Application)
 * Use in main.tsx to wrap <RouterProvider>
 */
export { RootProviders, type RootProvidersProps } from "./RootProviders";

// ============================================================================
// LAYER EXPORTS
// ============================================================================
export { ApplicationLayer } from "./application/ApplicationLayer";
export { InfrastructureLayer } from "./infrastructure/InfrastructureLayer";

/**
 * @deprecated Use RootProviders instead
 * AppProviders includes DataLayer which is being removed
 */
export { AppProviders } from "./AppProviders";

/**
 * @deprecated Domain providers belong in /routes/[feature]/
 * DataLayer will be removed in next major version
 */
export { DataLayer } from "./data/DataLayer";

// ============================================================================
// APPLICATION LAYER PROVIDERS (Nested Structure)
// ============================================================================
export {
  AuthProvider,
  getAuditLogs,
  useAuth,
  useAuthActions,
  useAuthState,
} from "./application/authprovider";
export type {
  AuthActionsValue,
  AuthStateValue,
  AuthUser,
} from "./application/authprovider";
export { LayoutProvider } from "./application/layoutprovider";
// Note: FlagsProvider and EntitlementsProvider from nested structures available via nested imports

// ============================================================================
// NEW APPLICATION PROVIDERS
// ============================================================================
export type {
  AppPreferences,
  StateActionsValue,
  StateValue,
} from "@/lib/state";
export {
  StateProvider,
  useGlobalState,
  useGlobalStateActions,
} from "./application/stateprovider";

export type { UserActionsValue, UserProfile, UserStateValue } from "@/lib/user";
export {
  useCurrentUser,
  UserProvider,
  useUserActions,
  useUserState,
} from "./application/userprovider";

export { ApplicationErrorProvider } from "./application/errorprovider";

// ============================================================================
// DATA LAYER PROVIDERS (Nested Structure)
// ============================================================================
export {
  BillingProvider,
  useBilling,
  useBillingActions,
  useBillingState,
} from "./data/billingprovider";
export type {
  BillingActionsValue,
  BillingStateValue,
} from "./data/billingprovider";

export {
  CasesProvider,
  useCases,
  useCasesActions,
  useCasesState,
} from "./data/casesprovider";
export type { CasesActionsValue, CasesStateValue } from "./data/casesprovider";

export {
  DiscoveryProvider,
  useDiscovery,
  useDiscoveryActions,
  useDiscoveryState,
} from "./data/discoveryprovider";
export type {
  DiscoveryActionsValue,
  DiscoveryStateValue,
} from "./data/discoveryprovider";

export {
  DocumentsProvider,
  useDocuments,
  useDocumentsActions,
  useDocumentsState,
} from "./data/documentsprovider";
export type {
  DocumentsActionsValue,
  DocumentsStateValue,
} from "./data/documentsprovider";

export {
  DocketProvider,
  useDocket,
  useDocketActions,
  useDocketState,
} from "./data/docketprovider";
export type {
  DocketActionsValue,
  DocketStateValue,
} from "./data/docketprovider";

export {
  ClientsProvider,
  useClients,
  useClientsActions,
  useClientsState,
} from "./data/clientsprovider";
export type {
  ClientsActionsValue,
  ClientsStateValue,
} from "./data/clientsprovider";

export {
  TasksProvider,
  useTasks,
  useTasksActions,
  useTasksState,
} from "./data/tasksprovider";
export type { TasksActionsValue, TasksStateValue } from "./data/tasksprovider";

export {
  ComplianceProvider,
  useCompliance,
  useComplianceActions,
  useComplianceState,
} from "./data/complianceprovider";
export type {
  ComplianceActionsValue,
  ComplianceStateValue,
} from "./data/complianceprovider";

export {
  CommunicationsProvider,
  useCommunications,
  useCommunicationsActions,
  useCommunicationsState,
} from "./data/communicationsprovider";
export type {
  CommunicationsActionsValue,
  CommunicationsStateValue,
} from "./data/communicationsprovider";

export {
  AnalyticsProvider,
  useAnalytics,
  useAnalyticsActions,
  useAnalyticsState,
} from "./data/analyticsprovider";
export type {
  AnalyticsActionsValue,
  AnalyticsStateValue,
} from "./data/analyticsprovider";

export {
  TrialProvider,
  useTrial,
  useTrialActions,
  useTrialState,
} from "./data/trialprovider";
export type { TrialActionsValue, TrialStateValue } from "./data/trialprovider";

export { HRProvider, useHR, useHRActions, useHRState } from "./data/hrprovider";
export type { HRActionsValue, HRStateValue } from "./data/hrprovider";

// ============================================================================
// DATA LAYER ERROR PROVIDER
// ============================================================================
export { DataErrorProvider } from "./data/errorprovider";

// ============================================================================
// INFRASTRUCTURE LAYER PROVIDERS (Nested Structure)
// ============================================================================
export { EnvProvider, useEnv } from "./infrastructure/envprovider";
export { QueryClientProvider } from "./infrastructure/queryprovider";

// ============================================================================
// NEW INFRASTRUCTURE PROVIDERS
// ============================================================================
export type {
  Session,
  SessionActionsValue,
  SessionStateValue,
} from "@/lib/session";
export {
  SessionProvider,
  useSession,
  useSessionActions,
} from "./infrastructure/sessionprovider";

export { InfrastructureErrorProvider } from "./infrastructure/errorprovider";

export type { UtilityValue } from "@/lib/utility";
export { useUtility, UtilityProvider } from "./infrastructure/utilityprovider";

export type {
  AppConfig,
  ConfigActionsValue,
  ConfigStateValue,
} from "@/lib/config";
export {
  ConfigProvider,
  useConfig,
  useConfigActions,
  useConfigState,
} from "./infrastructure/configprovider";

export type {
  WebSocketActionsValue,
  WebSocketMessage,
  WebSocketStateValue,
  WebSocketStatus,
} from "@/lib/websocket";
export {
  useWebSocket,
  useWebSocketActions,
  useWebSocketState,
  WebSocketProvider,
} from "./infrastructure/websocketprovider";

// ============================================================================
// NEW APPLICATION PROVIDERS - SERVICE ORCHESTRATION
// ============================================================================
export type {
  ServiceActionsValue,
  ServiceHealth,
  ServiceStateValue,
} from "@/lib/service";
export {
  ServiceProvider,
  useService,
  useServiceActions,
  useServiceState,
} from "./application/serviceprovider";

// ============================================================================
// THEME & TOAST EXPORTS (from lib and hooks for compatibility)
// ============================================================================
// THEME EXPORTS (from lib for compatibility)
// ============================================================================
export { useTheme, useThemeContext } from "@/hooks/useTheme";
export { createTheme, ThemeContext } from "@/lib/theme";
export type { ThemeContextType, ThemeObject } from "@/lib/theme";
export type { ToastType } from "@/lib/toast/context";

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
  SearchableRepository,
  SearchOptions,
  SearchResult,
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
  createConfigFromEnv,
  createTestConfig,
  DataSourceConfigBuilder,
  DEFAULT_OBSERVABILITY,
  DEFAULT_RETRY,
  DEFAULT_TIMEOUTS,
  ENVIRONMENT_CONFIGS,
} from "./repository/config";

export {
  BusinessRuleError,
  ConcurrencyError,
  ConflictError,
  ErrorFactory,
  ForbiddenError,
  getErrorSeverity,
  getUserMessage,
  isRepositoryError,
  isRetryableError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  RepositoryError,
  ServerError,
  TimeoutError,
  UnauthorizedError,
  ValidationError,
} from "./repository/errors";

export type { ValidationFailure } from "./repository/errors";
