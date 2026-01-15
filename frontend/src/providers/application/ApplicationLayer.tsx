/**
 * ================================================================================
 * APPLICATION LAYER - GLOBAL APP CONTEXTS
 * ================================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + React Router v7 + Context + Suspense
 *
 * POSITION: MID LAYER (between Infrastructure and Domain)
 *
 * LAYERING HIERARCHY (OUTER → INNER):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ ApplicationErrorProvider  (Error boundary)                  │
 * │  └─ AuthProvider          (Authentication)                  │
 * │     └─ FlagsProvider      (Feature flags)                   │
 * │        └─ EntitlementsProvider (Permissions/RBAC)           │
 * │           └─ ServiceProvider (Service health)               │
 * │              └─ StateProvider (Global UI state)             │
 * │                 └─ UserProvider (Current user)              │
 * │                    └─ LayoutProvider (Layout state)         │
 * └─────────────────────────────────────────────────────────────┘
 *
 * RESPONSIBILITIES:
 * ═══════════════════════════════════════════════════════════════
 * • Authentication state (login, logout, session)
 * • Authorization/permissions (RBAC, entitlements)
 * • Feature flags (A/B testing, gradual rollout)
 * • Global UI state (sidebar, active view, bookmarks)
 * • Current user profile and preferences
 * • Service health monitoring
 * • Layout state (collapsed sidebar, active panels)
 * • Application-level error boundaries
 *
 * CRITICAL RULES (NON-NEGOTIABLE):
 * ═══════════════════════════════════════════════════════════════
 * 1. LOADER-BASED INITIALIZATION
 *    • AuthProvider should receive initial auth state from loader
 *    • UserProvider should receive user data from loader
 *    • NO data fetching in provider constructors
 *    • Hydrate from loader data, NOT from effects
 *
 * 2. DATA FLOW
 *    SERVER → LOADER → PROVIDER PROPS → CONTEXT → VIEWS
 *    • Loaders are the source of truth
 *    • Providers derive and expose state
 *    • Views consume via hooks
 *
 * 3. NO BUSINESS LOGIC
 *    • No case management
 *    • No document operations
 *    • No domain-specific state
 *    • Only app-wide concerns
 *
 * 4. DEPENDS ONLY ON INFRASTRUCTURE
 *    • Can use ThemeProvider, EnvProvider, etc.
 *    • CANNOT depend on Domain layer
 *    • CANNOT depend on Route-specific contexts
 *
 * 5. SPLIT STATE/ACTIONS CONTEXTS
 *    • AuthStateContext + AuthActionsContext
 *    • Prevents unnecessary re-renders
 *    • Actions context is stable (useCallback)
 *
 * ENTERPRISE INVARIANTS:
 * ═══════════════════════════════════════════════════════════════
 * • Context values are stable and memoized
 * • State updates use startTransition for non-urgent changes
 * • All mutations are immutable
 * • Providers handle double-invocation (StrictMode)
 * • Cleanup functions for all subscriptions
 * • No render-phase side effects
 * • Error boundaries isolate failures
 *
 * INTEGRATION WITH LOADERS:
 * ═══════════════════════════════════════════════════════════════
 * ```tsx
 * // app/layout/loader.ts
 * export async function loader({ request }: Route.LoaderArgs) {
 *   const authState = await getAuthState(request);
 *   const user = await getCurrentUser(request);
 *   const flags = await getFeatureFlags();
 *
 *   return defer({
 *     authState,    // Critical - awaited
 *     user,         // Critical - awaited
 *     flags,        // Critical - awaited
 *   });
 * }
 *
 * // app/layout/AppLayout.tsx
 * export function AppLayout() {
 *   const { authState, user, flags } = useLoaderData();
 *
 *   return (
 *     <ApplicationLayer
 *       initialAuth={authState}
 *       initialUser={user}
 *       initialFlags={flags}
 *     >
 *       <Outlet />
 *     </ApplicationLayer>
 *   );
 * }
 * ```
 *
 * @module providers/application
 */

import { EntitlementsProvider } from "@/lib/entitlements/context";
import { FlagsProvider, FlagsProviderProps } from "@/lib/flags/context";
import { AuthProvider } from "@/providers/application/authprovider";
import { ApplicationErrorProvider } from "@/providers/application/errorprovider";
import { LayoutProvider } from "@/providers/application/layoutprovider";
import { RoleProvider } from "@/providers/application/roleprovider";
import { ServiceProvider } from "@/providers/application/serviceprovider";
import { StateProvider } from "@/providers/application/stateprovider";
import { UserProvider } from "@/providers/application/userprovider";
import { ReactNode } from "react";

export interface ApplicationLayerProps {
  children: ReactNode;
  /**
   * Initial feature flags (from loader)
   * LOADER-BASED INITIALIZATION - preferred over useEffect fetching
   */
  initialFlags?: FlagsProviderProps["initial"];
  /**
   * Initial auth state (from loader)
   * Future: Should be provided by root loader for SSR support
   */
  initialAuth?: unknown;
  /**
   * Initial user data (from loader)
   * Future: Should be provided by root loader for SSR support
   */
  initialUser?: unknown;
}

export function ApplicationLayer({
  children,
  initialFlags,
  initialAuth,
  initialUser
}: ApplicationLayerProps) {
  return (
    <ApplicationErrorProvider>
      <AuthProvider initialAuth={initialAuth}>
        <FlagsProvider initial={initialFlags}>
          <EntitlementsProvider>
            <RoleProvider>
              <ServiceProvider healthCheckInterval={60000}>
                <StateProvider>
                  <UserProvider autoLoad={true} initialUser={initialUser}>
                    <LayoutProvider>
                      {children}
                    </LayoutProvider>
                  </UserProvider>
                </StateProvider>
              </ServiceProvider>
            </RoleProvider>
          </EntitlementsProvider>
        </FlagsProvider>
      </AuthProvider>
    </ApplicationErrorProvider>
  );
}
