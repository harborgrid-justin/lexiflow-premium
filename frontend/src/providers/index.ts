/**
 * ================================================================================
 * PROVIDERS INDEX - PUBLIC API
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + React Router v7 + Context + Suspense
 * ================================================================================
 *
 * CANONICAL COMPOSITION:
 * ✅ RootProviders        - Use this (Infrastructure + Application only)
 *
 * DEPRECATED (REMOVED):
 * ❌ AppProviders         - Moved to archived/providers-deprecated/
 * ❌ DataLayer            - Moved to archived/providers-deprecated/
 *
 * MIGRATION GUIDE: See DATA_LAYER_DEPRECATION.md
 * INTEGRATION GUIDE: See PROVIDER_INTEGRATION_GUIDE.tsx
 */

// ============================================================================
// ENTERPRISE STANDARD (✅ Use these)
// ============================================================================

/**
 * RootProviders - Canonical composition (Infrastructure + Application)
 * Use in root.tsx to wrap application content
 */
export { RootProviders, type RootProvidersProps } from "./RootProviders";

// ============================================================================
// LAYER EXPORTS
// ============================================================================
export { ApplicationLayer } from "./application/ApplicationLayer";
export { InfrastructureLayer } from "./infrastructure/InfrastructureLayer";

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
// DEPRECATED DATA LAYER PROVIDERS - MOVED TO ARCHIVED
// ============================================================================
/**
 * Domain providers have been moved to archived/providers-deprecated/data/
 *
 * Per Enterprise React Architecture Standard:
 * - Domain providers belong in /routes/[feature]/ directories
 * - Use loader-based data fetching with Suspense boundaries
 * - Initialize providers with data from route loaders
 *
 * Migration example:
 * ```tsx
 * // routes/cases/index.tsx
 * export async function loader() {
 *   const cases = await api.cases.getAll();
 *   return defer({ cases });
 * }
 *
 * export function Component() {
 *   const { cases } = useLoaderData<typeof loader>();
 *   return (
 *     <Suspense fallback={<Skeleton />}>
 *       <Await resolve={cases}>
 *         {(data) => (
 *           <CasesProvider initialCases={data}>
 *             <CasesView />
 *           </CasesProvider>
 *         )}
 *       </Await>
 *     </Suspense>
 *   );
 * }
 * ```
 *
 * See DATA_LAYER_DEPRECATION.md for complete migration guide.
 */

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
