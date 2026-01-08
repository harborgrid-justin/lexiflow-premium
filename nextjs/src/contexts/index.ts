/**
 * Contexts Barrel Export
 *
 * Central export point for all React contexts.
 * Exports only hooks (not raw contexts) following best practices
 * for invariant checks and future refactoring.
 *
 * @module contexts
 */

// ============================================================================
// Auth Context
// ============================================================================
export type { AuthUser, Organization, StorageType } from './AuthContext';
export {
  AuthProvider,
  useAuth,
  useAuthActions,
  useAuthState,
} from './AuthContext';

// ============================================================================
// Feature Flags Context
// ============================================================================
export type {
  Flags,
  FlagsActions,
  FlagsContextValue,
  FlagsProviderProps,
  FlagsState,
} from './FlagsContext';
export {
  FlagsProvider,
  useFlags,
  useFlagsActions,
  useFlagsState,
} from './FlagsContext';

// ============================================================================
// Entitlements Context
// ============================================================================
export type {
  Entitlements,
  EntitlementsActions,
  EntitlementsContextValue,
  EntitlementsProviderProps,
  EntitlementsState,
  Plan,
} from './EntitlementsContext';
export {
  EntitlementsProvider,
  useEntitlements,
  useEntitlementsActions,
  useEntitlementsState,
} from './EntitlementsContext';

// ============================================================================
// Data Context
// ============================================================================
export type {
  DashboardItem,
  DataActions,
  DataContextValue,
  DataProviderProps,
  DataState,
} from './DataContext';
export {
  DataProvider,
  useData,
  useDataActions,
  useDataState,
} from './DataContext';
