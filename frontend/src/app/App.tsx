// src/app/App.tsx
import { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "../contexts/auth/AuthContext";
import { DataProvider } from "../contexts/data/DataContext";
import { EntitlementsProvider, useEntitlements } from "../contexts/entitlements/EntitlementsContext";
import { FlagsProvider, useFlags } from "../contexts/flags/FlagsContext";

import { AdminPath } from "./paths/AdminPath";
import { MemberPath } from "./paths/MemberPath";
import { PublicPath } from "./paths/PublicPath";

/**
 * App.tsx
 * -------
 * Clean routing with “group and/or flag triggers”:
 *  - Groups come from Auth (role: member/admin)
 *  - Flags come from FlagsContext
 *  - Entitlements can further constrain access
 *
 * The key idea:
 *  - Define route gating rules declaratively (as “policies”)
 *  - Keep the route tree readable and centralized
 */

/** "Group" is intentionally simple: you can map this to real org groups/claims. */
type Group = "guest" | "member" | "admin";

/** Route policy is intentionally small and readable. */
type RoutePolicy = {
  /** Which groups can enter this path (e.g., ["member", "admin"]). */
  allowGroups?: Group[];

  /** Require a specific feature flag to be true (e.g., "enableAdminTools"). */
  requireFlag?: keyof ReturnType<typeof useFlags>["flags"];

  /** Optional custom predicate for business-specific constraints (e.g., entitlement checks). */
  when?: (context: { entitlements: ReturnType<typeof useEntitlements>["entitlements"] }) => boolean;

  /** Where to send the user if they do not meet requirements. */
  fallback: string;
};

type GuardedRouteProps = {
  policy: RoutePolicy;
  element: ReactNode;
};

/**
 * GuardedRoute
 * -----------
 * A single, reusable guard that supports:
 *  - Group checks
 *  - Feature-flag checks
 *  - Optional entitlement/business checks via `when`
 */
const GuardedRoute: React.FC<GuardedRouteProps> = ({ policy, element }) => {
  const { auth } = useAuth();
  const { flags } = useFlags();
  const { entitlements } = useEntitlements();

  // Map system roles to simplified groups
  let group: Group = "guest";
  if (auth.status === "authenticated" && auth.user) {
    // Cast to string to avoid TS error if role type is strict
    const role = auth.user.role as string;
    if (role === "Administrator" || role === "admin") {
      group = "admin";
    } else {
      group = "member";
    }
  }

  const groupOk =
    !policy.allowGroups || policy.allowGroups.includes(group);

  const flagOk =
    !policy.requireFlag || Boolean(flags[policy.requireFlag]);

  /**
   * `when` is deliberately a function so the policy object stays simple.
   * It can reference any context via closures—here we provide a common example.
   *
   * If you prefer strict purity, pass required values into the policy builder instead.
   */
  const whenOk = policy.when ? policy.when({ entitlements }) : true;

  // Example: you may optionally want to ensure admin routes are also entitled.
  // You can encode this via policy.when (shown below in route config).
  void entitlements; // referenced indirectly by policies; keep lint happy if unused.

  const allowed = groupOk && flagOk && whenOk;

  return allowed ? <>{element}</> : <Navigate to={policy.fallback} replace />;
};

/**
 * Route configuration
 * -------------------
 * This is where the “beautifully organized” part lives:
 *  - Path
 *  - Element
 *  - Policy (group / flags / business constraints)
 */
const ROUTES = {
  public: {
    path: "/",
    element: <PublicPath />
  },

  app: {
    path: "/app",
    element: <MemberPath />,
    policy: {
      allowGroups: ["member", "admin"],
      fallback: "/"
    } satisfies RoutePolicy
  },

  admin: {
    path: "/admin",
    element: <AdminPath />,
    policy: {
      allowGroups: ["admin"],
      requireFlag: "enableAdminTools",
      fallback: "/app",
      // Demonstrates an entitlement constraint. Uses contexts via closure.
      when: ({ entitlements }) => {
        // Note: This relies on the hook being called inside GuardedRoute
        // which is valid as long as GuardedRoute is the component invoking it.
        return entitlements.canUseAdminTools;
      }
    } satisfies RoutePolicy
  },

  newDashboard: {
    /**
     * A distinct path driven purely by a flag.
     * If the flag is OFF, the route effectively becomes unreachable.
     */
    path: "/app/new",
    element: <MemberPath enableNewDashboard={true} />,
    policy: {
      allowGroups: ["member", "admin"],
      requireFlag: "enableNewDashboard",
      fallback: "/app"
    } satisfies RoutePolicy
  }
} as const;

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FlagsProvider initial={{ enableNewDashboard: true, enableAdminTools: true }}>
          <EntitlementsProvider>
            <DataProvider>
              <Routes>
                {/* Public route */}
                <Route path={ROUTES.public.path} element={ROUTES.public.element} />

                {/* Group-gated member route */}
                <Route
                  path={ROUTES.app.path}
                  element={<GuardedRoute policy={ROUTES.app.policy} element={ROUTES.app.element} />}
                />

                {/* Group + flag + entitlement-gated admin route */}
                <Route
                  path={ROUTES.admin.path}
                  element={<GuardedRoute policy={ROUTES.admin.policy} element={ROUTES.admin.element} />}
                />

                {/* Flag-triggered “parallel” member path */}
                <Route
                  path={ROUTES.newDashboard.path}
                  element={
                    <GuardedRoute policy={ROUTES.newDashboard.policy} element={ROUTES.newDashboard.element} />
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to={ROUTES.public.path} replace />} />
              </Routes>
            </DataProvider>
          </EntitlementsProvider>
        </FlagsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
