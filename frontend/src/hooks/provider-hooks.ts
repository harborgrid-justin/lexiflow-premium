/**
 * ================================================================================
 * PROVIDER HOOKS - CENTRALIZED EXPORTS
 * ================================================================================
 *
 * ENTERPRISE PATTERN:
 * This file provides a single import point for all provider hooks used in routes.
 * Routes should import from here rather than individual provider directories.
 *
 * ARCHITECTURE:
 * Infrastructure Layer (Theme, Config, Session)
 *   ↓
 * Application Layer (Auth, User, Entitlements, Role, Flags, Layout, State)
 *   ↓
 * Domain Layer (Route-specific providers)
 *
 * USAGE IN ROUTES:
 * ```tsx
 * import { useAuth, useEntitlements, useRole, useFlags, useLayout } from '@/hooks/provider-hooks';
 *
 * export function MyRouteComponent() {
 *   const { user } = useAuth();
 *   const { hasPermission } = useEntitlements();
 *   const { hasRole } = useRole();
 *   const { isEnabled } = useFlags();
 *   const { sidebarOpen, toggleSidebar } = useLayout();
 *
 *   // Use provider state
 * }
 * ```
 *
 * @module hooks/provider-hooks
 */

// Import hooks for use in combination functions
import {
  useEntitlementsActions as useEntitlementsActionsHook,
  useEntitlementsState as useEntitlementsStateHook,
} from "@/providers/application/entitlementsprovider";
import {
  useRoleActions as useRoleActionsHook,
  useRoleState as useRoleStateHook,
} from "@/providers/application/roleprovider";
import {
  useUserActions as useUserActionsHook,
  useUserState as useUserStateHook,
} from "@/providers/application/userprovider";
import { useAuthState as useAuthStateHook } from "./useAuth";

// ============================================================================
// INFRASTRUCTURE LAYER HOOKS
// ============================================================================

/**
 * Theme System Hook
 * Access theme mode, colors, and customization
 *
 * @example
 * const { theme, mode, setMode } = useTheme();
 */
export { useTheme } from "./useTheme";

/**
 * Configuration Hook
 * Access application configuration
 *
 * Note: Rarely needed in routes - config is mostly for services
 */
// export { useConfig } from '@/providers/infrastructure/configprovider';

/**
 * Session Hook
 * Access session state and lifecycle
 *
 * Note: Session is managed automatically by SessionProvider
 * Typically not needed directly in routes (use useAuth instead)
 */
// export { useSession } from '@/providers/infrastructure/sessionprovider';

// ============================================================================
// APPLICATION LAYER HOOKS
// ============================================================================

/**
 * Authentication Hook (Split Contexts)
 * Access auth state and actions separately for performance
 *
 * @example
 * // Use split contexts for optimal re-renders
 * const { user, isAuthenticated, requiresMFA } = useAuthState();
 * const { login, logout, verifyMFA } = useAuthActions();
 *
 * // Or use combined hook for convenience
 * const auth = useAuth();
 */
export type {
  AuthActionsValue,
  AuthStateValue,
} from "@/providers/application/authprovider";
export { useAuth, useAuthActions, useAuthState } from "./useAuth";

/**
 * User Profile Hook (Split Contexts)
 * Access current user profile and actions
 *
 * @example
 * const { profile, preferences } = useUserState();
 * const { updateProfile, updatePreferences } = useUserActions();
 *
 * // Or use convenience hook
 * const { user } = useCurrentUser();
 */
export type { UserActionsValue, UserProfile, UserStateValue } from "@/lib/user";
export {
  useCurrentUser,
  useUserActions,
  useUserState,
} from "@/providers/application/userprovider";

/**
 * Entitlements Hook (RBAC)
 * Access permissions and entitlement checks
 *
 * @example
 * const { entitlements, hasPermission, hasAnyPermission, hasAllPermissions } = useEntitlements();
 *
 * if (hasPermission('admin.users.write')) {
 *   // Show admin controls
 * }
 */
export type {
  Entitlements,
  EntitlementsActionsValue,
  EntitlementsStateValue,
} from "@/lib/entitlements/types";
export {
  useEntitlements,
  useEntitlementsActions,
  useEntitlementsState,
} from "@/providers/application/entitlementsprovider";

/**
 * Role Hook (Hierarchical RBAC)
 * Access role checks with hierarchy support
 *
 * @example
 * const { role, hasRole, canPerform, isAtLeast } = useRoleState();
 * const { setRole, grantPermission } = useRoleActions();
 *
 * if (hasRole('admin')) {
 *   // Show admin menu
 * }
 *
 * if (isAtLeast('manager')) {
 *   // Managers and above can see reports
 * }
 */
export type {
  Role,
  RoleActionsValue,
  RoleStateValue,
  SystemRole,
} from "@/lib/role/types";
export {
  useRoleActions,
  useRoleState,
} from "@/providers/application/roleprovider";

/**
 * Feature Flags Hook
 * Access feature flag checks
 *
 * @example
 * const { flags, isEnabled, isDisabled } = useFlagsState();
 * const { enableFlag, disableFlag } = useFlagsActions();
 *
 * if (isEnabled('aiAssistant')) {
 *   // Show AI features
 * }
 */
