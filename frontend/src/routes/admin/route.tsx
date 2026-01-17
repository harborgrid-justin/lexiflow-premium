/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { AdminDashboardView } from "./AdminDashboardView";
import { AdminLayout } from "./AdminLayout";
import { ErrorBoundary } from "./errors";
import { adminLoader } from "./loader";

/**
 * Admin Route Configuration
 * 
 * Defines the administration dashboard route with:
 * - RBAC enforcement (via loader)
 * - Deferred data loading (at layout level)
 * - Nested administration sub-routes
 */
export const adminRoute = {
  path: "admin",
  element: <AdminLayout />,
  loader: adminLoader,
  errorElement: <ErrorBoundary />,
  children: [
    {
      index: true,
      element: <AdminDashboardView />,
    }
  ],
};
