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
// LAYER EXPORTS (OUTER → INNER)
// ============================================================================
export { ApplicationLayer } from "./application/ApplicationLayer";
export { InfrastructureLayer } from "./infrastructure/InfrastructureLayer";

// ============================================================================
// INFRASTRUCTURE LAYER PROVIDERS (LOAD ORDER)
// ============================================================================
export {
  ConfigProvider,
  useConfig,
  useConfigActions,
  useConfigState,
} from "./infrastructure/configprovider";
export { EnvProvider, useEnv } from "./infrastructure/envprovider";
export { InfrastructureErrorProvider } from "./infrastructure/errorprovider";
export { QueryClientProvider } from "./infrastructure/queryprovider";
export {
  SessionProvider,
  useSession,
  useSessionActions,
} from "./infrastructure/sessionprovider";
export { ThemeProvider } from "./infrastructure/themeprovider";
export { ToastProvider } from "./infrastructure/toastprovider";
export { useUtility, UtilityProvider } from "./infrastructure/utilityprovider";
export {
  useWebSocket,
  useWebSocketActions,
  useWebSocketState,
  WebSocketProvider,
} from "./infrastructure/websocketprovider";

// ============================================================================
// APPLICATION LAYER PROVIDERS (LOAD ORDER)
// ============================================================================
export type {
  Role,
  RoleActionsValue,
  RoleStateValue,
  SystemRole,
} from "@/lib/role/types";
export type {
  ServiceActionsValue,
  ServiceHealth,
  ServiceStateValue,
} from "@/lib/service";
export type {
  AppPreferences,
  StateActionsValue,
  StateValue,
} from "@/lib/state";
export type { UserActionsValue, UserProfile, UserStateValue } from "@/lib/user";
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
export {
  EntitlementsProvider,
  useEntitlements,
  useEntitlementsActions,
  useEntitlementsState,
} from "./application/entitlementsprovider";
export type { EntitlementsProviderProps } from "./application/entitlementsprovider";
export { ApplicationErrorProvider } from "./application/errorprovider";
export {
  FlagsProvider,
  useFlags,
  useFlagsActions,
  useFlagsState,
} from "./application/flagsprovider";
export type { FlagsProviderProps } from "./application/flagsprovider";
export { LayoutProvider } from "./application/layoutprovider";
export {
  RoleProvider,
  useRoleActions,
  useRoleState,
} from "./application/roleprovider";
export {
  ServiceProvider,
  useService,
  useServiceActions,
  useServiceState,
} from "./application/serviceprovider";
export {
  StateProvider,
  useGlobalState,
  useGlobalStateActions,
} from "./application/stateprovider";
export {
  useCurrentUser,
  UserProvider,
  useUserActions,
  useUserState,
} from "./application/userprovider";

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
// INFRASTRUCTURE TYPES
// ============================================================================
export type {
  AppConfig,
  ConfigActionsValue,
  ConfigStateValue,
} from "@/lib/config";
export type {
  Session,
  SessionActionsValue,
  SessionStateValue,
} from "@/lib/session";
export type { UtilityValue } from "@/lib/utility";
export type {
  WebSocketActionsValue,
  WebSocketMessage,
  WebSocketStateValue,
  WebSocketStatus,
} from "@/lib/websocket";

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