export type {
  Flags,
  FlagsActionsValue,
  FlagsStateValue,
} from "@/lib/flags/types";
export {
  useFlagsActions,
  useFlagsState,
} from "@/providers/application/flagsprovider";

/**
 * Layout Hook
 * Access global layout state (sidebar, panels)
 *
 * @example
 * const {
 *   sidebarOpen,
 *   sidebarCollapsed,
 *   activePanel,
 *   toggleSidebar,
 *   toggleSidebarCollapsed,
 *   setActivePanel
 * } = useLayout();
 *
 * // Used in AppShellLayout to coordinate sidebar state
 */
export type { LayoutContextValue } from "@/lib/layout/types";
export { useLayout } from "@/providers/application/layoutprovider";

/**
 * Global App State Hook (Split Contexts)
 * Access application-wide UI state
 *
 * @example
 * const { preferences, bookmarks, recentItems } = useGlobalState();
 * const { updatePreferences, addBookmark } = useGlobalStateActions();
 */
export type {
  AppPreferences,
  StateActionsValue,
  StateValue,
} from "@/lib/state";
export {
  useGlobalState,
  useGlobalStateActions,
} from "@/providers/application/stateprovider";

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Service Health Hook
 * Access backend service health status
 *
 * Note: Used in admin/monitoring views, not typical routes
 */
// export { useService } from '@/providers/application/serviceprovider';

// ============================================================================
// HOOK COMBINATIONS (Convenience)
// ============================================================================

/**
 * Combined Auth + User Hook
 * Convenience hook for common auth + profile pattern
 *
 * @example
 * const { user, profile, isAuthenticated, updateProfile } = useAuthUser();
 */
export function useAuthUser() {
  const authState = useAuthStateHook();
  const userState = useUserStateHook();
  const userActions = useUserActionsHook();

  return {
    // Auth state
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    requiresMFA: authState.requiresMFA,

    // User profile
    profile: userState.currentUser,
    permissions: userState.permissions,
    roles: userState.roles,

    // Actions
    updateProfile: userActions.updateProfile,
    uploadAvatar: userActions.uploadAvatar,
    refreshProfile: userActions.loadCurrentUser,
  };
}

/**
 * Combined Entitlements + Role Hook
 * Convenience hook for permission checks
 *
 * @example
 * const { hasPermission, hasRole, isAtLeast } = usePermissions();
 */
export function usePermissions() {
  const entitlementsState = useEntitlementsStateHook();
  const entitlementsActions = useEntitlementsActionsHook();
  const roleState = useRoleStateHook();
  const roleActions = useRoleActionsHook();

  return {
    entitlements: entitlementsState.entitlements,
    entitlementsLoading: entitlementsState.isLoading,
    entitlementsError: entitlementsState.error,
    refreshEntitlements: entitlementsActions.refresh,
    resetEntitlements: entitlementsActions.reset,

    roles: roleState.currentRoles,
    hasRole: roleActions.hasRole,
    hasAnyRole: roleActions.hasAnyRole,
    hasAllRoles: roleActions.hasAllRoles,
    hasRoleOrHigher: roleActions.hasRoleOrHigher,
    getAllPermissions: roleActions.getAllPermissions,
  };
}

// ============================================================================
// RE-EXPORT TYPES
// ============================================================================

export type { AuthUser } from "@/providers/application/authprovider";

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Admin Route
 * -----------------------
 * ```tsx
 * import { useAuth, useRole, useFlags } from '@/hooks/provider-hooks';
 *
 * export function AdminDashboard() {
 *   const { user } = useAuth();
 *   const { hasRole } = useRoleState();
 *   const { isEnabled } = useFlagsState();
 *
 *   if (!hasRole('admin')) {
 *     return <Forbidden />;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Admin Dashboard</h1>
 *       {isEnabled('adminTools') && <AdminTools />}
 *     </div>
 *   );
 * }
 * ```
 *
 * EXAMPLE 2: Dashboard with Preferences
 * --------------------------------------
 * ```tsx
 * import { useAuthUser, useGlobalState, useLayout } from '@/hooks/provider-hooks';
 *
 * export function Dashboard() {
 *   const { user, profile, preferences } = useAuthUser();
 *   const { bookmarks, recentItems } = useGlobalState();
 *   const { sidebarCollapsed } = useLayout();
 *
 *   return (
 *     <div className={sidebarCollapsed ? 'full-width' : 'with-sidebar'}>
 *       <h1>Welcome, {profile?.firstName}</h1>
 *       <RecentItems items={recentItems} />
 *     </div>
 *   );
 * }
 * ```
 *
 * EXAMPLE 3: Conditional Features
 * --------------------------------
 * ```tsx
 * import { usePermissions, useFlags } from '@/hooks/provider-hooks';
 *
 * export function CaseDetail() {
 *   const { hasPermission, hasRole } = usePermissions();
 *   const { isEnabled } = useFlagsState();
 *
 *   return (
 *     <div>
 *       {hasPermission('cases.write') && <EditButton />}
 *       {hasRole('attorney') && <LegalAnalysis />}
 *       {isEnabled('aiAssistant') && <AIHelper />}
 *     </div>
 *   );
 * }
 * ```
 */
