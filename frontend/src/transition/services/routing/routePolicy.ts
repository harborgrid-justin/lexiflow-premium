/**
 * Route policy - Route-level configuration
 */

export interface RoutePolicy {
  requiresAuth: boolean;
  roles?: string[];
  permissions?: string[];
  prefetch?: boolean;
}

export const routePolicies: Record<string, RoutePolicy> = {
  "/dashboard": {
    requiresAuth: true,
    prefetch: true,
  },
  "/billing": {
    requiresAuth: true,
    roles: ["admin", "billing_admin"],
    permissions: ["billing:read"],
    prefetch: true,
  },
  "/admin": {
    requiresAuth: true,
    roles: ["admin"],
    permissions: ["admin"],
    prefetch: false,
  },
};

export function getRoutePolicy(path: string): RoutePolicy | null {
  return routePolicies[path] || null;
}
